import { useState, useEffect, useMemo, useCallback } from 'react';
import { checkoutService } from '@/services';
import type { CheckoutOrder, PaymentMethodType } from '@/types/checkout';
import type { DailyReportSummary, PaymentMethodStat } from '@/types/report';
import { PAYMENT_METHOD_OPTIONS } from '@/types/report';
import { formatDate, nowIso } from '@/utils/date';
import { safeAdd } from '@/utils/currency';

export function useDailyReport() {
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDate(nowIso()));
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType | 'all'>('all');
  const [allOrders, setAllOrders] = useState<CheckoutOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const orders = await checkoutService.getOrderHistory();
      // 依建立時間由新到舊排序
      orders.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      setAllOrders(orders);
    } catch (err) {
      console.error('Failed to load order history for reports:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

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
    let allPaymentsSum = 0;

    for (const order of targetOrders) {
      for (const p of order.payments) {
        if (selectedPaymentMethod !== 'all' && p.type !== selectedPaymentMethod) {
          continue;
        }
        const current = paymentMap.get(p.type) || { count: 0, totalAmount: 0 };
        current.count += 1;
        current.totalAmount = safeAdd(current.totalAmount, p.amount);
        paymentMap.set(p.type, current);
        allPaymentsSum = safeAdd(allPaymentsSum, p.amount);
      }
    }

    const paymentStats: PaymentMethodStat[] = PAYMENT_METHOD_OPTIONS
      .filter((opt) => opt.type !== 'all')
      .map((opt) => {
        const stat = paymentMap.get(opt.type as PaymentMethodType) || { count: 0, totalAmount: 0 };
        const percentage = allPaymentsSum > 0 ? (Math.max(0, stat.totalAmount) / allPaymentsSum) * 100 : 0;
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
    for (const order of allOrders) {
      dates.add(formatDate(order.createdAt));
    }
    return Array.from(dates).sort((a, b) => (a < b ? 1 : -1));
  }, [allOrders]);

  return {
    selectedDate,
    setSelectedDate,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    summary,
    isLoading,
    reload: loadOrders,
    setQuickDate,
    availableDatesWithOrders,
  };
}
