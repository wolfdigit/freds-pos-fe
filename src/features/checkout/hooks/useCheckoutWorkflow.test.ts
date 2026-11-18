import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CartItem } from '@/store/cartStore';
import type { CheckoutReceipt, CreateOrderPayload, PaymentTender } from '@/types/checkout';
import { ApiError } from '@/services/api/httpClient';

const createCheckoutOrder = vi.fn<(payload: CreateOrderPayload, key?: string) => Promise<CheckoutReceipt>>();

vi.mock('@/services', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services')>()),
  checkoutService: {
    createCheckoutOrder: (payload: CreateOrderPayload, key?: string) => createCheckoutOrder(payload, key),
  },
}));

import { useCartStore } from '@/store/cartStore';
import { useSessionStore } from '@/store/sessionStore';
import { useToastStore } from '@/components/feedback/toastStore';
import { CHECKOUT_IDEMPOTENCY_STORAGE_KEY, clearCheckoutKey } from '../checkoutIdempotency';
import {
  CHECKOUT_PRODUCT_NOT_FOUND_MESSAGE,
  CHECKOUT_UNCERTAIN_MESSAGE,
  useCheckoutWorkflow,
} from './useCheckoutWorkflow';

const cash: PaymentTender[] = [{ type: 'cash', name: '現金', amount: 100 }];

function item(productId: string, quantity = 1): CartItem {
  return {
    productId,
    sku: `SKU-${productId}`,
    name: `QA-${productId}`,
    brand: 'Fred',
    originalPrice: 100,
    unitPrice: 100,
    isManualPrice: false,
    quantity,
  };
}

function receipt(orderNumber: string): CheckoutReceipt {
  return { order: { orderNumber } } as CheckoutReceipt;
}

function timeout(): ApiError {
  return new ApiError('API 請求逾時（超過 60 秒）：/checkout/orders', 408, 'Request Timeout', '/checkout/orders');
}

function setCart(items: CartItem[]) {
  useCartStore.setState({ items, attachedCustomer: null, shippingFee: 0, orderNote: '' });
}

function keysUsed(): (string | undefined)[] {
  return createCheckoutOrder.mock.calls.map(([, key]) => key);
}

function toasts(): string[] {
  return useToastStore.getState().toasts.map((t) => t.message);
}

