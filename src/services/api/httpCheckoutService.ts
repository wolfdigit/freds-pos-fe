import type { ICheckoutService } from '@/services/interfaces/ICheckoutService';
import type { CheckoutOrder, CreateOrderPayload, CheckoutReceipt } from '@/types/checkout';
import { httpClient } from './httpClient';

export class HttpCheckoutService implements ICheckoutService {
  async createCheckoutOrder(payload: CreateOrderPayload): Promise<CheckoutReceipt> {
    return httpClient.post<CheckoutReceipt>('/checkout/orders', payload);
  }

  async getOrderHistory(customerId?: string): Promise<CheckoutOrder[]> {
    const query = customerId ? `?customerId=${encodeURIComponent(customerId)}` : '';
    return httpClient.get<CheckoutOrder[]>(`/checkout/orders${query}`);
  }

  async getOrderById(orderId: string): Promise<CheckoutOrder | null> {
    try {
      return await httpClient.get<CheckoutOrder>(`/checkout/orders/${orderId}`);
    } catch {
      return null;
    }
  }

  async refundOrder(orderId: string, reason: string): Promise<boolean> {
    const res = await httpClient.post<{ success: boolean }>(`/checkout/orders/${orderId}/refund`, { reason });
    return res.success ?? true;
  }
}
