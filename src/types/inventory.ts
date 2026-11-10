import type { StockLocation } from './product';

/** Seeded when the location table is empty. Ids match the backend inventory contract. */
export const DEFAULT_INVENTORY_LOCATIONS = [
  {
    id: 'e1a10001-0000-4000-8000-000000000001',
    name: '門市現貨',
    icon: '🏪',
    isDefault: true,
    displayOrder: 1,
    legacyKey: 'store',
  },
  {
    id: 'e1a10002-0000-4000-8000-000000000002',
    name: '後方倉庫',
    icon: '📦',
    isDefault: false,
    displayOrder: 2,
    legacyKey: 'warehouse',
  },
  {
    id: 'e1a10003-0000-4000-8000-000000000003',
    name: '公司總倉',
    icon: '🏢',
    isDefault: false,
    displayOrder: 3,
    legacyKey: 'company',
  },
  {
    id: 'e1a10004-0000-4000-8000-000000000004',
    name: '調度暫存',
    icon: '🚚',
    isDefault: false,
    displayOrder: 4,
    legacyKey: 'other',
  },
  {
    id: 'e1a10005-0000-4000-8000-000000000005',
    name: '退貨品',
    icon: '↩️',
    isDefault: false,
    displayOrder: 5,
    legacyKey: 'returned',
  },
] as const;

export const LEGACY_LOCATION_IDS: Record<string, string> = Object.fromEntries(
  DEFAULT_INVENTORY_LOCATIONS.map((location) => [location.legacyKey, location.id])
);

/** 庫存地點。沒有啟用旗標；店家綁定決定它扮演正常貨或退貨。 */
export interface InventoryLocationDto {
  id: string;
  name: string;
  icon?: string;
  isDefault?: boolean;
  displayOrder?: number;
  /** 把這個地點當正常貨的門市 */
  storeNames: string[];
  /** 把這個地點當退貨的門市 */
  returnedStoreNames: string[];
}

export interface CreateInventoryLocationRequest {
  name: string;
  icon?: string;
  displayOrder?: number;
}

export interface UpdateInventoryLocationRequest {
  name?: string;
  icon?: string;
  displayOrder?: number;
}

export type StoreBindingRole = 'normal' | 'returned';

export interface ReboundStore {
  name: string;
  binding: StoreBindingRole;
  inventoryLocationId: string;
}

export interface DeleteInventoryLocationRequest {
  /** 仍有門市綁定時必填，且必須是另一個既有地點。 */
  rebindToLocation?: string;
}

export interface DeleteInventoryLocationResponse {
  deletedLocation: string;
  reboundStoreNames: ReboundStore[];
}

export interface InventoryTransferRequest {
  productId: string;
  fromLocation: StockLocation;
  toLocation: StockLocation;
  quantity: number;
  reason?: string;
}

export interface MoveAllInventoryRequest {
  fromLocation: string;
  toLocation: string;
  reason?: string;
}

export interface InventoryAdjustRequest {
  productId: string;
  location: StockLocation;
  /** 絕對數量，可以是負數。 */
  newQuantity: number;
  reason: string;
}

export interface InventoryLocationChange {
  location: StockLocation;
  locationName: string;
  oldQty: number;
  newQty: number;
  diff: number;
}

export interface InventoryItemAdjustment {
  productId: string;
  sku: string;
  name: string;
  brand: string;
  barcode?: string;
  changes: InventoryLocationChange[];
  summaryText: string;
}

/** `note` 必填。操作人員與時間由伺服器決定，不要送。 */
export interface BatchInventoryAdjustRequest {
  adjustments: InventoryItemAdjustment[];
  note: string;
}

export interface InventoryAdjustmentLog {
  id: string;
  timestamp: string;
  operatorName: string;
  items: InventoryItemAdjustment[];
  totalQtyChange: number;
  note?: string;
}

export interface InventoryReceiptLineRequest {
  productId: string;
  quantity: number;
}

export interface CreateInventoryReceiptRequest {
  locationId: string;
  supplier?: string;
  note?: string;
  items: InventoryReceiptLineRequest[];
}

export interface InventoryReceiptItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
}

export interface InventoryReceipt {
  id: string;
  locationId: string;
  locationName: string;
  supplier?: string;
  note?: string;
  operatorName: string;
  createdAt: string;
  items: InventoryReceiptItem[];
  totalQuantity: number;
}

export interface InventoryReceiptPage {
  items: InventoryReceipt[];
  page: number;
  pageSize: number;
  total: number;
}

export type InventoryMovementType =
  | 'receipt'
  | 'transfer_out'
  | 'transfer_in'
  | 'adjust'
  | 'sale'
  | 'return_restock';

export interface InventoryMovement {
  id: string;
  type: InventoryMovementType | string;
  productId: string;
  sku?: string;
  name?: string;
  locationId: string;
  quantityDelta: number;
  quantityAfter: number;
  reason?: string;
  sourceId: string;
  operatorName: string;
  createdAt: string;
}

export interface InventoryMovementPage {
  items: InventoryMovement[];
  page: number;
  pageSize: number;
  total: number;
}

export interface InventoryReceiptQuery {
  locationId?: string;
  productId?: string;
  page?: number;
  pageSize?: number;
}

export interface InventoryMovementQuery {
  productId?: string;
  locationId?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}
