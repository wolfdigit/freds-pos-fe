import { beforeEach, describe, expect, it } from 'vitest';
import { setBoundCartUserId } from '@/auth/cartOwner';
import type { Customer } from '@/types/customer';
import type { Product } from '@/types/product';
import { useCartStore } from './cartStore';

const member: Customer = {
  id: 'cust-1',
  name: '王小明',
  phone: '0900000000',
  email: null,
  vipTier: 'Retail',
  vipTierName: '零售客戶 (Retail)',
  totalSpent: 0,
  createdAt: '2026-11-01T00:00:00Z',
  updatedAt: '2026-11-01T00:00:00Z',
};

const product: Product = {
  id: 'p',
  sku: 'SKU-P',
  normalizedSku: 'SKUP',
  barcode: 'p',
  brand: 'B',
  name: '模型',
  listPrice: 500,
  inventories: [],
  totalInventory: 5,
  loginStoreQuantity: 5,
  loginStoreReturnedQuantity: 0,
};

const cart = () => useCartStore.getState();

describe('cart 預購取貨', () => {
  beforeEach(() => {
    setBoundCartUserId('user-1');
    useCartStore.setState({ items: [], attachedCustomer: member, shippingFee: 0, orderNote: '', highlightedProductId: null });
  });

  it('marks and unmarks one sale line', () => {
    cart().addItem(product, 2);
    cart().setPreorderPickup('p', false, true);
    expect(cart().items[0]?.preorderPickup).toBe(true);
    cart().setPreorderPickup('p', false, false);
    expect(cart().items[0]?.preorderPickup).toBeUndefined();
  });

  it('works together with the points line: each line keeps its own flag', () => {
    cart().addItem(product, 2);
    cart().setPointsDiscount('p', true);
    cart().setPreorderPickup('p', true, true);
    const points = cart().items.find((i) => i.pointsDiscountApplied);
    const plain = cart().items.find((i) => !i.pointsDiscountApplied);
    expect(points?.preorderPickup).toBe(true);
    expect(points?.unitPrice).toBe(140);
    expect(plain?.preorderPickup).toBeUndefined();
  });
});
