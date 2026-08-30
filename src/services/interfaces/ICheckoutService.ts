import type { CheckoutOrder, CreateOrderPayload, CheckoutReceipt } from '@/types/checkout';

export interface ICheckoutService {
  /** 建立結帳單並扣減庫存、更新預購單、累計會員點數 */
  createCheckoutOrder(payload: CreateOrderPayload): Promise<CheckoutReceipt>;
  /** 查詢歷史結帳單 */
  getOrderHistory(customerId?: string): Promise<CheckoutOrder[]>;
  /** 依 ID 取得單一結帳單（補印收據用） */
  getOrderById(orderId: string): Promise<CheckoutOrder | null>;
  /** 作廢 / 退換貨訂單處理 */
  refundOrder(orderId: string, reason: string): Promise<boolean>;
}
