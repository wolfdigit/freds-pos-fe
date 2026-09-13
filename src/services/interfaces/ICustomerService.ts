import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerSearchParams,
  CustomerSearchResponse,
} from '@/types/customer';

export interface ICustomerService {
  /** 搜尋會員清單（支援關鍵字、VIP 等級與分頁） */
  searchCustomers(params?: CustomerSearchParams | string): Promise<CustomerSearchResponse>;
  /** 依 ID 取得單一會員 */
  getCustomerById(id: string): Promise<Customer | null>;
  /** 新增會員 */
  createCustomer(request: CreateCustomerRequest): Promise<Customer>;
  /** 更新會員基本資料 */
  updateCustomer(id: string, request: UpdateCustomerRequest): Promise<Customer | null>;
  /** 刪除會員 */
  deleteCustomer(id: string): Promise<void>;
  /** 更新會員累計消費（結帳後由 CheckoutService 內部調用） */
  updateCustomerSpending(customerId: string, amount: number, earnedPoints: number): Promise<boolean>;
}
