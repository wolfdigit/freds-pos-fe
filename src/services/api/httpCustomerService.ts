import type { ICustomerService } from '@/services/interfaces/ICustomerService';
import type { Customer } from '@/types/customer';
import { httpClient } from './httpClient';

export class HttpCustomerService implements ICustomerService {
  async searchCustomers(query: string): Promise<Customer[]> {
    return httpClient.get<Customer[]>(`/customers?q=${encodeURIComponent(query)}`);
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      return await httpClient.get<Customer>(`/customers/${id}`);
    } catch {
      return null;
    }
  }

  async getCustomerByPhone(phone: string): Promise<Customer | null> {
    try {
      return await httpClient.get<Customer>(`/customers/by-phone/${encodeURIComponent(phone)}`);
    } catch {
      return null;
    }
  }

  async createCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    return httpClient.post<Customer>('/customers', customer);
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    return httpClient.put<Customer>(`/customers/${id}`, updates);
  }

  async updateCustomerSpending(customerId: string, amount: number, earnedPoints: number): Promise<boolean> {
    const res = await httpClient.post<{ success: boolean }>(`/customers/${customerId}/spending`, {
      amount,
      earnedPoints,
    });
    return res.success ?? true;
  }
}
