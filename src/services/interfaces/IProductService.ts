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

export interface IProductService {
  searchProducts(params: ProductSearchParams): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  createProduct(product: CreateProductRequest): Promise<Product>;
  updateProduct(id: string, product: UpdateProductRequest): Promise<Product>;
  /** 單一商品調撥。來源不夠時丟 INSUFFICIENT_INVENTORY，兩邊數量都不改。 */
  transferStock(request: InventoryTransferRequest): Promise<boolean>;
  /** 把來源地點每一筆非零數量（含負數）搬到目標地點。綁定不變。 */
  moveAllStock(request: MoveAllInventoryRequest): Promise<boolean>;
  /** 把該地點設成絕對數量，可以是負數。 */
  adjustStock(request: InventoryAdjustRequest): Promise<boolean>;
  batchAdjustStock(request: BatchInventoryAdjustRequest): Promise<boolean>;
  getStockAdjustmentLogs(): Promise<InventoryAdjustmentLog[]>;
  createReceipt(request: CreateInventoryReceiptRequest): Promise<InventoryReceipt>;
  searchReceipts(query?: InventoryReceiptQuery): Promise<InventoryReceiptPage>;
  searchMovements(query?: InventoryMovementQuery): Promise<InventoryMovementPage>;
}
