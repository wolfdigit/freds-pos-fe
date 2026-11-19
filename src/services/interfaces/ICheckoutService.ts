import type {
  CheckoutOrder,
  CreateOrderPayload,
  CheckoutReceipt,
  CheckoutOrderPage,
  OrderPageParams,
  OrderSearchParams,
} from '@/types/checkout';

export interface ICheckoutService {
  /** 建立結帳單（含購買、瑕疵換貨、退貨），並原子執行扣減/回補庫存、累計會員消費 */
  createCheckoutOrder(payload: CreateOrderPayload, idempotencyKey?: string): Promise<CheckoutReceipt>;
  /** 查詢歷史結帳單（會員、單號、商品、關鍵字、金額、日期）。回傳訂單陣列；HTTP 會自行翻頁後接起來。
   * 至少要有一個限縮條件（status 不算），否則丟錯，不會抓全部歷史。 */
  getOrderHistory(params?: OrderSearchParams | string): Promise<CheckoutOrder[]>;
  /** 只抓一頁歷史結帳單（新到舊）。退貨查原單用，篩選在伺服器端做。 */
  searchOrderPage(params: OrderPageParams): Promise<CheckoutOrderPage>;
  /** 最近的結帳單（新到舊，只抓一頁，最多 100 筆）。日報的「有紀錄」日期捷徑用，不必抓全部歷史。 */
  getRecentOrders(limit: number): Promise<CheckoutOrder[]>;
  /** 依 ID 取得單一結帳單（補印收據 / 查看退貨狀態用） */
  getOrderById(orderId: string): Promise<CheckoutOrder | null>;
}
