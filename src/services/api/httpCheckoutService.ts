import type { ICheckoutService } from '@/services/interfaces/ICheckoutService';
import type {
  CheckoutOrder,
  CheckoutOrderPage,
  CreateOrderPayload,
  CheckoutReceipt,
  OrderPageParams,
  OrderSearchParams,
} from '@/types/checkout';
import { hasOrderHistoryFilter, ORDER_HISTORY_FILTER_REQUIRED } from '@/types/checkout';
import { httpClient } from './httpClient';

/** Backend rejects pageSize above 100. Callers still receive every matching order. */
const ORDER_HISTORY_PAGE_SIZE = 100;

/** POST /checkout/orders 專用逾時。 */
export const CHECKOUT_TIMEOUT_MS = 60_000;

function setText(query: URLSearchParams, key: string, value: string | undefined): void {
  if (value) query.set(key, value);
}

function setAmount(query: URLSearchParams, key: string, value: number | undefined): void {
  if (typeof value === 'number' && Number.isFinite(value)) {
    query.set(key, String(value));
  }
}

function orderHistoryQuery(params?: OrderSearchParams | string): URLSearchParams {
  const query = new URLSearchParams();
  if (typeof params === 'string') {
    setText(query, 'customerId', params);
    return query;
  }
  if (!params) return query;

  setText(query, 'customerId', params.customerId);
  setText(query, 'orderNumber', params.orderNumber);
  setText(query, 'productId', params.productId);
  setText(query, 'keyword', params.keyword);
  setText(query, 'productKeyword', params.productKeyword);
  setText(query, 'startDate', params.startDate);
  setText(query, 'endDate', params.endDate);
  setAmount(query, 'minAmount', params.minAmount);
  setAmount(query, 'maxAmount', params.maxAmount);
  if (params.status && params.status !== 'all') query.set('status', params.status);
  return query;
}

function readOrderPage(body: unknown): CheckoutOrderPage {
  if (!body || typeof body !== 'object') {
    throw new TypeError('訂單列表回應不是分頁物件');
  }
  const page = body as Partial<CheckoutOrderPage>;
  if (!Array.isArray(page.items) || typeof page.total !== 'number' || !Number.isFinite(page.total)) {
    throw new TypeError('訂單列表回應不是分頁物件');
  }
  return {
    items: page.items,
    total: page.total,
    page: typeof page.page === 'number' ? page.page : 1,
    pageSize: typeof page.pageSize === 'number' ? page.pageSize : page.items.length,
  };
}

async function fetchAllOrderHistory(filters: URLSearchParams): Promise<CheckoutOrder[]> {
  const items: CheckoutOrder[] = [];
  let page = 1;
  let reachedEnd = false;

  while (!reachedEnd) {
    const query = new URLSearchParams(filters);
    query.set('page', String(page));
    query.set('pageSize', String(ORDER_HISTORY_PAGE_SIZE));
    const body = readOrderPage(await httpClient.get<unknown>(`/checkout/orders?${query.toString()}`));
    if (body.items.length === 0) {
      reachedEnd = true;
      continue;
    }
    items.push(...body.items);
    reachedEnd = items.length >= body.total;
    page += 1;
  }

  return items;
}

export class HttpCheckoutService implements ICheckoutService {
  async createCheckoutOrder(payload: CreateOrderPayload, idempotencyKey?: string): Promise<CheckoutReceipt> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['X-Idempotency-Key'] = idempotencyKey;
    }
    // 結帳在後端要鎖 session、扣庫存、寫多張表，冷啟動時可能超過預設 15 秒。
    // 錯誤訊息由 useCheckoutWorkflow 統一顯示，避免逾時時先跳「請求逾時」又跳結果未確認。
    return httpClient.post<CheckoutReceipt>('/checkout/orders', payload, {
      headers,
      timeoutMs: CHECKOUT_TIMEOUT_MS,
      silentToast: true,
    });
  }

  async getOrderHistory(params?: OrderSearchParams | string): Promise<CheckoutOrder[]> {
    const filters = typeof params === 'string' ? { customerId: params } : params;
    // 沒有條件就會把全部歷史訂單一頁頁抓完，直接拒絕；清單畫面請用 searchOrderPage。
    if (!hasOrderHistoryFilter(filters)) throw new Error(ORDER_HISTORY_FILTER_REQUIRED);
    return fetchAllOrderHistory(orderHistoryQuery(params));
  }

  async searchOrderPage(params: OrderPageParams): Promise<CheckoutOrderPage> {
    const { page, pageSize, ...filters } = params;
    const query = orderHistoryQuery(filters);
    query.set('page', String(Math.max(1, Math.floor(page))));
    query.set('pageSize', String(Math.min(Math.max(1, Math.floor(pageSize)), ORDER_HISTORY_PAGE_SIZE)));
    return readOrderPage(await httpClient.get<unknown>(`/checkout/orders?${query.toString()}`));
  }

  async getRecentOrders(limit: number): Promise<CheckoutOrder[]> {
    const pageSize = Math.min(Math.max(1, Math.floor(limit)), ORDER_HISTORY_PAGE_SIZE);
    const query = new URLSearchParams({ page: '1', pageSize: String(pageSize) });
    // 後端依建立時間新到舊排序，第一頁就是最近的訂單。
    return readOrderPage(await httpClient.get<unknown>(`/checkout/orders?${query.toString()}`)).items;
  }

  async getOrderById(orderId: string): Promise<CheckoutOrder | null> {
    try {
      return await httpClient.get<CheckoutOrder>(`/checkout/orders/${orderId}`);
    } catch {
      return null;
    }
  }
}
