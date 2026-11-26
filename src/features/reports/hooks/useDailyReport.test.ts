import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { checkoutService } from '@/services';
import { useSessionStore } from '@/store/sessionStore';
import { formatDate } from '@/utils/date';
import { dayRangeForDate, useDailyReport } from './useDailyReport';
import { PAYMENT_METHOD_LABELS, PAYMENT_METHOD_OPTIONS, paymentMethodLabel } from '@/types/report';

function localDay(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatDate(d.toISOString());
}

describe('useDailyReport', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    useSessionStore.setState({ storeName: '' });
  });

  it('turns a local date into a half-open [start, next midnight) range', () => {
    const range = dayRangeForDate('2026-11-18');
    expect(range).not.toBeNull();
    const start = new Date(range!.startDate);
    const end = new Date(range!.endDate);
    expect([start.getFullYear(), start.getMonth(), start.getDate(), start.getHours()]).toEqual([2026, 10, 18, 0]);
    expect([end.getFullYear(), end.getMonth(), end.getDate(), end.getHours()]).toEqual([2026, 10, 19, 0]);
    expect(dayRangeForDate('2026-12-31')!.endDate).toBe(new Date(2027, 0, 1).toISOString());
    expect(dayRangeForDate('not-a-date')).toBeNull();
  });

  it('asks the backend only for the selected day and follows the quick-date chips', async () => {
    const history = vi.spyOn(checkoutService, 'getOrderHistory').mockResolvedValue([]);
    const recent = vi.spyOn(checkoutService, 'getRecentOrders').mockResolvedValue([]);
    const { result } = renderHook(() => useDailyReport());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(history).toHaveBeenCalledTimes(1);
    expect(history).toHaveBeenLastCalledWith(dayRangeForDate(localDay(0)));
    expect(recent).toHaveBeenCalledTimes(1);

    act(() => result.current.setQuickDate('yesterday'));
    await waitFor(() => expect(history).toHaveBeenCalledTimes(2));
    expect(history).toHaveBeenLastCalledWith(dayRangeForDate(localDay(-1)));

    act(() => result.current.setQuickDate('beforeYesterday'));
    await waitFor(() => expect(history).toHaveBeenCalledTimes(3));
    expect(history).toHaveBeenLastCalledWith(dayRangeForDate(localDay(-2)));

    act(() => result.current.setSelectedDate('2026-10-17'));
    await waitFor(() => expect(history).toHaveBeenCalledTimes(4));
    expect(history).toHaveBeenLastCalledWith(dayRangeForDate('2026-10-17'));
    // 換日期不重抓「有紀錄」日期。
    expect(recent).toHaveBeenCalledTimes(1);
  });

  it('shows no orders instead of fetching all history when the date cannot be parsed', async () => {
    const history = vi.spyOn(checkoutService, 'getOrderHistory').mockResolvedValue([]);
    vi.spyOn(checkoutService, 'getRecentOrders').mockResolvedValue([]);
    const { result } = renderHook(() => useDailyReport());
    await waitFor(() => expect(history).toHaveBeenCalledTimes(1));

    act(() => result.current.setSelectedDate('not-a-date'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(history).toHaveBeenCalledTimes(1);
    expect(history).not.toHaveBeenCalledWith(undefined);
    expect(result.current.summary.totalOrdersCount).toBe(0);
  });

  it('builds the date shortcuts from the recent orders page', async () => {
    vi.spyOn(checkoutService, 'getOrderHistory').mockResolvedValue([]);
    vi.spyOn(checkoutService, 'getRecentOrders').mockResolvedValue([
      { createdAt: new Date(2026, 10, 17, 15).toISOString() },
      { createdAt: new Date(2026, 10, 16, 9).toISOString() },
    ] as never);
    const { result } = renderHook(() => useDailyReport());
    await waitFor(() =>
      expect(result.current.availableDatesWithOrders).toEqual(['2026-11-17', '2026-11-16'])
    );
  });

  it('sums discounts, returns, cash flow and per-method shares for the selected day', async () => {
    const at = (h: number) => new Date(2026, 7, 23, h).toISOString();
    vi.spyOn(checkoutService, 'getRecentOrders').mockResolvedValue([]);
    vi.spyOn(checkoutService, 'getOrderHistory').mockResolvedValue([
      {
        id: 'o1', orderNumber: 'SO-1', createdAt: at(10), totalAmount: 900, discountAmount: 100,
        items: [{ quantity: 2, subtotal: 900 }],
        payments: [{ type: 'cash', name: '現金', amount: 600 }, { type: 'line_pay', name: 'LinePay', amount: 300 }],
      },
      {
        id: 'o2', orderNumber: 'SO-2', createdAt: at(12), totalAmount: -200, discountAmount: 0,
        items: [{ quantity: -1, subtotal: -200 }],
        payments: [{ type: 'cash', name: '現金', amount: -200 }],
      },
      {
        id: 'o3', orderNumber: 'SO-3', createdAt: at(15), totalAmount: 100, discountAmount: 0,
        items: [{ quantity: 1, subtotal: 100 }],
        payments: [{ type: 'credit_card_online', name: '信用卡(線上)', amount: 100 }],
      },
    ] as never);
    const { result } = renderHook(() => useDailyReport());
    act(() => result.current.setSelectedDate('2026-08-23'));
    await waitFor(() => expect(result.current.summary.totalOrdersCount).toBe(3));

    const s = result.current.summary;
    expect(s.totalRevenue).toBe(800);
    expect(s.totalSoldQuantity).toBe(3);
    expect(s.totalDiscountAmount).toBe(100);
    expect([s.totalReturnedQuantity, s.totalReturnOrdersCount, s.totalRefundAmount]).toEqual([1, 1, 200]);
    expect([s.cashInflow, s.cashOutflow, s.totalCashAmount]).toEqual([600, 200, 400]);

    const byType = Object.fromEntries(s.paymentStats.map((p) => [p.type, p]));
    expect(byType.cash.totalAmount).toBe(400);
    expect(byType.line_pay.label).toBe('LINE Pay');
    expect(byType.credit_card_online.label).toBe('官網刷卡');
    // 佔比分母只算正數收款（600+300+100），退款不會讓加總超過 100%。
    expect(byType.cash.percentage).toBeCloseTo(40);
    expect(byType.line_pay.percentage).toBeCloseTo(30);
    expect(byType.credit_card_online.percentage).toBeCloseTo(10);
  });
});

