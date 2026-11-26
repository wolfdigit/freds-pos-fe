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

/** 會員點數折抵：每個商品一張單只能折一次，1 件單價最多扣 NT$360（最低 0）。後端只存旗標。 */
export const POINTS_DISCOUNT_AMOUNT = 360;

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
  /** 這一列用了會員點數折抵（單價已扣過，不會另外再從總額扣）。只存旗標，金額 = (originalPrice − unitPrice) × quantity。退貨列沿用原列旗標。 */
  pointsDiscountApplied?: boolean;
  note?: string;
  returnedQuantity?: number;
  originalOrderId?: string;
  originalOrderItemId?: string;
  restock?: boolean;
  returnReason?: string;
  /** 預購取貨：這一列從門市的預購保留地點扣庫存。只會出現在銷售列。 */
  preorderPickup?: boolean;
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
  /** 點數折抵：有點數旗標的列 Σ(originalPrice − unitPrice) × quantity（整個差額）。discountAmount 不含這些列。 */
  pointsDiscountAmount?: number;
  shippingFee: number;
  totalAmount: number;
  payments: PaymentTender[];
  note?: string;
  /**
   * 結帳門市（結帳當下的登入門市名稱）；退貨單是處理退貨的門市。
   * 舊資料可能是 branch-store / branch-online 或已刪除的門市。
   */
  branchId?: string;
  branchName?: string;
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
  /** 這個商品用會員點數折抵 NT$360。需要綁定會員、帶 unitPrice；同一商品一張單只能一次；退貨列不可用。 */
  pointsDiscountApplied?: boolean;
  /** 預購取貨：從登入門市的預購保留地點扣，不扣門市庫存。只能用在銷售列，可和點數折抵並用。 */
  preorderPickup?: boolean;
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
  /**
   * 只看在這間門市結帳的訂單（後端比對 branchId）。空白 = 不送 = 全部門市。
   * 找不到門市時後端回 404 STORE_NOT_FOUND。不算限縮條件（見 hasOrderHistoryFilter）。
   */
  storeName?: string;
}

/** getRecentOrders 的選項：storeName 只看那間門市（空白 = 全部門市）。 */
export interface RecentOrdersOptions {
  storeName?: string;
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
