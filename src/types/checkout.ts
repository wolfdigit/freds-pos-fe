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

export interface InvoiceInfo {
  type: 'none' | 'carrier' | 'tax_id' | 'paper';
  carrierCode?: string;
  taxId?: string;
  buyerTitle?: string;
}

export interface CheckoutOrderItem {
  productId: string;
  sku: string;
  name: string;
  scale: ModelScale;
  originalPrice: number;
  unitPrice: number;
  isManualPrice: boolean;
  priceDiffReason?: string;
  quantity: number;
  subtotal: number;
  returnedQuantity?: number;
  preOrderId?: string;
  preOrderItemId?: string;
  originalOrderId?: string;
  originalOrderItemId?: string;
  restock?: boolean;
  returnReason?: string;
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
  invoice: InvoiceInfo;
  earnedPoints: number;
  usedPoints: number;
  note?: string;
  createdAt: string;
}

export interface CreateOrderItemPayload {
  productId: string;
  quantity: number;
  unitPrice?: number;
  isManualPrice?: boolean;
  priceDiffReason?: string;
  preOrderId?: string;
  preOrderItemId?: string;
  originalOrderId?: string;
  originalOrderItemId?: string;
  restock?: boolean;
  returnReason?: string;
}

export interface CreateOrderPayload {
  customerId?: string;
  usedPoints?: number;
  items: CreateOrderItemPayload[];
  shippingFee: number;
  payments: PaymentTender[];
  invoice: InvoiceInfo;
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


export interface CheckoutReceipt {
  order: CheckoutOrder;
  receiptPrintHtml: string;
}
