import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { CheckoutOrder } from '@/types/checkout';
import { ReceiptDocument, receiptQuantityLabel } from './ReceiptDocument';

function line(name: string, unitPrice: number, quantity: number) {
  return { productId: name, sku: name, name, originalPrice: unitPrice, unitPrice, quantity, isManualPrice: false, subtotal: unitPrice * quantity };
}

function order(items: ReturnType<typeof line>[]): CheckoutOrder {
  const itemsSubtotal = items.reduce((s, i) => s + i.subtotal, 0);
  return {
    id: 'ord-1', orderNumber: 'SO-20261121-0001', createdAt: '2026-11-21T09:30:00Z', cashierId: 'c', cashierName: 'Fred',
    status: 'completed', items, payments: [], itemsSubtotal, discountAmount: 0, shippingFee: 0, totalAmount: itemsSubtotal,
  } as unknown as CheckoutOrder;
}

describe('商品數量總計', () => {
  it('counts sold and returned units separately', () => {
    expect(receiptQuantityLabel(order([line('A', 500, 2), line('B', 80, 1)]).items)).toBe('3 件');
    expect(receiptQuantityLabel(order([line('A', 500, -1)]).items)).toBe('退貨 1 件');
    expect(receiptQuantityLabel(order([line('A', 500, 2), line('B', 80, -1)]).items)).toBe('2 件／退貨 1 件');
  });

  it.each(['screen', 'print'] as const)('shows the row on the %s receipt', (variant) => {
    render(<ReceiptDocument order={order([line('A', 500, 2), line('B', 80, 1)])} variant={variant} />);
    const label = screen.getByText('商品數量總計');
    expect(label.parentElement?.lastElementChild?.textContent).toBe('3 件');
    if (variant === 'print') expect(label.parentElement?.className).toBe('receipt-row');
  });
});
