import type { ICustomerService } from '@/services/interfaces/ICustomerService';
import type { Customer } from '@/types/customer';
import { getCustomers, setCustomers, simulateDelay } from './storageHelper';
import { nowIso } from '@/utils/date';

export class MockCustomerService implements ICustomerService {
  async searchCustomers(query: string): Promise<Customer[]> {
    await simulateDelay();
    const customers = getCustomers();
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => c.phone.includes(q) || c.name.toLowerCase().includes(q));
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    await simulateDelay();
    return getCustomers().find((c) => c.id === id) ?? null;
  }

  async getCustomerByPhone(phone: string): Promise<Customer | null> {
    await simulateDelay();
    return getCustomers().find((c) => c.phone === phone) ?? null;
  }

  async createCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    await simulateDelay();
    const customers = getCustomers();
    const newCustomer: Customer = {
      ...customer,
      id: `cust-${Date.now()}`,
      createdAt: nowIso(),
    };
    setCustomers([...customers, newCustomer]);
    return newCustomer;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    await simulateDelay();
    const customers = getCustomers();
    const idx = customers.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    const updatedCustomer: Customer = {
      ...customers[idx],
      ...updates,
    };
    const nextCustomers = [...customers];
    nextCustomers[idx] = updatedCustomer;
    setCustomers(nextCustomers);
    return updatedCustomer;
  }

  async updateCustomerSpending(customerId: string, amount: number, earnedPoints: number): Promise<boolean> {
    await simulateDelay();
    const customers = getCustomers();
    const idx = customers.findIndex((c) => c.id === customerId);
    if (idx === -1) return false;

    const nextCustomers = [...customers];
    nextCustomers[idx] = {
      ...nextCustomers[idx],
      totalSpent: nextCustomers[idx].totalSpent + amount,
      rewardPoints: nextCustomers[idx].rewardPoints + earnedPoints,
    };
    setCustomers(nextCustomers);
    return true;
  }
}
