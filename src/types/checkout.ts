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


/** Recorded order. The client formats the slip from these fields. */
export interface CheckoutReceipt {
  order: CheckoutOrder;
}
