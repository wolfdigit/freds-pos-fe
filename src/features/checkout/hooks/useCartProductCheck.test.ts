import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CartItem } from '@/store/cartStore';
import type { CartProductAvailability } from '@/types/product';

const checkProductAvailability = vi.fn<(id: string) => Promise<CartProductAvailability>>();

vi.mock('@/services', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services')>()),
  productService: {
    checkProductAvailability: (id: string) => checkProductAvailability(id),
  },
}));

import { useCartStore } from '@/store/cartStore';
import { useSessionStore } from '@/store/sessionStore';
import { blockingCartItems, unavailableReason, useCartProductCheck } from './useCartProductCheck';

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

const STATES: Record<string, CartProductAvailability> = {
  ok: 'available',
  gone: 'missing',
  off: 'delisted',
  elsewhere: 'notInStore',
  flaky: 'unknown',
};

describe('useCartProductCheck', () => {
  beforeEach(() => {
    checkProductAvailability.mockReset();
    checkProductAvailability.mockImplementation(async (id) => STATES[id] ?? 'available');
  });

  it('marks products the backend no longer has when a saved cart is restored', async () => {
    const items = [item('ok'), item('gone'), item('flaky')];
    useCartStore.setState({ items });
    const { result } = renderHook(() => useCartProductCheck(items));

    await waitFor(() => expect(result.current.unavailable).toEqual({ gone: 'missing' }));
    expect(checkProductAvailability.mock.calls.map(([id]) => id).sort()).toEqual(['flaky', 'gone', 'ok']);
    // 斷線或逾時（unknown）不標示，交給後端結帳時判斷。
    expect(blockingCartItems(items, result.current.unavailable).map((i) => i.productId)).toEqual(['gone']);
    expect(unavailableReason(items[1], result.current.unavailable)).toContain('已不存在');
  });

  it('blocks selling a delisted product but still allows returning it', async () => {
    const sale = item('off', 1);
    const ret = { ...item('off', -1), originalOrderId: 'ord-1', originalOrderItemId: 'oli-1' };
    useCartStore.setState({ items: [sale, ret] });
    const { result } = renderHook(() => useCartProductCheck([sale, ret]));

    await waitFor(() => expect(result.current.unavailable).toEqual({ off: 'delisted' }));
    expect(blockingCartItems([sale, ret], result.current.unavailable)).toEqual([sale]);
    expect(unavailableReason(ret, result.current.unavailable)).toBeNull();
  });

  it('revalidate re-reads the current cart and returns the latest result for the submit check', async () => {
    const items = [item('ok')];
    useCartStore.setState({ items });
    const { result } = renderHook(() => useCartProductCheck(items));
    await waitFor(() => expect(checkProductAvailability).toHaveBeenCalledTimes(1));

    // 例如另一台裝置刪了商品，送出前再查一次。
    checkProductAvailability.mockResolvedValue('missing');
    let latest = {};
    await act(async () => {
      latest = await result.current.revalidate();
    });
    expect(latest).toEqual({ ok: 'missing' });
    expect(result.current.unavailable).toEqual({ ok: 'missing' });
  });

  it('blocks selling a product the login store does not sell but still allows returning it', async () => {
    const sale = item('elsewhere', 1);
    const ret = { ...item('elsewhere', -1), originalOrderId: 'ord-1', originalOrderItemId: 'oli-1' };
    useCartStore.setState({ items: [sale, ret] });
    const { result } = renderHook(() => useCartProductCheck([sale, ret]));

    await waitFor(() => expect(result.current.unavailable).toEqual({ elsewhere: 'notInStore' }));
    expect(blockingCartItems([sale, ret], result.current.unavailable)).toEqual([sale]);
    expect(unavailableReason(sale, result.current.unavailable)).toContain('本門市未販售');
    expect(unavailableReason(ret, result.current.unavailable)).toBeNull();
  });

  it('checks the cart again after switching the login store', async () => {
    useSessionStore.setState({ storeName: '奇可門市' });
    const items = [item('ok')];
    useCartStore.setState({ items });
    const { result } = renderHook(() => useCartProductCheck(items));
    await waitFor(() => expect(checkProductAvailability).toHaveBeenCalledTimes(1));
    expect(result.current.unavailable).toEqual({});

    // 換到只販售清單商品、清單沒有這個商品的門市。
    checkProductAvailability.mockResolvedValue('notInStore');
    act(() => {
      useSessionStore.setState({ storeName: '台南快閃店' });
    });
    await waitFor(() => expect(result.current.unavailable).toEqual({ ok: 'notInStore' }));
    expect(checkProductAvailability).toHaveBeenCalledTimes(2);
  });

  it('does not call the backend for an empty cart', async () => {
    useCartStore.setState({ items: [] });
    const { result } = renderHook(() => useCartProductCheck([]));
    expect(result.current.unavailable).toEqual({});
    expect(checkProductAvailability).not.toHaveBeenCalled();
  });
});