describe('useDailyReport store filter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    useSessionStore.setState({ storeName: '' });
  });

  it('starts on the login store and sends its storeName to both the day query and the date shortcuts', async () => {
    useSessionStore.setState({ storeName: '奇可門市' });
    const history = vi.spyOn(checkoutService, 'getOrderHistory').mockResolvedValue([]);
    const recent = vi.spyOn(checkoutService, 'getRecentOrders').mockResolvedValue([]);
    const { result } = renderHook(() => useDailyReport());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.storeFilter).toEqual({ kind: 'store', storeName: '奇可門市' });
    expect(history).toHaveBeenLastCalledWith({ ...dayRangeForDate(localDay(0)), storeName: '奇可門市' });
    expect(recent).toHaveBeenLastCalledWith(100, { storeName: '奇可門市' });

    act(() => result.current.setStoreFilter({ kind: 'store', storeName: '台南快閃店' }));
    await waitFor(() => expect(history).toHaveBeenCalledTimes(2));
    expect(history).toHaveBeenLastCalledWith({ ...dayRangeForDate(localDay(0)), storeName: '台南快閃店' });
    await waitFor(() => expect(recent).toHaveBeenLastCalledWith(100, { storeName: '台南快閃店' }));

    act(() => result.current.setStoreFilter({ kind: 'all' }));
    await waitFor(() => expect(history).toHaveBeenCalledTimes(3));
    expect(history).toHaveBeenLastCalledWith(dayRangeForDate(localDay(0)));
    await waitFor(() => expect(recent).toHaveBeenLastCalledWith(100));
  });

  it('keeps the store on date and payment changes and resets to the new login store', async () => {
    useSessionStore.setState({ storeName: '奇可門市' });
    const history = vi.spyOn(checkoutService, 'getOrderHistory').mockResolvedValue([]);
    vi.spyOn(checkoutService, 'getRecentOrders').mockResolvedValue([]);
    const { result } = renderHook(() => useDailyReport());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setStoreFilter({ kind: 'all' }));
    act(() => result.current.setSelectedDate('2026-10-17'));
    act(() => result.current.setSelectedPaymentMethod('cash'));
    await waitFor(() => expect(history).toHaveBeenLastCalledWith(dayRangeForDate('2026-10-17')));
    expect(result.current.storeFilter).toEqual({ kind: 'all' });

    act(() => useSessionStore.setState({ storeName: '台南快閃店' }));
    await waitFor(() => expect(result.current.storeFilter).toEqual({ kind: 'store', storeName: '台南快閃店' }));
    await waitFor(() =>
      expect(history).toHaveBeenLastCalledWith({ ...dayRangeForDate('2026-10-17'), storeName: '台南快閃店' })
    );
  });

  it('defaults to all stores when there is no login store', async () => {
    const history = vi.spyOn(checkoutService, 'getOrderHistory').mockResolvedValue([]);
    vi.spyOn(checkoutService, 'getRecentOrders').mockResolvedValue([]);
    const { result } = renderHook(() => useDailyReport());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.storeFilter).toEqual({ kind: 'all' });
    expect(history).toHaveBeenLastCalledWith(dayRangeForDate(localDay(0)));
  });

  it('does not keep another store\'s orders when switching stores fails', async () => {
    useSessionStore.setState({ storeName: '奇可門市' });
    const order = {
      id: 'o1', orderNumber: 'SO-1', createdAt: new Date().toISOString(), totalAmount: 100, discountAmount: 0,
      items: [{ quantity: 1, subtotal: 100 }], payments: [{ type: 'cash', name: '現金', amount: 100 }],
    };
    const history = vi.spyOn(checkoutService, 'getOrderHistory').mockResolvedValueOnce([order] as never);
    const recent = vi.spyOn(checkoutService, 'getRecentOrders').mockResolvedValueOnce([order] as never);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useDailyReport());
    await waitFor(() => expect(result.current.summary.totalOrdersCount).toBe(1));
    expect(result.current.availableDatesWithOrders).toHaveLength(1);

    history.mockRejectedValue(new Error('STORE_NOT_FOUND'));
    recent.mockRejectedValue(new Error('STORE_NOT_FOUND'));
    act(() => result.current.setStoreFilter({ kind: 'store', storeName: '已刪除門市' }));
    await waitFor(() => expect(result.current.summary.totalOrdersCount).toBe(0));
    await waitFor(() => expect(result.current.availableDatesWithOrders).toEqual([]));
  });
});

describe('payment method labels', () => {
  it('uses one label per type for options, stats and order rows', () => {
    for (const option of PAYMENT_METHOD_OPTIONS) {
      if (option.type === 'all') continue;
      expect(option.label).toBe(PAYMENT_METHOD_LABELS[option.type]);
    }
    // 舊資料或後端帶的 name 不同時，仍顯示統一名稱。
    expect(paymentMethodLabel('line_pay', 'LinePay')).toBe('LINE Pay');
    expect(paymentMethodLabel('credit_card_online', '信用卡(線上)')).toBe('官網刷卡');
    expect(paymentMethodLabel('gift_card', '禮券')).toBe('禮券');
    expect(paymentMethodLabel('gift_card')).toBe('gift_card');
  });
});
