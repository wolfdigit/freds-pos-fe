import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { checkoutService } from '@/services';
import type { CheckoutOrder, PaymentMethodType } from '@/types/checkout';
import type { DailyReportSummary, PaymentMethodStat } from '@/types/report';
import { PAYMENT_METHOD_OPTIONS } from '@/types/report';
import { formatDate, nowIso } from '@/utils/date';
import { safeAdd } from '@/utils/currency';
import { useSessionStore } from '@/store/sessionStore';
import { defaultReportStoreFilter, reportStoreName, type ReportStoreFilter } from '../reportStoreFilter';

/** 「有紀錄」日期捷徑只看最近這麼多筆訂單，不再抓全部歷史。 */
const RECENT_ORDERS_FOR_DATE_CHIPS = 100;

/**
 * 把 YYYY-MM-DD（瀏覽器本地日期，與 formatDate 相同）轉成後端 startDate/endDate。
 * 後端條件是 createdAt >= startDate 且 createdAt < endDate，所以 endDate 是隔天本地零點。
 */
export function dayRangeForDate(date: string): { startDate: string; endDate: string } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const start = new Date(year, month, day);
  const end = new Date(year, month, day + 1);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

function storeParam(storeName: string | undefined): { storeName?: string } {
  return storeName ? { storeName } : {};
}

