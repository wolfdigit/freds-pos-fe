import { MockProductService } from './mock/mockProductService';
import { MockCheckoutService } from './mock/mockCheckoutService';
import { MockPreOrderService } from './mock/mockPreOrderService';
import { MockCustomerService } from './mock/mockCustomerService';
import { ensureInitialized, resetDemoData } from './mock/storageHelper';

ensureInitialized();

// 目前使用 Mock 實作，未來只需在此替換為 HttpProductService 等
export const productService = new MockProductService();
export const checkoutService = new MockCheckoutService();
export const preOrderService = new MockPreOrderService();
export const customerService = new MockCustomerService();

export { resetDemoData };
