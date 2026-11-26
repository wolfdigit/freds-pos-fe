import type {
  CartProductAvailability,
  Product,
  ProductPage,
  ProductPageParams,
  CreateProductRequest,
  ProductStoreScope,
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
  /** 分頁查詢，回傳一頁與總筆數。 */
  searchProductPage(params: ProductPageParams): Promise<ProductPage>;
  /**
   * 條碼完全相符的商品（同條碼的其他貨號）。走分頁查詢；
   * storeName 改看那間門市的清單，allProducts 略過清單。
   */
  getProductsByBarcode(barcode: string, options?: ProductStoreScope): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  /** 結帳前重新確認購物車商品還在。不跳 Toast；查不到結果時回 unknown。 */
  checkProductAvailability(id: string): Promise<CartProductAvailability>;
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
