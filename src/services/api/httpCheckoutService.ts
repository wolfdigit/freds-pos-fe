import type { ICheckoutService } from '@/services/interfaces/ICheckoutService';
import type {
  CheckoutOrder,
  CreateOrderPayload,
  CheckoutReceipt,
  OrderSearchParams,
} from '@/types/checkout';
import { httpClient } from './httpClient';

export class HttpCheckoutService implements ICheckoutService {
  async createCheckoutOrder(payload: CreateOrderPayload, idempotencyKey?: string): Promise<CheckoutReceipt> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['X-Idempotency-Key'] = idempotencyKey;
    }
    return httpClient.post<CheckoutReceipt>('/checkout/orders', payload, { headers });
  }

  async getOrderHistory(params?: OrderSearchParams | string): Promise<CheckoutOrder[]> {
    if (typeof params === 'string') {
      const query = params ? `?customerId=${encodeURIComponent(params)}` : '';
      return httpClient.get<CheckoutOrder[]>(`/checkout/orders${query}`);
    }

    if (!params) {
      return httpClient.get<CheckoutOrder[]>('/checkout/orders');
    }

    const queryParts: string[] = [];
    if (params.customerId) queryParts.push(`customerId=${encodeURIComponent(params.customerId)}`);
    if (params.orderNumber) queryParts.push(`orderNumber=${encodeURIComponent(params.orderNumber)}`);
    if (params.productId) queryParts.push(`productId=${encodeURIComponent(params.productId)}`);
    if (params.keyword) queryParts.push(`keyword=${encodeURIComponent(params.keyword)}`);
    if (params.startDate) queryParts.push(`startDate=${encodeURIComponent(params.startDate)}`);
    if (params.endDate) queryParts.push(`endDate=${encodeURIComponent(params.endDate)}`);
    if (params.status && params.status !== 'all') queryParts.push(`status=${encodeURIComponent(params.status)}`);

    const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return httpClient.get<CheckoutOrder[]>(`/checkout/orders${query}`);
  }

  async getOrderById(orderId: string): Promise<CheckoutOrder | null> {
    try {
      return await httpClient.get<CheckoutOrder>(`/checkout/orders/${orderId}`);
    } catch {
      return null;
    }
  }
}
