import { beforeEach, describe, expect, it } from 'vitest';
import type { Product } from '@/types/product';
import { useCartStore } from '@/store/cartStore';
import {
  LEGACY_CART_STORAGE_KEY,
  bindCartToUser,
  cartStorageKey,
  clearLegacyUnownedCart,
  handleCartStorageEvent,
  readPersistedCart,
} from './cartPersistence';

const product = {
  id: 'p1',
  sku: 'SKU-1',
  name: '模型',
  brand: 'Fred',
  listPrice: 100,
  inventories: [{ location: 'e1a10001-0000-4000-8000-000000000001', locationName: '門市現貨', quantity: 3 }],
  totalInventory: 3,
  loginStoreQuantity: 3,
  loginStoreReturnedQuantity: 0,
} as Product;

describe('per-account cart', () => {
  beforeEach(() => {
    localStorage.clear();
    bindCartToUser(null);
  });

  it('clears only the legacy unowned key', () => {
    localStorage.setItem(LEGACY_CART_STORAGE_KEY, '{"state":{"items":[1]}}');
    localStorage.setItem(cartStorageKey('acct-a'), '{"items":[{"productId":"keep"}]}');
    localStorage.setItem('freds-pos-theme', '{"state":{"theme":"dark"}}');
    localStorage.setItem('AUTH_TOKEN', 'keep-token');
    localStorage.setItem('FREDS_POS_SESSION', '{"state":{"storeName":"奇可門市"}}');
    localStorage.setItem('USE_MOCK', 'false');

    clearLegacyUnownedCart();
    clearLegacyUnownedCart();

    expect(localStorage.getItem(LEGACY_CART_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(cartStorageKey('acct-a'))).toContain('keep');
    expect(localStorage.getItem('freds-pos-theme')).toContain('dark');
    expect(localStorage.getItem('AUTH_TOKEN')).toBe('keep-token');
    expect(localStorage.getItem('FREDS_POS_SESSION')).toContain('奇可門市');
    expect(localStorage.getItem('USE_MOCK')).toBe('false');
  });

  it('keeps carts across logout and restores only the same account', () => {
    bindCartToUser('acct-a');
    useCartStore.getState().addItem(product, 2);
    useCartStore.getState().setShippingFee(40);
    useCartStore.getState().setOrderNote('保留');
    bindCartToUser(null);

    expect(useCartStore.getState().items).toEqual([]);
    expect(readPersistedCart('acct-a').items).toHaveLength(1);
    expect(readPersistedCart('acct-a').shippingFee).toBe(40);
    expect(readPersistedCart('acct-a').orderNote).toBe('保留');

    bindCartToUser('acct-b');
    expect(useCartStore.getState().items).toEqual([]);
    useCartStore.getState().addItem(product, 1);
    expect(readPersistedCart('acct-a').items[0]?.quantity).toBe(2);
    expect(readPersistedCart('acct-b').items).toHaveLength(1);

    bindCartToUser('acct-a');
    expect(useCartStore.getState().items[0]?.quantity).toBe(2);
    expect(useCartStore.getState().orderNote).toBe('保留');
  });

  it('does not let an unbound session operate or leak another tab of the same account incorrectly', () => {
    useCartStore.getState().addItem(product, 4);
    expect(useCartStore.getState().items).toEqual([]);
    expect(localStorage.getItem(LEGACY_CART_STORAGE_KEY)).toBeNull();

    bindCartToUser('acct-a');
    useCartStore.getState().addItem(product, 1);
    const otherTab = JSON.stringify({
      items: [{ ...useCartStore.getState().items[0], quantity: 5 }],
      attachedCustomer: null,
      shippingFee: 0,
      orderNote: '',
    });
    handleCartStorageEvent(new StorageEvent('storage', { key: cartStorageKey('acct-b'), newValue: otherTab }));
    expect(useCartStore.getState().items[0]?.quantity).toBe(1);

    handleCartStorageEvent(new StorageEvent('storage', { key: cartStorageKey('acct-a'), newValue: otherTab }));
    expect(useCartStore.getState().items[0]?.quantity).toBe(5);
    expect(readPersistedCart('acct-a').items[0]?.quantity).toBe(1);
  });
});
