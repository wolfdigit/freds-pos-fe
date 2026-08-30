import type { ModelScale } from './product';

export type PreOrderStatus =
  | 'pending'
  | 'partially_arrived'
  | 'partially_completed'
  | 'completed'
  | 'cancelled';

export interface PreOrderItem {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  scale: ModelScale;
  brand: string;
  quotedPrice: number;
  qtyOrdered: number;
  qtyArrived: number;
  qtyDelivered: number;
}

export interface PreOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  orderDate: string;
  expectedArrivalDate?: string;
  status: PreOrderStatus;
  source: 'in_store' | 'website';
  items: PreOrderItem[];
  note?: string;
  operatorName?: string;
  updatedAt: string;
}
