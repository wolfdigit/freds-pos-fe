import type { IProductService } from './interfaces/IProductService';
import type { ICheckoutService } from './interfaces/ICheckoutService';
import type { IPreOrderService } from './interfaces/IPreOrderService';
import type { ICustomerService } from './interfaces/ICustomerService';

import { MockProductService } from './mock/mockProductService';
import { MockCheckoutService } from './mock/mockCheckoutService';
import { MockPreOrderService } from './mock/mockPreOrderService';
import { MockCustomerService } from './mock/mockCustomerService';
import { ensureInitialized, resetDemoData } from './mock/storageHelper';

import { HttpProductService } from './api/httpProductService';
import { HttpCheckoutService } from './api/httpCheckoutService';
import { HttpPreOrderService } from './api/httpPreOrderService';
import { HttpCustomerService } from './api/httpCustomerService';

/**
 * 讀取運行期設定檔（public/config.js -> window.__APP_CONFIG__）
 * 預設若未定義則啟用 Mock 模式
 */
export const isMockService = typeof window !== 'undefined'
  ? (window.__APP_CONFIG__?.USE_MOCK ?? true)
  : true;

if (isMockService) {
  ensureInitialized();
}

export const productService: IProductService = isMockService
  ? new MockProductService()
  : new HttpProductService();

export const checkoutService: ICheckoutService = isMockService
  ? new MockCheckoutService()
  : new HttpCheckoutService();

export const preOrderService: IPreOrderService = isMockService
  ? new MockPreOrderService()
  : new HttpPreOrderService();

export const customerService: ICustomerService = isMockService
  ? new MockCustomerService()
  : new HttpCustomerService();

export { resetDemoData };