describe('useCheckoutWorkflow idempotency key', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearCheckoutKey();
    createCheckoutOrder.mockReset();
    useSessionStore.setState({ storeName: '奇可門市' });
    useToastStore.setState({ toasts: [] });
    setCart([item('p1')]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('automatically retries a timed-out checkout once with the same key', async () => {
    createCheckoutOrder.mockRejectedValueOnce(timeout()).mockResolvedValueOnce(receipt('SO-1'));
    const { result } = renderHook(() => useCheckoutWorkflow());

    let out: CheckoutReceipt | null = null;
    await act(async () => {
      out = await result.current.submitCheckout(cash);
    });

    expect(out).toEqual(receipt('SO-1'));
    const keys = keysUsed();
    expect(keys).toHaveLength(2);
    expect(keys[0]).toBeTruthy();
    expect(keys[1]).toBe(keys[0]);
    expect(sessionStorage.getItem(CHECKOUT_IDEMPOTENCY_STORAGE_KEY)).toBeNull();
  });

  it('reports an uncertain result instead of failure and reuses the key on manual retry', async () => {
    createCheckoutOrder
      .mockRejectedValueOnce(timeout())
      .mockRejectedValueOnce(new ApiError('無法連線至 API 伺服器', 0, 'Network Error', '/checkout/orders'))
      .mockResolvedValueOnce(receipt('SO-1'));
    const { result } = renderHook(() => useCheckoutWorkflow());

    await act(async () => {
      expect(await result.current.submitCheckout(cash)).toBeNull();
    });
    expect(toasts()).toContain(CHECKOUT_UNCERTAIN_MESSAGE);
    expect(toasts()).not.toContain('結帳失敗，請稍後再試');
    expect(useCartStore.getState().items).toHaveLength(1);

    await act(async () => {
      await result.current.submitCheckout(cash);
    });

    const keys = keysUsed();
    expect(keys).toHaveLength(3);
    expect(new Set(keys).size).toBe(1);
  });

  it('keeps the key across a page reload while the cart is unchanged', async () => {
    createCheckoutOrder.mockRejectedValue(timeout());
    const first = renderHook(() => useCheckoutWorkflow());
    await act(async () => {
      await first.result.current.submitCheckout(cash);
    });
    first.unmount();
    // 模擬重新整理：記憶體狀態不見，只剩 sessionStorage。
    const stored = sessionStorage.getItem(CHECKOUT_IDEMPOTENCY_STORAGE_KEY);
    expect(stored).not.toBeNull();
    clearCheckoutKeyMemoryOnly(stored!);

    createCheckoutOrder.mockReset();
    createCheckoutOrder.mockResolvedValueOnce(receipt('SO-1'));
    const second = renderHook(() => useCheckoutWorkflow());
    await act(async () => {
      await second.result.current.submitCheckout(cash);
    });
    expect(keysUsed()[0]).toBe(JSON.parse(stored!).key);
  });

  it('uses a new key for the next order after a successful checkout', async () => {
    createCheckoutOrder.mockResolvedValueOnce(receipt('SO-1')).mockResolvedValueOnce(receipt('SO-2'));
    const { result } = renderHook(() => useCheckoutWorkflow());

    await act(async () => {
      await result.current.submitCheckout(cash);
    });
    // 同一個商品再賣一次，是新的一筆單。
    act(() => setCart([item('p1')]));
    await act(async () => {
      await result.current.submitCheckout(cash);
    });

    const keys = keysUsed();
    expect(keys).toHaveLength(2);
    expect(keys[1]).not.toBe(keys[0]);
  });

  it('uses a new key when the cart or payment changes after a failed attempt', async () => {
    createCheckoutOrder.mockRejectedValue(new ApiError('庫存不足', 409, 'Conflict', '/checkout/orders'));
    const { result } = renderHook(() => useCheckoutWorkflow());

    await act(async () => {
      await result.current.submitCheckout(cash);
    });
    act(() => setCart([item('p1', 2)]));
    await act(async () => {
      await result.current.submitCheckout(cash);
    });
    await act(async () => {
      await result.current.submitCheckout([{ type: 'line_pay', name: 'LINE Pay', amount: 100 }]);
    });

    const keys = keysUsed();
    expect(keys).toHaveLength(3);
    expect(new Set(keys).size).toBe(3);
    // 明確失敗不自動重送。
    expect(toasts()).toContain('庫存不足');
  });

  it('ignores a second submit while the first is in flight', async () => {
    let resolve!: (r: CheckoutReceipt) => void;
    createCheckoutOrder.mockImplementationOnce(() => new Promise((r) => (resolve = r)));
    const { result } = renderHook(() => useCheckoutWorkflow());

    let firstCall!: Promise<CheckoutReceipt | null>;
    let second: CheckoutReceipt | null = receipt('unexpected');
    await act(async () => {
      firstCall = result.current.submitCheckout(cash);
      second = await result.current.submitCheckout(cash);
    });
    expect(second).toBeNull();
    await act(async () => {
      resolve(receipt('SO-1'));
      await firstCall;
    });
    expect(createCheckoutOrder).toHaveBeenCalledTimes(1);
  });

  it('treats PRODUCT_NOT_FOUND as a definite failure: no retry, clear message, fresh key next time', async () => {
    const missing = new ApiError(
      '找不到商品 (ID: prod-gone)',
      404,
      'Not Found',
      '/checkout/orders',
      { code: 'PRODUCT_NOT_FOUND', message: '找不到商品 (ID: prod-gone)' },
      'PRODUCT_NOT_FOUND'
    );
    createCheckoutOrder.mockRejectedValueOnce(missing);
    const onProductNotFound = vi.fn();
    const { result } = renderHook(() => useCheckoutWorkflow({ onProductNotFound }));

    await act(async () => {
      expect(await result.current.submitCheckout(cash)).toBeNull();
    });

    expect(createCheckoutOrder).toHaveBeenCalledTimes(1);
    expect(onProductNotFound).toHaveBeenCalledTimes(1);
    const shown = toasts();
    expect(shown).toHaveLength(1);
    expect(shown[0]).toContain(CHECKOUT_PRODUCT_NOT_FOUND_MESSAGE);
    expect(shown[0]).toContain('prod-gone');
    expect(shown).not.toContain(CHECKOUT_UNCERTAIN_MESSAGE);
    // 沒有建單，購物車留著讓收銀員移除商品；key 已清掉。
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(sessionStorage.getItem(CHECKOUT_IDEMPOTENCY_STORAGE_KEY)).toBeNull();
  });
});

/** 只清掉模組內的記憶體副本，保留 sessionStorage，等同於頁面重新載入。 */
function clearCheckoutKeyMemoryOnly(stored: string) {
  clearCheckoutKey();
  sessionStorage.setItem(CHECKOUT_IDEMPOTENCY_STORAGE_KEY, stored);
}
