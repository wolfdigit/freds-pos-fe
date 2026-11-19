import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CheckoutOrder, CheckoutOrderPage, OrderPageParams } from '@/types/checkout';
import { buildReturnOrderFilters, ReturnOrderModal, RETURN_ORDER_PAGE_SIZE } from './ReturnOrderModal';

const searchOrderPage = vi.fn<(params: OrderPageParams) => Promise<CheckoutOrderPage>>();
const getOrderHistory = vi.fn();

vi.mock('@/services', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services')>()),
  checkoutService: {
    searchOrderPage: (params: OrderPageParams) => searchOrderPage(params),
    getOrderHistory: (...args: unknown[]) => getOrderHistory(...args),
  },
}));

function order(n: number, quantity = 2, returnedQuantity = 0): CheckoutOrder {
  const createdAt = new Date(Date.UTC(2026, 10, 18, 10, 0, 0) - n * 60_000).toISOString();
  return {
    id: `order-${n}`,
    orderNumber: `SO-20261118-1800${String(n).padStart(2, '0')}-0001`,
    cashierId: 'staff-001',
    cashierName: '店長',
    status: returnedQuantity > 0 ? 'partially_refunded' : 'completed',
    items: [
      {
        productId: `prod-${n}`,
        sku: `SKU-${n}`,
        name: `QA-商品${n}`,
        unitPrice: 100,
        originalPrice: 100,
        isManualPrice: false,
        quantity,
        subtotal: 100 * quantity,
        returnedQuantity,
      },
    ],
    itemsSubtotal: 100 * quantity,
    discountAmount: 0,
    shippingFee: 0,
    totalAmount: 100 * quantity,
    payments: [],
    createdAt,
    updatedAt: createdAt,
  };
}

function pageOf(items: CheckoutOrder[], page: number, total: number): CheckoutOrderPage {
  return { items, page, pageSize: RETURN_ORDER_PAGE_SIZE, total };
}

describe('ReturnOrderModal', () => {
  beforeEach(() => {
    searchOrderPage.mockReset();
    getOrderHistory.mockReset();
  });

  it('loads only the first page on open and never fetches the whole history', async () => {
    searchOrderPage.mockResolvedValueOnce(pageOf([order(1, 3, 1)], 1, 9000));

    render(<ReturnOrderModal open onClose={vi.fn()} />);

    expect(await screen.findByText('SO-20261118-180001-0001')).toBeInTheDocument();
    expect(searchOrderPage).toHaveBeenCalledTimes(1);
    expect(searchOrderPage.mock.calls[0][0]).toMatchObject({ page: 1, pageSize: RETURN_ORDER_PAGE_SIZE });
    expect(getOrderHistory).not.toHaveBeenCalled();
    // 可退 = 原購 - 已退，直接來自該張訂單的品項。
    expect(screen.getByText('可退: 2 件')).toBeInTheDocument();
    expect(screen.getByText(/已顯示 1 \/ 共 9000 張單據/)).toBeInTheDocument();
  });

  it('sends the filters to the server and pages with 載入更多 using the same filters', async () => {
    searchOrderPage
      .mockResolvedValueOnce(pageOf([order(1)], 1, 1))
      .mockResolvedValueOnce(pageOf([order(2), order(3)], 1, 3))
      .mockResolvedValueOnce(pageOf([order(3), order(4)], 2, 3));

    render(<ReturnOrderModal open onClose={vi.fn()} />);
    await screen.findByText('SO-20261118-180001-0001');

    fireEvent.change(screen.getByLabelText('銷售單號'), { target: { value: ' 20261118-184741-0001 ' } });
    fireEvent.click(screen.getByRole('button', { name: '查詢' }));
    await screen.findByText('SO-20261118-180002-0001');
    expect(searchOrderPage.mock.calls[1][0]).toMatchObject({ orderNumber: '20261118-184741-0001', page: 1 });

    // 改了欄位但沒按查詢，載入更多仍沿用上一次的條件。
    fireEvent.change(screen.getByLabelText('銷售單號'), { target: { value: 'other' } });
    fireEvent.click(screen.getByRole('button', { name: '載入更多' }));
    await screen.findByText('SO-20261118-180004-0001');
    expect(searchOrderPage.mock.calls[2][0]).toMatchObject({ orderNumber: '20261118-184741-0001', page: 2 });
    // 重複出現的單據不會列兩次。
    expect(screen.getAllByText('SO-20261118-180003-0001')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: '載入更多' })).toBeNull();
  });

  it('重置 clears the fields and reloads the latest page', async () => {
    searchOrderPage.mockResolvedValue(pageOf([order(1)], 1, 1));
    render(<ReturnOrderModal open onClose={vi.fn()} />);
    await screen.findByText('SO-20261118-180001-0001');

    fireEvent.change(screen.getByLabelText('會員姓名 / 手機電話'), { target: { value: '0912' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '重置' }));
    });

    await waitFor(() => expect(searchOrderPage).toHaveBeenCalledTimes(2));
    expect(screen.getByLabelText('會員姓名 / 手機電話')).toHaveValue('');
    expect(searchOrderPage.mock.calls[1][0]).toEqual({
      productKeyword: undefined,
      productId: undefined,
      startDate: undefined,
      endDate: undefined,
      orderNumber: undefined,
      keyword: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      page: 1,
      pageSize: RETURN_ORDER_PAGE_SIZE,
    });
  });
});

describe('buildReturnOrderFilters', () => {
  it('uses one exact amount and makes the end minute inclusive', () => {
    const filters = buildReturnOrderFilters({
      productKeyword: ' 鋼彈 ',
      startDateTime: '2026-11-18T18:00',
      endDateTime: '2026-11-18T18:47',
      amountInput: '7450',
      orderNumber: '',
      customerKeyword: '',
      productId: 'prod-1',
    });
    expect(filters.productKeyword).toBe('鋼彈');
    expect(filters.productId).toBe('prod-1');
    expect(filters.minAmount).toBe(7450);
    expect(filters.maxAmount).toBe(7450);
    expect(filters.startDate).toBe(new Date('2026-11-18T18:00').toISOString());
    expect(filters.endDate).toBe(new Date('2026-11-18T18:48').toISOString());
  });
});
