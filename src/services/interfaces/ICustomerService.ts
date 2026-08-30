import type { Customer } from '@/types/customer';

export interface ICustomerService {
  /** 依電話、姓名或關鍵字搜尋會員 */
  searchCustomers(query: string): Promise<Customer[]>;
  /** 依 ID 取得單一會員 */
  getCustomerById(id: string): Promise<Customer | null>;
  /** 依電話精確查詢（結帳櫃檯綁定會員用） */
  getCustomerByPhone(phone: string): Promise<Customer | null>;
  /** 新增會員 */
  createCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer>;
  /** 更新會員基本資料 */
  updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null>;
  /** 更新會員點數與累計消費（結帳後由 CheckoutService 內部調用） */
  updateCustomerSpending(customerId: string, amount: number, earnedPoints: number): Promise<boolean>;
}
