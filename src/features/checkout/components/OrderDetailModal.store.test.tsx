import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { CheckoutOrder } from '@/types/checkout';
import { OrderDetailModal } from './OrderDetailModal';

function order(extra: Partial<CheckoutOrder>): CheckoutOrder {
  return {
    id: 'ord-1', orderNumber: 'SO-20261118-120000-0001', createdAt: '2026-11-18T04:00:00Z', updatedAt: '2026-11-18T04:00:00Z',
    cashierId: 'c', cashierName: 'Fred', status: 'completed', items: [], payments: [],
    itemsSubtotal: 0, shippingFee: 0, totalAmount: 0, discountAmount: 0,
    ...extra,
  } as CheckoutOrder;
}

describe('OrderDetailModal 門市', () => {
  it('shows the store name the caller resolved', () => {
    render(<OrderDetailModal open order={order({ branchId: '奇可門市' })} storeName="奇可門市" onClose={vi.fn()} />);
    expect(screen.getByTestId('order-detail-store')).toHaveTextContent('奇可門市');
  });

  it('never falls back to branchName or branchId', () => {
    const legacy = order({ branchId: 'branch-store', branchName: '台北旗艦店' });
    const { rerender } = render(<OrderDetailModal open order={legacy} storeName="" onClose={vi.fn()} />);
    expect(screen.queryByTestId('order-detail-store')).toBeNull();
    expect(screen.queryByText(/台北旗艦店|branch-store/)).toBeNull();
    rerender(<OrderDetailModal open order={legacy} onClose={vi.fn()} />);
    expect(screen.queryByTestId('order-detail-store')).toBeNull();
  });
});
