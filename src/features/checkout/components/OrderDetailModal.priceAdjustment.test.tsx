import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { CheckoutOrder } from '@/types/checkout';
import { OrderDetailModal } from './OrderDetailModal';

function line(name: string, originalPrice: number, unitPrice: number, quantity: number) {
  return {
    productId: name, sku: name, name, originalPrice, unitPrice, quantity,
    isManualPrice: originalPrice !== unitPrice, subtotal: unitPrice * quantity,
  };
}

function order(items: ReturnType<typeof line>[], shippingFee = 0): CheckoutOrder {
  const itemsSubtotal = items.reduce((s, i) => s + i.subtotal, 0);
  return {
    id: 'ord-1', orderNumber: 'SO-20261118-120000-0001', createdAt: '2026-11-18T04:00:00Z',
    cashierId: 'c', cashierName: 'Fred', status: 'completed', items, payments: [],
    itemsSubtotal, shippingFee, totalAmount: itemsSubtotal + shippingFee,
    discountAmount: items.reduce((s, i) => s + (i.originalPrice - i.unitPrice) * i.quantity, 0),
  } as unknown as CheckoutOrder;
}

function rowValue(label: string): string | null | undefined {
  const matches = screen.getAllByText(label);
  return matches[matches.length - 1].parentElement?.lastElementChild?.textContent;
}

describe('OrderDetailModal 商品原價 + 價格調整', () => {
  it('adds a markdown and a markup up to the total', () => {
    render(<OrderDetailModal open order={order([line('A', 350, 280, 1), line('B', 350, 400, 1)], 65)} onClose={vi.fn()} />);
    expect(rowValue('商品原價')).toBe('NT$ 700');
    expect(rowValue('價格調整')).toBe('-NT$ 20');
    expect(rowValue('實收總金額')).toBe('NT$ 745'); // 700 - 20 + 65
    expect(screen.queryByText(/折讓|商品小計|含價格調整/)).not.toBeInTheDocument();
  });

  it('hides the adjustment when no price changed', () => {
    render(<OrderDetailModal open order={order([line('A', 350, 350, 2)])} onClose={vi.fn()} />);
    expect(rowValue('商品原價')).toBe('NT$ 700');
    expect(screen.queryByText('價格調整')).not.toBeInTheDocument();
  });

  it('keeps reversed return lines adding up to the refund', () => {
    // 退貨原價 500 改退 400：原價 -500 + 調整 +100 = 退款 -400
    render(<OrderDetailModal open order={order([line('R', 500, 400, -1)])} onClose={vi.fn()} />);
    expect(rowValue('商品原價')).toBe('NT$ -500');
    expect(rowValue('價格調整')).toBe('+NT$ 100');
    expect(rowValue('實收總金額')).toBe('NT$ -400');
  });
});
