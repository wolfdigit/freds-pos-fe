import type { IProductService } from './interfaces/IProductService';
import type { ICheckoutService } from './interfaces/ICheckoutService';
import type { ICustomerService } from './interfaces/ICustomerService';
import type { ILocationService } from './interfaces/ILocationService';

import { MockProductService } from './mock/mockProductService';
import { MockCheckoutService } from './mock/mockCheckoutService';
import { MockCustomerService } from './mock/mockCustomerService';
import { MockLocationService } from './mock/mockLocationService';
import { ensureInitialized, resetDemoData } from './mock/storageHelper';

import { HttpProductService } from './api/httpProductService';
import { HttpCheckoutService } from './api/httpCheckoutService';
import { HttpCustomerService } from './api/httpCustomerService';
import { HttpLocationService } from './api/httpLocationService';

/**
 * 讀取運行期設定檔（public/config.js -> window.__APP_CONFIG__）為預設值
 * 支援透過右上角切換按鈕寫入 localStorage ('USE_MOCK') 即時覆蓋模式
 */
export const isMockService = typeof window !== 'undefined'
  ? (() => {
      const stored = localStorage.getItem('USE_MOCK');
      if (stored !== null) {
        return stored === 'true';
      }
      return window.__APP_CONFIG__?.USE_MOCK ?? true;
    })()
  : true;

/**
 * 即時切換 Mock / API 連線模式並重新載入頁面
 * 若切換後的模式與 public/config.js 預設值一致，則主動清除 localStorage，以確保後續修改 config.js 直接生效
 */
export const toggleMockMode = (): void => {
  if (typeof window !== 'undefined') {
    const nextMode = !isMockService;
    const configDefault = window.__APP_CONFIG__?.USE_MOCK ?? true;

    if (nextMode === configDefault) {
      localStorage.removeItem('USE_MOCK');
    } else {
      localStorage.setItem('USE_MOCK', String(nextMode));
    }

    window.location.reload();
  }
};

if (isMockService) {
  ensureInitialized();
}

export const productService: IProductService = isMockService
  ? new MockProductService()
  : new HttpProductService();

export const checkoutService: ICheckoutService = isMockService
  ? new MockCheckoutService()
  : new HttpCheckoutService();

export const customerService: ICustomerService = isMockService
  ? new MockCustomerService()
  : new HttpCustomerService();

export const locationService: ILocationService = isMockService
  ? new MockLocationService()
  : new HttpLocationService();

export { resetDemoData };
