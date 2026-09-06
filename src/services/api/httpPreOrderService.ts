import type { IPreOrderService } from '@/services/interfaces/IPreOrderService';
import type { PreOrder } from '@/types/preorder';
import { httpClient } from './httpClient';

export class HttpPreOrderService implements IPreOrderService {
  async getPendingPreOrders(query: string): Promise<PreOrder[]> {
    return httpClient.get<PreOrder[]>(`/pre-orders/pending?q=${encodeURIComponent(query)}`);
  }

  async getPreOrdersByCustomerId(customerId: string): Promise<PreOrder[]> {
    return httpClient.get<PreOrder[]>(`/pre-orders?customerId=${encodeURIComponent(customerId)}`);
  }

  async fulfillPreOrderItems(
    preOrderId: string,
    fulfilledItems: { preOrderItemId: string; qty: number }[]
  ): Promise<boolean> {
    const res = await httpClient.post<{ success: boolean }>(`/pre-orders/${preOrderId}/fulfill`, {
      fulfilledItems,
    });
    return res.success ?? true;
  }

  async createPreOrder(preOrder: Partial<PreOrder>): Promise<PreOrder> {
    return httpClient.post<PreOrder>('/pre-orders', preOrder);
  }

  async updatePreOrder(id: string, updates: Partial<PreOrder>): Promise<PreOrder | null> {
    return httpClient.put<PreOrder>(`/pre-orders/${id}`, updates);
  }

  async markItemsArrived(preOrderId: string, arrivedItems: { productId: string; qty: number }[]): Promise<boolean> {
    const res = await httpClient.post<{ success: boolean }>(`/pre-orders/${preOrderId}/mark-arrived`, {
      arrivedItems,
    });
    return res.success ?? true;
  }
}
