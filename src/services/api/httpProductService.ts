import type { IProductService } from '@/services/interfaces/IProductService';
import type {
  Product,
  ProductSearchParams,
  CreateProductRequest,
  UpdateProductRequest,
} from '@/types/product';
import type {
  InventoryTransferRequest,
  StockAdjustRequest,
  BatchStockAdjustRequest,
  StockAdjustmentLog,
} from '@/types/inventory';
import { httpClient } from './httpClient';

export class HttpProductService implements IProductService {
  async searchProducts(params: ProductSearchParams): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params.keyword) query.set('keyword', params.keyword);
    if (params.scale && params.scale !== 'ALL') query.set('scale', params.scale);
    if (params.brand && params.brand !== 'ALL') query.set('brand', params.brand);
    if (params.inStockOnly !== undefined) query.set('inStockOnly', String(params.inStockOnly));

    const qs = query.toString();
    return httpClient.get<Product[]>(`/products${qs ? `?${qs}` : ''}`);
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      return await httpClient.get<Product>(`/products/${id}`);
    } catch {
      return null;
    }
  }

  async createProduct(product: CreateProductRequest): Promise<Product> {
    return httpClient.post<Product>('/products', product);
  }

  async updateProduct(id: string, product: UpdateProductRequest): Promise<Product> {
    return httpClient.put<Product>(`/products/${id}`, product);
  }

  async transferStock(request: InventoryTransferRequest): Promise<boolean> {
    const res = await httpClient.post<{ success: boolean }>('/inventory/transfer', request);
    return res.success ?? true;
  }

  async adjustStock(request: StockAdjustRequest): Promise<boolean> {
    const res = await httpClient.post<{ success: boolean }>('/inventory/adjust', request);
    return res.success ?? true;
  }

  async batchAdjustStock(request: BatchStockAdjustRequest): Promise<boolean> {
    const res = await httpClient.post<{ success: boolean }>('/inventory/batch-adjust', request);
    return res.success ?? true;
  }

  async getStockAdjustmentLogs(): Promise<StockAdjustmentLog[]> {
    return httpClient.get<StockAdjustmentLog[]>('/inventory/logs');
  }
}
