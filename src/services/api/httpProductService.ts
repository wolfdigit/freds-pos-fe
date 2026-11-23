import type { IProductService } from '@/services/interfaces/IProductService';
import { MAX_PRODUCT_PAGE_SIZE, STOCK_FILTER_KEYS, productAvailability } from '@/types/product';
import type {
  CartProductAvailability,
  Product,
  ProductPage,
  ProductPageParams,
  ProductSearchParams,
  CreateProductRequest,
  UpdateProductRequest,
} from '@/types/product';
import type {
  InventoryTransferRequest,
  InventoryAdjustRequest,
  BatchInventoryAdjustRequest,
  InventoryAdjustmentLog,
  MoveAllInventoryRequest,
  CreateInventoryReceiptRequest,
  InventoryReceipt,
  InventoryReceiptPage,
  InventoryReceiptQuery,
  InventoryMovementPage,
  InventoryMovementQuery,
} from '@/types/inventory';
import { ApiError, httpClient } from './httpClient';

function asLoginQuantity(value: number | null | undefined): number | null {
  return typeof value === 'number' ? value : null;
}

/** Keep a missing login store as null. Do not turn it into 0. */
function mapProduct(product: Product): Product {
  return {
    ...product,
    loginStoreQuantity: asLoginQuantity(product.loginStoreQuantity),
    loginStoreReturnedQuantity: asLoginQuantity(product.loginStoreReturnedQuantity),
  };
}

const inFlightProductRequests = new Map<string, Promise<unknown>>();

/**
 * 同一畫面同時送出的相同查詢（例如結帳頁的搜尋結果與同條碼比對）共用一次請求。
 * 只合併進行中的請求，不快取結果，庫存數字永遠是最新回應。
 */
function sharedProductGet<T>(endpoint: string): Promise<T> {
  const key = `${localStorage.getItem('AUTH_TOKEN') ?? ''}\n${endpoint}`;
  let request = inFlightProductRequests.get(key) as Promise<T> | undefined;
  if (!request) {
    request = httpClient.get<T>(endpoint).finally(() => {
      inFlightProductRequests.delete(key);
    });
    inFlightProductRequests.set(key, request);
  }
  return request;
}

function filterQuery(params: ProductSearchParams): URLSearchParams {
  const query = new URLSearchParams();
  if (params.keyword) query.set('keyword', params.keyword);
  if (params.scale && params.scale !== 'ALL') query.set('scale', params.scale);
  if (params.brand && params.brand !== 'ALL') query.set('brand', params.brand);
  if (params.inInventoryOnly !== undefined) query.set('inInventoryOnly', String(params.inInventoryOnly));
  if (params.allProducts) query.set('allProducts', 'true');
  for (const key of STOCK_FILTER_KEYS) {
    const value = params[key];
    if (value !== undefined && value !== '') query.set(key, String(value));
  }
  return query;
}

function productsEndpoint(query: URLSearchParams): string {
  const qs = query.toString();
  return `/products${qs ? `?${qs}` : ''}`;
}

function readProductPage(body: unknown, params: ProductPageParams): ProductPage {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new TypeError('商品列表回應不是分頁物件');
  }
  const page = body as Partial<ProductPage>;
  if (!Array.isArray(page.items) || typeof page.total !== 'number' || !Number.isFinite(page.total)) {
    throw new TypeError('商品列表回應不是分頁物件');
  }
  return {
    items: page.items.map(mapProduct),
    page: typeof page.page === 'number' ? page.page : params.page,
    pageSize: typeof page.pageSize === 'number' ? page.pageSize : params.pageSize,
    total: page.total,
  };
}

export class HttpProductService implements IProductService {
  async searchProductPage(params: ProductPageParams): Promise<ProductPage> {
    const query = filterQuery(params);
    query.set('page', String(params.page));
    query.set('pageSize', String(params.pageSize));
    return readProductPage(await sharedProductGet<unknown>(productsEndpoint(query)), params);
  }