export function useDailyReport() {
  const loginStoreName = useSessionStore((state) => state.storeName).trim();
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDate(nowIso()));
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType | 'all'>('all');
  // 門市篩選：預設登入門市（沒有登入門市時是所有門市總計）。換日期、付款方式時保留；
  // 重新載入頁面或換登入門市時回到登入門市。
  const [storeFilter, setStoreFilter] = useState<ReportStoreFilter>(() => defaultReportStoreFilter(loginStoreName));
  useEffect(() => {
    setStoreFilter(defaultReportStoreFilter(loginStoreName));
  }, [loginStoreName]);
  const storeName = reportStoreName(storeFilter);

  const [allOrders, setAllOrders] = useState<CheckoutOrder[]>([]);
  const [recentOrders, setRecentOrders] = useState<CheckoutOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const dayRequest = useRef(0);
  const recentRequest = useRef(0);
  // 目前畫面上的訂單是哪間門市的（undefined = 所有門市）；換門市失敗時不能留著別間門市的數字。
  const shownDayStore = useRef<string | undefined | null>(null);
  const shownRecentStore = useRef<string | undefined | null>(null);

  const loadDayOrders = useCallback(async () => {
    const requestId = ++dayRequest.current;
    setIsLoading(true);
    try {
      // 只向後端要選定日期（與所選門市）的訂單，不再抓全部歷史回來在瀏覽器篩選。
      const range = dayRangeForDate(selectedDate);
      // 日期無法解析時直接當作沒有訂單，不能退回成「不帶條件」去抓全部歷史。
      const orders = range ? await checkoutService.getOrderHistory({ ...range, ...storeParam(storeName) }) : [];
      if (requestId !== dayRequest.current) return;
      // 依建立時間由新到舊排序
      orders.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      setAllOrders(orders);
      shownDayStore.current = storeName;
    } catch (err) {
      if (requestId !== dayRequest.current) return;
      console.error('Failed to load order history for reports:', err);
      if (shownDayStore.current !== storeName) {
        setAllOrders([]);
        shownDayStore.current = storeName;
      }
    } finally {
      if (requestId === dayRequest.current) setIsLoading(false);
    }
  }, [selectedDate, storeName]);

  const loadRecentOrders = useCallback(async () => {
    const requestId = ++recentRequest.current;
    try {
      const orders = storeName
        ? await checkoutService.getRecentOrders(RECENT_ORDERS_FOR_DATE_CHIPS, { storeName })
        : await checkoutService.getRecentOrders(RECENT_ORDERS_FOR_DATE_CHIPS);
      if (requestId !== recentRequest.current) return;
      setRecentOrders(orders);
      shownRecentStore.current = storeName;
    } catch (err) {
      if (requestId !== recentRequest.current) return;
      console.error('Failed to load recent orders for report date shortcuts:', err);
      if (shownRecentStore.current !== storeName) {
        setRecentOrders([]);
        shownRecentStore.current = storeName;
      }
    }
  }, [storeName]);

  useEffect(() => {
    void loadDayOrders();
  }, [loadDayOrders]);

  useEffect(() => {
    void loadRecentOrders();
  }, [loadRecentOrders]);

  const reload = useCallback(async () => {
    await Promise.all([loadDayOrders(), loadRecentOrders()]);
  }, [loadDayOrders, loadRecentOrders]);

  // 計算當日報表統計資料
  const summary: DailyReportSummary = useMemo(() => {
    // 1. 篩選當天所有訂單
    const dayOrders = allOrders.filter((order) => formatDate(order.createdAt) === selectedDate);

    // 2. 當日現金指標（無論下方付款方式篩選為何，頂部總覽始終提供精確的全天現金流水）
    let cashInflow = 0;
    let cashOutflow = 0;
    for (const order of dayOrders) {
      for (const p of order.payments) {
        if (p.type === 'cash') {
          if (p.amount >= 0) {
            cashInflow = safeAdd(cashInflow, p.amount);
          } else {
            cashOutflow = safeAdd(cashOutflow, Math.abs(p.amount));
          }
        }
      }
    }
    const totalCashAmount = safeAdd(cashInflow, -cashOutflow);

    // 3. 當日退貨指標
    let totalReturnedQuantity = 0;
    let totalReturnOrdersCount = 0;
    let totalRefundAmount = 0;

    for (const order of dayOrders) {
      let hasReturnInThisOrder = false;
      for (const item of order.items) {
        if (item.quantity < 0) {
          totalReturnedQuantity += Math.abs(item.quantity);
          totalRefundAmount = safeAdd(totalRefundAmount, Math.abs(item.subtotal));
          hasReturnInThisOrder = true;
        }
      }
      if (hasReturnInThisOrder) {
        totalReturnOrdersCount += 1;
      }
    }

    // 4. 根據所選「付款方式」篩選明細列表
    const filteredOrders =
      selectedPaymentMethod === 'all'
        ? dayOrders
        : dayOrders.filter((o) => o.payments.some((p) => p.type === selectedPaymentMethod));

    // 5. 依目前篩選條件彙總指標
    let totalRevenue = 0;
    let totalSoldQuantity = 0;
    let totalDiscountAmount = 0;

    for (const order of filteredOrders) {
      totalRevenue = safeAdd(totalRevenue, order.totalAmount);
      totalDiscountAmount = safeAdd(totalDiscountAmount, order.discountAmount);
      for (const item of order.items) {
        if (item.quantity > 0) {
          totalSoldQuantity += item.quantity;
        }
      }
    }

    // 6. 各付款方式金額加總與佔比統計 (依目前篩選的訂單列表計算)
    const targetOrders = filteredOrders;
    const paymentMap = new Map<PaymentMethodType, { count: number; totalAmount: number }>();
    // 佔比分母只算正數收款，退款（負數）不會讓各方式佔比加總超過 100%。
    let positivePaymentsSum = 0;

    for (const order of targetOrders) {
      for (const p of order.payments) {
        if (selectedPaymentMethod !== 'all' && p.type !== selectedPaymentMethod) {
          continue;
        }
        const current = paymentMap.get(p.type) || { count: 0, totalAmount: 0 };
        current.count += 1;
        current.totalAmount = safeAdd(current.totalAmount, p.amount);
        paymentMap.set(p.type, current);
        if (p.amount > 0) positivePaymentsSum = safeAdd(positivePaymentsSum, p.amount);
      }
    }

    const paymentStats: PaymentMethodStat[] = PAYMENT_METHOD_OPTIONS
      .filter((opt) => opt.type !== 'all')
      .map((opt) => {
        const stat = paymentMap.get(opt.type as PaymentMethodType) || { count: 0, totalAmount: 0 };
        const percentage =
          positivePaymentsSum > 0 ? (Math.max(0, stat.totalAmount) / positivePaymentsSum) * 100 : 0;
        return {
          type: opt.type as PaymentMethodType,
          label: opt.label,
          count: stat.count,
          totalAmount: stat.totalAmount,
          percentage,
        };
      })
      .filter((stat) => stat.count > 0 || stat.totalAmount !== 0);

    return {
      date: selectedDate,
      totalCashAmount,
      cashInflow,
      cashOutflow,
      totalReturnedQuantity,
      totalReturnOrdersCount,
      totalRefundAmount,
      totalOrdersCount: filteredOrders.length,
      totalRevenue,
      totalSoldQuantity,
      totalDiscountAmount,
      paymentStats,
      orders: filteredOrders,
    };
  }, [allOrders, selectedDate, selectedPaymentMethod]);

  // 快捷切換日期
  const setQuickDate = (preset: 'today' | 'yesterday' | 'beforeYesterday') => {
    const d = new Date();
    if (preset === 'yesterday') {
      d.setDate(d.getDate() - 1);
    } else if (preset === 'beforeYesterday') {
      d.setDate(d.getDate() - 2);
    }
    setSelectedDate(formatDate(d.toISOString()));
  };

  // 取得目前有訂單記錄的日期清單（方便使用者快速探索示範資料）
  const availableDatesWithOrders = useMemo(() => {
    const dates = new Set<string>();
    for (const order of recentOrders) {
      dates.add(formatDate(order.createdAt));
    }
    for (const order of allOrders) {
      dates.add(formatDate(order.createdAt));
    }
    return Array.from(dates).sort((a, b) => (a < b ? 1 : -1));
  }, [allOrders, recentOrders]);

  return {
    storeFilter,
    setStoreFilter,
    loginStoreName,
    selectedDate,
    setSelectedDate,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    summary,
    isLoading,
    reload,
    setQuickDate,
    availableDatesWithOrders,
  };
}
