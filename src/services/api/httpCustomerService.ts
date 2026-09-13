import type { ICustomerService } from '@/services/interfaces/ICustomerService';
import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerSearchParams,
  CustomerSearchResponse,
} from '@/types/customer';
import { httpClient } from './httpClient';

export class HttpCustomerService implements ICustomerService {
  async searchCustomers(params?: CustomerSearchParams | string): Promise<CustomerSearchResponse> {
    const queryParts: string[] = [];

    if (typeof params === 'string') {
      if (params.trim()) {
        queryParts.push(`keyword=${encodeURIComponent(params.trim())}`);
      }
    } else if (params) {
      if (params.keyword?.trim()) {
        queryParts.push(`keyword=${encodeURIComponent(params.keyword.trim())}`);
      }
      if (params.vipTier && params.vipTier !== 'ALL') {
        queryParts.push(`vipTier=${encodeURIComponent(params.vipTier)}`);
      }
      if (params.page && params.page > 0) {
        queryParts.push(`page=${params.page}`);
      }
      if (params.pageSize && params.pageSize > 0) {
        queryParts.push(`pageSize=${params.pageSize}`);
      }
    }

    const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return httpClient.get<CustomerSearchResponse>(`/customers${qs}`);
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      return await httpClient.get<Customer>(`/customers/${id}`);
    } catch {
      return null;
    }
  }

  async createCustomer(request: CreateCustomerRequest): Promise<Customer> {
    return httpClient.post<Customer>('/customers', request);
  }

  async updateCustomer(id: string, request: UpdateCustomerRequest): Promise<Customer | null> {
    return httpClient.put<Customer>(`/customers/${id}`, request);
  }

  async deleteCustomer(id: string): Promise<void> {
    await httpClient.delete(`/customers/${id}`);
  }

  async updateCustomerSpending(customerId: string, amount: number, earnedPoints: number): Promise<boolean> {
    const res = await httpClient.post<{ success: boolean }>(`/customers/${customerId}/spending`, {
      amount,
      earnedPoints,
    });
    return res.success ?? true;
  }
}
