import type { StockLocation } from './product';

/** 庫存地點主檔 DTO (使用 UUID 作為 Primary Key) */
export interface StockLocationDto {
  id: string; // UUID Primary Key
  name: string;
  icon?: string;
  isDefault?: boolean;
  displayOrder?: number;
  isActive?: boolean;
}

export interface CreateStockLocationRequest {
  name: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateStockLocationRequest {
  name?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface DeleteStockLocationRequest {
  transferToLocation: StockLocation;
  reason?: string;
}

export interface DeleteStockLocationResponse {
  success: boolean;
  deletedLocation: StockLocation;
  transferredToLocation: StockLocation;
  affectedProductsCount: number;
  totalQuantityTransferred: number;
  message?: string;
}

/** 跨據點庫存調撥請求 */
export interface InventoryTransferRequest {
  productId: string;
  fromLocation: StockLocation;
  toLocation: StockLocation;
  quantity: number;
  reason?: string;
  operatorId?: string;
}

/** 手動調整庫存請求 */
export interface StockAdjustRequest {
  productId: string;
  location: StockLocation;
  newQuantity: number;
  reason: string;
}

export interface StockLocationChange {
  location: StockLocation;
  locationName: string;
  oldQty: number;
  newQty: number;
  diff: number;
}

export interface StockItemAdjustment {
  productId: string;
  sku: string;
  name: string;
  brand: string;
  barcode?: string;
  changes: StockLocationChange[];
  summaryText: string;
}

export interface BatchStockAdjustRequest {
  adjustments: StockItemAdjustment[];
  operatorName: string;
  timestamp: string;
  note?: string;
}

export interface StockAdjustmentLog {
  id: string;
  timestamp: string;
  operatorName: string;
  items: StockItemAdjustment[];
  totalQtyChange: number;
  note?: string;
}

