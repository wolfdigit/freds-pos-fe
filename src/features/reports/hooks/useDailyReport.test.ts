import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { checkoutService } from '@/services';
import { formatDate } from '@/utils/date';
import { dayRangeForDate, useDailyReport } from './useDailyReport';

function localDay(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatDate(d.toISOString());
}

describe('useDailyReport', () => {
  afterEach(() => {
    vi.restoreAllMocks();
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
});
