import type { IProductService } from '@/services/interfaces/IProductService';
import type {
  Product,
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
import { httpClient } from './httpClient';

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

const inFlightProductSearches = new Map<string, Promise<Product[]>>();

export class HttpProductService implements IProductService {
  async searchProducts(params: ProductSearchParams): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params.keyword) query.set('keyword', params.keyword);
    if (params.scale && params.scale !== 'ALL') query.set('scale', params.scale);
    if (params.brand && params.brand !== 'ALL') query.set('brand', params.brand);
    if (params.inInventoryOnly !== undefined) query.set('inInventoryOnly', String(params.inInventoryOnly));

    const qs = query.toString();
    const endpoint = `/products${qs ? `?${qs}` : ''}`;
    // 同一畫面同時送出的相同查詢（例如結帳頁的搜尋結果與同條碼比對）共用一次請求。
    // 只合併進行中的請求，不快取結果，庫存數字永遠是最新回應。
    const key = `${localStorage.getItem('AUTH_TOKEN') ?? ''}\n${endpoint}`;
    let request = inFlightProductSearches.get(key);
    if (!request) {
      request = httpClient
        .get<Product[]>(endpoint)
        .then((rows) => (rows || []).map(mapProduct))
        .finally(() => {
          inFlightProductSearches.delete(key);
        });
      inFlightProductSearches.set(key, request);
    }
    return (await request).slice();
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      return mapProduct(await httpClient.get<Product>(`/products/${id}`));
    } catch {
      return null;
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