  async getProductsByBarcode(barcode: string, options?: { allProducts?: boolean }): Promise<Product[]> {
    const code = barcode.trim();
    if (!code) return [];
    const params = { page: 1, pageSize: MAX_PRODUCT_PAGE_SIZE, ...(options?.allProducts ? { allProducts: true } : {}) };
    const query = filterQuery(params);
    query.set('barcode', code);
    query.set('page', String(params.page));
    query.set('pageSize', String(params.pageSize));
    return readProductPage(await sharedProductGet<unknown>(productsEndpoint(query)), params).items;
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      return mapProduct(await httpClient.get<Product>(`/products/${id}`));
    } catch {
      return null;
    }
  }

  async checkProductAvailability(id: string): Promise<CartProductAvailability> {
    try {
      const product = await httpClient.get<Product>(`/products/${encodeURIComponent(id)}`, {
        silentToast: true,
      });
      return productAvailability(product);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404 && err.code === 'PRODUCT_NOT_FOUND') {
        return 'missing';
      }
      return 'unknown';
    }
  }

  async createProduct(product: CreateProductRequest): Promise<Product> {
    return mapProduct(await httpClient.post<Product>('/products', product));
  }

  async updateProduct(id: string, product: UpdateProductRequest): Promise<Product> {
    return mapProduct(await httpClient.put<Product>(`/products/${id}`, product));
  }

  async transferStock(request: InventoryTransferRequest): Promise<boolean> {
    const res = await httpClient.post<{ ok?: boolean }>('/inventory/transfers', request);
    return res.ok ?? true;
  }

  async moveAllStock(request: MoveAllInventoryRequest): Promise<boolean> {
    const res = await httpClient.post<{ ok?: boolean }>('/inventory/transfers/all', request);
    return res.ok ?? true;
  }

  async adjustStock(request: InventoryAdjustRequest): Promise<boolean> {
    const res = await httpClient.post<{ ok?: boolean }>('/inventory/adjustments', request);
    return res.ok ?? true;
  }

  async batchAdjustStock(request: BatchInventoryAdjustRequest): Promise<boolean> {
    const res = await httpClient.post<{ ok?: boolean }>('/inventory/batch-adjustments', {
      adjustments: request.adjustments,
      note: request.note,
    });
    return res.ok ?? true;
  }

  async getStockAdjustmentLogs(): Promise<InventoryAdjustmentLog[]> {
    return httpClient.get<InventoryAdjustmentLog[]>('/inventory/adjustments/logs');
  }

  async createReceipt(request: CreateInventoryReceiptRequest): Promise<InventoryReceipt> {
    return httpClient.post<InventoryReceipt>('/inventory/receipts', request);
  }

  async searchReceipts(query: InventoryReceiptQuery = {}): Promise<InventoryReceiptPage> {
    const params = new URLSearchParams();
    if (query.locationId) params.set('locationId', query.locationId);
    if (query.productId) params.set('productId', query.productId);
    if (query.page) params.set('page', String(query.page));
    if (query.pageSize) params.set('pageSize', String(query.pageSize));
    const qs = params.toString();
    return httpClient.get<InventoryReceiptPage>(`/inventory/receipts${qs ? `?${qs}` : ''}`);
  }

  async searchMovements(query: InventoryMovementQuery = {}): Promise<InventoryMovementPage> {
    const params = new URLSearchParams();
    if (query.productId) params.set('productId', query.productId);
    if (query.locationId) params.set('locationId', query.locationId);
    if (query.type) params.set('type', query.type);
    if (query.page) params.set('page', String(query.page));
    if (query.pageSize) params.set('pageSize', String(query.pageSize));
    const qs = params.toString();
    return httpClient.get<InventoryMovementPage>(`/inventory/movements${qs ? `?${qs}` : ''}`);
  }
}
