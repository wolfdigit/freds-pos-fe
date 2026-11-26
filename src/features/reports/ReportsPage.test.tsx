import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { checkoutService, systemService } from '@/services';
import { useSessionStore } from '@/store/sessionStore';
import type { CheckoutOrder } from '@/types/checkout';
import type { StoreDto } from '@/types/system';
import { ReportsPage } from './ReportsPage';

const store = (name: string) => ({ name }) as StoreDto;

function order(id: string, branchName: string): CheckoutOrder {
  const createdAt = new Date().toISOString();
  return {
    id,
    orderNumber: `SO-${id}`,
    cashierId: 'acct-1',
    cashierName: '店員甲',
    status: 'completed',
    items: [{ productId: 'p1', sku: 'SKU-1', name: '模型', quantity: 1, unitPrice: 100, originalPrice: 100, subtotal: 100 }],
    itemsSubtotal: 100,
    discountAmount: 0,
    shippingFee: 0,
    totalAmount: 100,
    payments: [{ type: 'cash', name: '現金', amount: 100 }],
    branchId: branchName,
    branchName,
    createdAt,
    updatedAt: createdAt,
  } as CheckoutOrder;
}

describe('ReportsPage store buttons', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    useSessionStore.setState({ storeName: '' });
  });

  it('lists the login store, other stores, then 所有門市總計, and adds a store column only for all stores', async () => {
    useSessionStore.setState({ storeName: '奇可門市' });
    vi.spyOn(systemService, 'listStoreChoices').mockResolvedValue([store('台南快閃店'), store('奇可門市')]);
    const history = vi
      .spyOn(checkoutService, 'getOrderHistory')
      .mockImplementation(async (params) =>
        typeof params === 'object' && params.storeName
          ? [order('a', params.storeName)]
          : [order('a', '奇可門市'), order('b', '台南快閃店')]
      );
    vi.spyOn(checkoutService, 'getRecentOrders').mockResolvedValue([]);

    render(<ReportsPage />);
    const tabs = screen.getByTestId('report-store-tabs');
    await waitFor(() =>
      expect(within(tabs).getAllByRole('button').map((button) => button.textContent)).toEqual([
        '奇可門市',
        '台南快閃店',
        '所有門市總計',
      ])
    );
    expect(within(tabs).getByRole('button', { name: '奇可門市' })).toHaveAttribute('aria-pressed', 'true');
    await screen.findByText('SO-a');
    expect(screen.queryByRole('columnheader', { name: '門市' })).toBeNull();

    fireEvent.click(within(tabs).getByRole('button', { name: '所有門市總計' }));
    await screen.findByText('SO-b');
    expect(history).toHaveBeenLastCalledWith(expect.not.objectContaining({ storeName: expect.anything() }));
    expect(screen.getByRole('columnheader', { name: '門市' })).toBeInTheDocument();
    expect(screen.getAllByTestId('report-order-store').map((cell) => cell.textContent).sort()).toEqual(['台南快閃店', '奇可門市']);
  });
});
