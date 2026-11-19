import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { CheckoutOrder } from '@/types/checkout';
import { OrderDetailModal } from './OrderDetailModal';
import { ReceiptDocument } from './ReceiptDocument';

function line(name: string, originalPrice: number, unitPrice: number, quantity: number, points = false) {
  return {
    productId: name, sku: name, name, originalPrice, unitPrice, quantity,
    isManualPrice: originalPrice !== unitPrice && !points, subtotal: unitPrice * quantity,
    pointsDiscountApplied: points,
  };
}

function order(items: ReturnType<typeof line>[], shippingFee = 0): CheckoutOrder {
  const itemsSubtotal = items.reduce((s, i) => s + i.subtotal, 0);
  return {
    id: 'ord-1', orderNumber: 'SO-20261118-120000-0001', createdAt: '2026-11-18T04:00:00Z',
    cashierId: 'c', cashierName: 'Fred', status: 'completed', items, payments: [],
    itemsSubtotal, shippingFee, totalAmount: itemsSubtotal + shippingFee,
    discountAmount: items.filter((i) => !i.pointsDiscountApplied).reduce((s, i) => s + (i.originalPrice - i.unitPrice) * i.quantity, 0),
    pointsDiscountAmount: items.filter((i) => i.pointsDiscountApplied).reduce((s, i) => s + (i.originalPrice - i.unitPrice) * i.quantity, 0),
  } as unknown as CheckoutOrder;
}

function rowValue(label: string): string | null | undefined {
  const matches = screen.getAllByText(label);
  return matches[matches.length - 1].parentElement?.lastElementChild?.textContent;
}

const mixed = () =>
  order([line('A', 500, 500, 2), line('B', 500, 450, 1), line('A', 500, 140, 1, true), line('C', 80, 0, 1, true)], 60);

describe('OrderDetailModal 商品原價 / 價格調整 / 點數折抵', () => {
  it('shows 點數折抵 on its own line and adds up to the total', () => {
    render(<OrderDetailModal open order={mixed()} onClose={vi.fn()} />);
    expect(rowValue('商品原價')).toBe('NT$ 2,080');
    expect(rowValue('價格調整')).toBe('-NT$ 50');
    expect(rowValue('點數折抵')).toBe('-NT$ 440'); // 360 + 80（80 元商品只折到 0）
    expect(rowValue('實收總金額')).toBe('NT$ 1,650'); // 2080 - 50 - 440 + 60
  });

  it('hides 價格調整 when only points changed the price', () => {
    render(<OrderDetailModal open order={order([line('A', 500, 140, 1, true)])} onClose={vi.fn()} />);
    expect(rowValue('商品原價')).toBe('NT$ 500');
    expect(screen.queryByText('價格調整')).not.toBeInTheDocument();
    expect(rowValue('點數折抵')).toBe('-NT$ 360');
    expect(rowValue('實收總金額')).toBe('NT$ 140');
  });

  it('reverses 點數折抵 on a return of a points line', () => {
    render(<OrderDetailModal open order={order([line('A', 500, 140, -1, true)])} onClose={vi.fn()} />);
    expect(rowValue('商品原價')).toBe('NT$ -500');
    expect(rowValue('點數折抵')).toBe('+NT$ 360');
    expect(rowValue('實收總金額')).toBe('NT$ -140');
  });
});

describe('ReceiptDocument 點數折抵', () => {
  it('labels the points line delta and totals 商品原價 / 價格調整 / 點數折抵', () => {
    render(<ReceiptDocument order={mixed()} variant="screen" />);
    expect(rowValue('商品原價')).toBe('NT$ 2,080');
    expect(rowValue('價格調整')).toBe('-NT$ 50');
    expect(rowValue('點數折抵')).toBe('-NT$ 440');
    expect(rowValue('結帳總額')).toBe('NT$ 1,650');
    // 每一個點數列下面各有一列「點數折抵」，加上合計那一列。
    expect(screen.getAllByText('點數折抵')).toHaveLength(3);
    expect(screen.queryByText(/（點數折抵）/)).not.toBeInTheDocument();
  });
});
