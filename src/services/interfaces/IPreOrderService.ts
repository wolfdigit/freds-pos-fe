import type { PreOrder } from '@/types/preorder';

export interface IPreOrderService {
  /** 依客戶電話或單號搜尋未結預購單 */
  getPendingPreOrders(query: string): Promise<PreOrder[]>;
  /** 依客戶 ID 取得該客戶所有預購單 */
  getPreOrdersByCustomerId(customerId: string): Promise<PreOrder[]>;
  /** 沖銷預購單數量 (在結帳完成時調用) */
  fulfillPreOrderItems(
    preOrderId: string,
    fulfilledItems: { preOrderItemId: string; qty: number }[]
  ): Promise<boolean>;
  /** 建立新預購單 */
  createPreOrder(preOrder: Partial<PreOrder>): Promise<PreOrder>;
  /** 更新預購單資訊 */
  updatePreOrder(id: string, updates: Partial<PreOrder>): Promise<PreOrder | null>;
  /** [Phase 2] 標記預購品項到貨數量（更新 qtyArrived） */
  markItemsArrived?(preOrderId: string, arrivedItems: { productId: string; qty: number }[]): Promise<boolean>;
}
