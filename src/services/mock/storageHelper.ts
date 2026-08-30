import { BusinessError } from '@/utils/errors';
import {
  INITIAL_PRODUCTS,
  INITIAL_PREORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
} from './mockDataSeed';
import type { Product } from '@/types/product';
import type { PreOrder } from '@/types/preorder';
import type { Customer } from '@/types/customer';
import type { CheckoutOrder } from '@/types/checkout';

export const STORAGE_KEYS = {
  PRODUCTS: 'FREDS_POS_PRODUCTS',
  PREORDERS: 'FREDS_POS_PREORDERS',
  CUSTOMERS: 'FREDS_POS_CUSTOMERS',
  ORDERS: 'FREDS_POS_ORDERS',
  STOCK_LOGS: 'FREDS_POS_STOCK_LOGS',
  INITIALIZED: 'FREDS_POS_INITIALIZED',
  SCHEMA_VERSION: 'FREDS_POS_SCHEMA_VERSION',
} as const;

// 每次修改 seed 資料結構（型別新增/移除欄位）時，遞增此版本號，
// 讓已存在瀏覽器中的舊資料自動失效並重新寫入 seed，避免開發期間手動清 localStorage。
export const CURRENT_SCHEMA_VERSION = '1';


/** 模擬非同步網路延遲，讓 Loading / Skeleton 呈現更真實 */
export function simulateDelay(minMs = 80, maxMs = 180): Promise<void> {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readRaw<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new BusinessError('STORAGE_CORRUPTED', `localStorage 資料損壞: ${key}`);
  }
}

function writeRaw<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

/** 寫入預設示範資料種子（首次啟動或 resetDemoData 時呼叫） */
function seedAll(): void {
  writeRaw(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  writeRaw(STORAGE_KEYS.PREORDERS, INITIAL_PREORDERS);
  writeRaw(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  writeRaw(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  writeRaw(STORAGE_KEYS.INITIALIZED, true);
  writeRaw(STORAGE_KEYS.SCHEMA_VERSION, CURRENT_SCHEMA_VERSION);
}

/** 確保 localStorage 已初始化，且 schema 版本一致；否則自動還原 seed */
export function ensureInitialized(): void {
  const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  const version = localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION);

  if (!initialized || version !== CURRENT_SCHEMA_VERSION) {
    seedAll();
    return;
  }

  try {
    readRaw(STORAGE_KEYS.PRODUCTS);
    readRaw(STORAGE_KEYS.PREORDERS);
    readRaw(STORAGE_KEYS.CUSTOMERS);
    readRaw(STORAGE_KEYS.ORDERS);
  } catch {
    seedAll();
  }
}

/** 全域重置示範資料（提供 UI 上的「重置示範資料」按鈕使用） */
export function resetDemoData(): void {
  seedAll();
}

export function getProducts(): Product[] {
  return readRaw<Product[]>(STORAGE_KEYS.PRODUCTS) ?? [];
}
export function setProducts(products: Product[]): void {
  writeRaw(STORAGE_KEYS.PRODUCTS, products);
}

export function getPreOrders(): PreOrder[] {
  return readRaw<PreOrder[]>(STORAGE_KEYS.PREORDERS) ?? [];
}
export function setPreOrders(preOrders: PreOrder[]): void {
  writeRaw(STORAGE_KEYS.PREORDERS, preOrders);
}

export function getCustomers(): Customer[] {
  return readRaw<Customer[]>(STORAGE_KEYS.CUSTOMERS) ?? [];
}
export function setCustomers(customers: Customer[]): void {
  writeRaw(STORAGE_KEYS.CUSTOMERS, customers);
}

export function getOrders(): CheckoutOrder[] {
  return readRaw<CheckoutOrder[]>(STORAGE_KEYS.ORDERS) ?? [];
}
export function setOrders(orders: CheckoutOrder[]): void {
  writeRaw(STORAGE_KEYS.ORDERS, orders);
}

export function getStockLogs(): any[] {
  return readRaw<any[]>(STORAGE_KEYS.STOCK_LOGS) ?? [];
}
export function addStockLog(log: any): void {
  const current = getStockLogs();
  writeRaw(STORAGE_KEYS.STOCK_LOGS, [log, ...current]);
}

