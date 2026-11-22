import type { CheckoutOrder, PaymentMethodType } from './checkout';

export type ReportType = 'daily';

export interface PaymentMethodOption {
  type: PaymentMethodType | 'all';
  label: string;
}

/** 付款方式顯示名稱的唯一來源。報表、篩選與單據明細都用這份，不用後端或舊資料帶來的 name。 */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  cash: '現金',
  bank_transfer_ctbc: '轉帳(中信)',
  bank_transfer_ubot: '轉帳(聯邦)',
  credit_card_physical: '信用卡',
  credit_card_online: '官網刷卡',
  line_pay: 'LINE Pay',
  cod: '貨到付款',
};

/** 依付款類型取顯示名稱；不認得的類型才退回原始 name 或 type。 */
export function paymentMethodLabel(type: string, fallbackName?: string): string {
  return (PAYMENT_METHOD_LABELS as Record<string, string>)[type] ?? (fallbackName || type);
}

export const PAYMENT_METHOD_OPTIONS: PaymentMethodOption[] = [
  { type: 'all', label: '全部付款方式' },
  ...(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethodType[]).map((type) => ({
    type,
    label: PAYMENT_METHOD_LABELS[type],
  })),
];

export interface PaymentMethodStat {
  type: PaymentMethodType;
  label: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface DailyReportSummary {
  date: string;
  /** 當日現金總額加總 (包含現金收取與現金退款支出之淨額) */
  totalCashAmount: number;
  /** 現金收款總計 (正數銷售現金) */
  cashInflow: number;
  /** 現金退款總計 (退貨現金支出) */
  cashOutflow: number;
  /** 當日退貨件數總計 (所有品項 quantity < 0 之數量絕對值加總) */
  totalReturnedQuantity: number;
  /** 當日退貨訂單數 (含有退貨品項的單據總數) */
  totalReturnOrdersCount: number;
  /** 當日退款金額總計 (所有退貨品項金額加總) */
  totalRefundAmount: number;
  /** 符合篩選條件的訂單總數 */
  totalOrdersCount: number;
  /** 符合篩選條件的總營業額 (訂單 totalAmount 加總) */
  totalRevenue: number;
  /** 銷售品項總件數 (正數品項加總) */
  totalSoldQuantity: number;
  /** 折扣與折讓總額 */
  totalDiscountAmount: number;
  /** 各付款方式統計分析 */
  paymentStats: PaymentMethodStat[];
  /** 當日結帳訂單清單 (符合篩選) */
  orders: CheckoutOrder[];
}
