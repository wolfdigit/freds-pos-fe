import type { ModelScale } from './product';

export type PaymentMethodType =
  | 'cash'
  | 'bank_transfer_ctbc'
  | 'bank_transfer_ubot'
  | 'credit_card_physical'
  | 'credit_card_online'
  | 'line_pay'
  | 'cod';


export interface PaymentTender {
  type: PaymentMethodType;
  name: string;
  amount: number;
  tenderedCash?: number;
  changeAmount?: number;
  transactionRef?: string;
}

export interface CheckoutOrderItem {
  productId: string;
  sku: string;
  name: string;
  scale?: ModelScale | string;
  originalPrice: number;
  unitPrice: number;
  isManualPrice: boolean;
  priceDiffReason?: string;
  quantity: number;
  subtotal: number;
  note?: string;
  returnedQuantity?: number;
  originalOrderId?: string;
  originalOrderItemId?: string;
  restock?: boolean;
  returnReason?: string;
  /** 退貨入帳的地點。restock 不是 false 時是正常貨，false 時是退貨庫存點。 */
  inventoryLocationId?: string;
  inventoryLocationName?: string;
}

export type OrderStatus = 'completed' | 'partially_refunded' | 'refunded';

export interface CheckoutOrder {
  id: string;
  orderNumber: string;
  cashierId: string;
  cashierName: string;
  status: OrderStatus;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: CheckoutOrderItem[];
  itemsSubtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  payments: PaymentTender[];
  note?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface CreateOrderItemPayload {
  productId: string;
  quantity: number;
  unitPrice?: number;
  isManualPrice?: boolean;
  priceDiffReason?: string;
  originalOrderId?: string;
  originalOrderItemId?: string;
  /** 省略或 true：加回登入門市正常貨。false：加到登入門市退貨庫存點。都會改數量。 */
  restock?: boolean;
  returnReason?: string;
  note?: string;
}

export interface CreateOrderPayload {
  customerId?: string;
  items: CreateOrderItemPayload[];
  shippingFee: number;
  payments: PaymentTender[];
  note?: string;
}

export interface OrderSearchParams {
  customerId?: string;
  orderNumber?: string;
  productId?: string;
  keyword?: string;
  productKeyword?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  status?: OrderStatus | 'all';
}

/**
 * 會限縮結果的條件：status 不算（幾乎每張單都是 completed）。
 * 一次抓完所有頁的 getOrderHistory 至少要有其中一個，避免不小心把全部歷史訂單抓回來。
 */
export function hasOrderHistoryFilter(params: OrderSearchParams | undefined): boolean {
  if (!params) return false;
  const text = [
    params.customerId,
    params.orderNumber,
    params.productId,
    params.keyword,
    params.productKeyword,
    params.startDate,
    params.endDate,
  ].some((value) => typeof value === 'string' && value.trim() !== '');
  const amount = [params.minAmount, params.maxAmount].some(
    (value) => typeof value === 'number' && Number.isFinite(value)
  );
  return text || amount;
}

export const ORDER_HISTORY_FILTER_REQUIRED = '查詢歷史訂單至少需要一個篩選條件（會員、日期、單號、商品或金額），不能一次抓全部訂單';

/** 分頁查詢歷史結帳單：page 從 1 開始，後端 pageSize 上限 100。 */
export interface OrderPageParams extends OrderSearchParams {
  page: number;
  pageSize: number;
}

/** GET /checkout/orders 的分頁回應，依建立時間新到舊。total 是符合條件的總筆數。 */
export interface CheckoutOrderPage {
  items: CheckoutOrder[];
  page: number;
  pageSize: number;
  total: number;
}


/** Recorded order. The client formats the slip from these fields. */
export interface CheckoutReceipt {
  order: CheckoutOrder;
}
