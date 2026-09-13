import type { ICustomerService } from '@/services/interfaces/ICustomerService';
import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerSearchParams,
  CustomerSearchResponse,
} from '@/types/customer';
import { getVipTierName } from '@/types/customer';
import { getCustomers, setCustomers, simulateDelay } from './storageHelper';
import { nowIso } from '@/utils/date';
import { BusinessError } from '@/utils/errors';

export class MockCustomerService implements ICustomerService {
  async searchCustomers(params?: CustomerSearchParams | string): Promise<CustomerSearchResponse> {
    await simulateDelay();
    const customers = getCustomers();

    let keyword = '';
    let vipTier: CustomerSearchParams['vipTier'] = 'ALL';
    let page = 1;
    let pageSize = 20;

    if (typeof params === 'string') {
      keyword = params.trim();
    } else if (params) {
      keyword = params.keyword?.trim() || '';
      vipTier = params.vipTier || 'ALL';
      page = Math.max(1, params.page || 1);
      pageSize = Math.min(100, Math.max(1, params.pageSize || 20));
    }

    let filtered = [...customers];

    if (keyword) {
      const q = keyword.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.email && c.email.toLowerCase().includes(q))
      );
    }

    if (vipTier && vipTier !== 'ALL') {
      filtered = filtered.filter((c) => c.vipTier === vipTier);
    }

    filtered.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'));

    const total = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const items = filtered.slice(startIndex, startIndex + pageSize);

    return {
      items,
      page,
      pageSize,
      total,
    };
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    await simulateDelay();
    return getCustomers().find((c) => c.id === id) ?? null;
  }

  async createCustomer(request: CreateCustomerRequest): Promise<Customer> {
    await simulateDelay();
    const customers = getCustomers();

    const phone = request.phone.trim();
    if (customers.some((c) => c.phone === phone)) {
      throw new BusinessError('CUSTOMER_PHONE_DUPLICATE', '手機號碼已存在');
    }

    const email = request.email ? request.email.trim() : null;
    if (email && customers.some((c) => c.email && c.email.toLowerCase() === email.toLowerCase())) {
      throw new BusinessError('CUSTOMER_EMAIL_DUPLICATE', '電子信箱已存在');
    }

    const tier = request.vipTier || 'regular';
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: request.name.trim(),
      phone,
      email,
      vipTier: tier,
      vipTierName: getVipTierName(tier),
      totalSpent: 0,
      note: request.note?.trim() || undefined,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    setCustomers([...customers, newCustomer]);
    return newCustomer;
  }

  async updateCustomer(id: string, request: UpdateCustomerRequest): Promise<Customer | null> {
    await simulateDelay();
    const customers = getCustomers();
    const idx = customers.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    const current = customers[idx];

    if (request.phone !== undefined) {
      const phone = request.phone.trim();
      if (phone !== current.phone && customers.some((c) => c.id !== id && c.phone === phone)) {
        throw new BusinessError('CUSTOMER_PHONE_DUPLICATE', '手機號碼已存在');
      }
    }

    if (request.email !== undefined && request.email !== null) {
      const email = request.email.trim();
      if (
        email &&
        email.toLowerCase() !== current.email?.toLowerCase() &&
        customers.some((c) => c.id !== id && c.email && c.email.toLowerCase() === email.toLowerCase())
      ) {
        throw new BusinessError('CUSTOMER_EMAIL_DUPLICATE', '電子信箱已存在');
      }
    }

    const nextTier = request.vipTier ?? current.vipTier;
    const updatedCustomer: Customer = {
      ...current,
      name: request.name !== undefined ? request.name.trim() : current.name,
      phone: request.phone !== undefined ? request.phone.trim() : current.phone,
      email:
        request.email === null
          ? null
          : request.email !== undefined
          ? request.email.trim() || null
          : current.email,
      vipTier: nextTier,
      vipTierName: getVipTierName(nextTier),
      note: request.note !== undefined ? request.note.trim() || undefined : current.note,
      updatedAt: nowIso(),
    };

    const nextCustomers = [...customers];
    nextCustomers[idx] = updatedCustomer;
    setCustomers(nextCustomers);
    return updatedCustomer;
  }

  async deleteCustomer(id: string): Promise<void> {
    await simulateDelay();
    const customers = getCustomers();
    setCustomers(customers.filter((c) => c.id !== id));
  }

  async updateCustomerSpending(customerId: string, amount: number, _earnedPoints?: number): Promise<boolean> {
    await simulateDelay();
    const customers = getCustomers();
    const idx = customers.findIndex((c) => c.id === customerId);
    if (idx === -1) return false;

    const nextCustomers = [...customers];
    nextCustomers[idx] = {
      ...nextCustomers[idx],
      totalSpent: nextCustomers[idx].totalSpent + amount,
      updatedAt: nowIso(),
    };
    setCustomers(nextCustomers);
    return true;
  }
}
