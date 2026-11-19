import { beforeEach, describe, expect, it } from 'vitest';
import { setBoundCartUserId } from '@/auth/cartOwner';
import type { Customer } from '@/types/customer';
import type { Product } from '@/types/product';
import { pointsDiscountedPrice, useCartStore, type CartItem } from './cartStore';

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

function product(id: string, listPrice: number): Product {
  return {
    id,
    sku: `SKU-${id}`,
    normalizedSku: `SKU${id}`,
    barcode: id,
    brand: 'B',
    name: `模型-${id}`,
    listPrice,
    inventories: [],
    totalInventory: 5,
    loginStoreQuantity: 5,
    loginStoreReturnedQuantity: 0,
  };
}

const cart = () => useCartStore.getState();
const lines = (productId: string): CartItem[] => cart().items.filter((i) => i.productId === productId);
const pointsLine = (productId: string) => lines(productId).find((i) => i.pointsDiscountApplied);
const plainLine = (productId: string) => lines(productId).find((i) => !i.pointsDiscountApplied);

describe('cart points discount (點數折抵 $360)', () => {
  beforeEach(() => {
    setBoundCartUserId('user-1');
    useCartStore.setState({ items: [], attachedCustomer: member, shippingFee: 0, orderNote: '', highlightedProductId: null });
  });

  it('takes 360 off the unit price and floors it at 0', () => {
    expect(pointsDiscountedPrice(500)).toBe(140);
    expect(pointsDiscountedPrice(360)).toBe(0);
    expect(pointsDiscountedPrice(200)).toBe(0);

    cart().addItem(product('a', 500));
    cart().addItem(product('b', 200));
    cart().setPointsDiscount('a', true);
    cart().setPointsDiscount('b', true);
    expect(pointsLine('a')).toMatchObject({ unitPrice: 140, quantity: 1, pointsBasePrice: 500 });
    expect(pointsLine('b')).toMatchObject({ unitPrice: 0, quantity: 1, pointsBasePrice: 200 });
    expect(cart().getSubtotal()).toBe(140);
  });

  it('restores the price when unchecked', () => {
    cart().addItem(product('a', 500));
    cart().setPointsDiscount('a', true);
    cart().setPointsDiscount('a', false);
    expect(lines('a')).toEqual([expect.objectContaining({ unitPrice: 500, quantity: 1 })]);
    expect(lines('a')[0].pointsDiscountApplied).toBeUndefined();
  });

  it('uses the current manual price as the base', () => {
    cart().addItem(product('a', 500));
    cart().updateItemPrice('a', 450, '現場改價');
    cart().setPointsDiscount('a', true);
    expect(pointsLine('a')).toMatchObject({ unitPrice: 90, isManualPrice: true, pointsBasePrice: 450 });
    cart().setPointsDiscount('a', false);
    expect(lines('a')[0]).toMatchObject({ unitPrice: 450, isManualPrice: true });
  });

  it('splits one unit off a multi-unit line so a product is discounted at most 360', () => {
    cart().addItem(product('a', 500), 3);
    cart().setPointsDiscount('a', true);
    expect(plainLine('a')).toMatchObject({ quantity: 2, unitPrice: 500 });
    expect(pointsLine('a')).toMatchObject({ quantity: 1, unitPrice: 140 });
    expect(cart().getSubtotal()).toBe(1500 - 360);

    // 折抵列固定 1 件，加數量或再掃同商品都進一般列。
    cart().updateItemQuantity('a', 5, true);
    expect(pointsLine('a')?.quantity).toBe(1);
    cart().addItem(product('a', 500));
    expect(plainLine('a')?.quantity).toBe(3);
    expect(pointsLine('a')?.quantity).toBe(1);

    // 一般列改價不會動到折抵列。
    cart().updateItemPrice('a', 480, '現場改價');
    expect(pointsLine('a')?.unitPrice).toBe(140);

    // 取消勾選併回一般列。
    cart().setPointsDiscount('a', false);
    expect(lines('a')).toEqual([expect.objectContaining({ quantity: 4, unitPrice: 480 })]);
  });

  it('allows only one points line per product', () => {
    cart().addItem(product('a', 500), 2);
    cart().setPointsDiscount('a', true);
    cart().setPointsDiscount('a', true);
    expect(lines('a').filter((i) => i.pointsDiscountApplied)).toHaveLength(1);
    expect(plainLine('a')?.quantity).toBe(1);
  });

  it('removes only the line that was asked for', () => {
    cart().addItem(product('a', 500), 2);
    cart().setPointsDiscount('a', true);
    cart().removeItem('a', true);
    expect(lines('a')).toEqual([expect.objectContaining({ quantity: 1, unitPrice: 500 })]);
  });

  it('cannot be applied without a member, and detaching the member restores prices', () => {
    useCartStore.setState({ attachedCustomer: null });
    cart().addItem(product('a', 500));
    cart().setPointsDiscount('a', true);
    expect(pointsLine('a')).toBeUndefined();

    cart().attachCustomer(member);
    cart().addItem(product('b', 500), 2);
    cart().setPointsDiscount('a', true);
    cart().setPointsDiscount('b', true);
    expect(cart().items.filter((i) => i.pointsDiscountApplied)).toHaveLength(2);

    cart().attachCustomer(null);
    expect(cart().items.some((i) => i.pointsDiscountApplied)).toBe(false);
    expect(lines('a')).toEqual([expect.objectContaining({ quantity: 1, unitPrice: 500 })]);
    expect(lines('b')).toEqual([expect.objectContaining({ quantity: 2, unitPrice: 500 })]);
  });
});
