import type { Product, ProductSearchParams } from '@/types/product';
import type {
  InventoryTransferRequest,
  StockAdjustRequest,
  BatchStockAdjustRequest,
  StockAdjustmentLog,
} from '@/types/inventory';

export interface IProductService {
  /** 模糊搜尋商品 (支援條碼、貨號無 dash 比對、車型名稱) */
  searchProducts(params: ProductSearchParams): Promise<Product[]>;
  /** 依 ID 取得單一商品 */
  getProductById(id: string): Promise<Product | null>;
  /** 新增商品建檔 */
  createProduct(product: Omit<Product, 'id' | 'totalStock' | 'preOrderPendingCount' | 'normalizedSku'>): Promise<Product>;
  /** 更新既有商品資訊 (品名、條碼、價格等) */
  updateProduct(id: string, product: Partial<Product>): Promise<Product>;
  /** 跨據點庫存調撥 (門市/倉庫/公司) */
  transferStock(request: InventoryTransferRequest): Promise<boolean>;
  /** 手動單一調整庫存數量 */
  adjustStock(request: StockAdjustRequest): Promise<boolean>;
  /** 批量調整庫存數量並紀錄操作日誌 */
  batchAdjustStock(request: BatchStockAdjustRequest): Promise<boolean>;
  /** 取得庫存操作歷史日誌 */
  getStockAdjustmentLogs(): Promise<StockAdjustmentLog[]>;
}

