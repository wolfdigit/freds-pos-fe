import type {
  CheckoutOrder,
  CreateOrderPayload,
  CheckoutReceipt,
  OrderSearchParams,
} from '@/types/checkout';

export interface ICheckoutService {
  /** 建立結帳單（含購買、瑕疵換貨、退貨），並原子執行扣減/回補庫存、沖銷預購單、累計會員點數 */
  createCheckoutOrder(payload: CreateOrderPayload, idempotencyKey?: string): Promise<CheckoutReceipt>;
  /** 查詢歷史結帳單 (支援會員 ID、單號、商品 ID、關鍵字、日期範圍) */
  getOrderHistory(params?: OrderSearchParams | string): Promise<CheckoutOrder[]>;
  /** 依 ID 取得單一結帳單（補印收據 / 查看退貨狀態用） */
  getOrderById(orderId: string): Promise<CheckoutOrder | null>;
}
