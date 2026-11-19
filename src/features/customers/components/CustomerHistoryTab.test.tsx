import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CheckoutOrder, CheckoutOrderPage, OrderPageParams } from '@/types/checkout';
import { CUSTOMER_HISTORY_PAGE_SIZE, CustomerHistoryTab } from './CustomerHistoryTab';

const searchOrderPage = vi.fn<(params: OrderPageParams) => Promise<CheckoutOrderPage>>();
const getOrderHistory = vi.fn();

vi.mock('@/services', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services')>()),
  checkoutService: {
    searchOrderPage: (params: OrderPageParams) => searchOrderPage(params),
    getOrderHistory: (...args: unknown[]) => getOrderHistory(...args),
  },
}));

function order(n: number): CheckoutOrder {
  const createdAt = new Date(Date.UTC(2026, 10, 18, 10, 0, 0) - n * 60_000).toISOString();
  return {
    id: `order-${n}`,
    orderNumber: `SO-QA-${String(n).padStart(4, '0')}`,
    cashierId: 'staff-001',
    cashierName: '店長',
    customerId: 'member-1',
    status: 'completed',
    items: [
      {
        productId: `prod-${n}`,
        sku: `SKU-${n}`,
        name: `QA-商品${n}`,
        unitPrice: 100,
        originalPrice: 100,
        isManualPrice: false,
        quantity: 1,
        subtotal: 100,
        returnedQuantity: 0,
      },
    ],
    itemsSubtotal: 100,
    discountAmount: 0,
    shippingFee: 0,
    totalAmount: 100,
    payments: [{ type: 'cash', name: '現金', amount: 100 }],
    createdAt,
    updatedAt: createdAt,
  } as CheckoutOrder;
}

function pageOf(items: CheckoutOrder[], page: number, total: number): CheckoutOrderPage {
  return { items, page, pageSize: CUSTOMER_HISTORY_PAGE_SIZE, total };
}

describe('CustomerHistoryTab', () => {
  beforeEach(() => {
    searchOrderPage.mockReset();
    getOrderHistory.mockReset();
  });

  it('loads one page for the member and appends the next page with 載入更多', async () => {
    searchOrderPage
      .mockResolvedValueOnce(pageOf([order(1), order(2)], 1, 3))
      .mockResolvedValueOnce(pageOf([order(2), order(3)], 2, 3));

    render(<CustomerHistoryTab customerId="member-1" />);

    expect(await screen.findByText('SO-QA-0001')).toBeInTheDocument();
    expect(searchOrderPage).toHaveBeenLastCalledWith({
      customerId: 'member-1',
      page: 1,
      pageSize: CUSTOMER_HISTORY_PAGE_SIZE,
    });
    expect(getOrderHistory).not.toHaveBeenCalled();
    expect(screen.getByText(/已顯示 2 \/ 共 3 筆/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '載入更多' }));
    expect(await screen.findByText('SO-QA-0003')).toBeInTheDocument();
    expect(searchOrderPage).toHaveBeenLastCalledWith({
      customerId: 'member-1',
      page: 2,
      pageSize: CUSTOMER_HISTORY_PAGE_SIZE,
    });
    // 重複出現在兩頁的單據只列一次。
    expect(screen.getAllByText('SO-QA-0002')).toHaveLength(1);
    expect(screen.getByText(/已顯示 3 \/ 共 3 筆/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '載入更多' })).toBeNull();
  });

  it('does not query anything without a member id', async () => {
    render(<CustomerHistoryTab customerId="" />);
    expect(await screen.findByText('此會員目前無歷史結帳紀錄')).toBeInTheDocument();
    expect(searchOrderPage).not.toHaveBeenCalled();
    expect(getOrderHistory).not.toHaveBeenCalled();
  });
});
