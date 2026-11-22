import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { bindCartToUser } from '@/auth/cartPersistence';
import { productService } from '@/services';
import { useCartStore } from '@/store/cartStore';
import { useToastStore } from '@/components/feedback/toastStore';
import type { Product, ProductPageParams } from '@/types/product';
import { CheckoutPage } from './CheckoutPage';

function product(sku: string, barcode: string): Product {
  return {
    id: `prod-${sku}`,
    sku,
    normalizedSku: sku.replace(/[^A-Za-z0-9]/g, '').toUpperCase(),
    barcode,
    brand: 'QA',
    name: `QA-${sku}`,
    listPrice: 100,
    inventories: [],
    totalInventory: 5,
    loginStoreQuantity: 5,
    loginStoreReturnedQuantity: 0,
    status: 'active',
    deleted: false,
  } as unknown as Product;
}

const OLD = product('OLD-1', '4710000000011');
const NEW = product('NEW-2', '4710000000028');

describe('CheckoutPage search Enter (regression)', () => {
  beforeEach(() => {
    localStorage.clear();
    bindCartToUser('acct-qa');
    useCartStore.getState().clearCart();
    vi.spyOn(productService, 'searchProductPage').mockImplementation(async (params: ProductPageParams) => {
      const q = (params.keyword ?? '').trim().toUpperCase();
      const items = [OLD, NEW].filter((p) => !q || p.sku.includes(q) || p.barcode.includes(q));
      return { items, page: 1, pageSize: 50, total: items.length };
    });
    vi.spyOn(productService, 'getProductsByBarcode').mockImplementation(async (code: string) =>
      [OLD, NEW].filter((p) => p.barcode === code.trim())
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    useCartStore.getState().clearCart();
    bindCartToUser(null);
  });

  it('adds the product for the code just scanned, not the previous result', async () => {
    render(<CheckoutPage />);
    const input = screen.getByPlaceholderText('掃描條碼 / 貨號 / 品名...');
    fireEvent.change(input, { target: { value: 'OLD-1' } });
    await waitFor(() => expect(screen.getAllByText('QA-OLD-1').length).toBeGreaterThan(0));
    // 等 OLD-1 的搜尋結果出來（清單只剩 OLD-1）。
    await waitFor(() => expect(screen.queryAllByText('QA-NEW-2')).toHaveLength(0));

    // 新條碼打完立刻 Enter，搜尋結果還沒更新。
    fireEvent.change(input, { target: { value: '4710000000028' } });
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    await waitFor(() => expect(useCartStore.getState().items).toHaveLength(1));
    expect(useCartStore.getState().items[0].productId).toBe('prod-NEW-2');
    await waitFor(() => expect(input).toHaveValue(''));
  });

  it('shows not found for an unknown code instead of adding the stale result', async () => {
    useToastStore.setState({ toasts: [] });
    render(<CheckoutPage />);
    const input = screen.getByPlaceholderText('掃描條碼 / 貨號 / 品名...');
    fireEvent.change(input, { target: { value: 'OLD-1' } });
    await waitFor(() => expect(screen.queryAllByText('QA-NEW-2')).toHaveLength(0));
    fireEvent.change(input, { target: { value: '9999999999999' } });
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    await waitFor(() =>
      expect(useToastStore.getState().toasts.map((t) => t.message)).toContain('查無符合之商品，請確認條碼或貨號')
    );
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(input).toHaveValue('9999999999999');
  });
});
