import type { LocationInventory, Product } from '@/types/product';
import {
  DEFAULT_INVENTORY_LOCATIONS,
  LEGACY_LOCATION_IDS,
  type InventoryLocationDto,
} from '@/types/inventory';
import type { StoreDto } from '@/types/system';

export const LOCATIONS_STORAGE_KEY = 'FREDS_POS_LOCATIONS';
export const RECEIPTS_STORAGE_KEY = 'FREDS_POS_INVENTORY_RECEIPTS';
export const MOVEMENTS_STORAGE_KEY = 'FREDS_POS_INVENTORY_MOVEMENTS';

export interface LegacySeedProduct {
  id: string;
  sku: string;
  normalizedSku?: string;
  barcode?: string;
  brand?: string;
  name?: string;
  scale?: string;
  spec?: string;
  imageUrl?: string;
  listPrice?: number;
  note?: string;
  stocks?: Array<{ location: string; locationName?: string; quantity?: number }>;
  inventories?: Array<{ location: string; locationName?: string; quantity?: number }>;
  totalStock?: number;
  totalInventory?: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  [key: string]: unknown;
}

export function defaultLocationRows(): InventoryLocationDto[] {
  return DEFAULT_INVENTORY_LOCATIONS.map((location) => ({
    id: location.id,
    name: location.name,
    icon: location.icon,
    isDefault: location.isDefault,
    displayOrder: location.displayOrder,
    storeNames: [],
    returnedStoreNames: [],
  }));
}

export function resolveLocationId(raw: string): string {
  return LEGACY_LOCATION_IDS[raw] ?? raw;
}

export function locationNameFor(locationId: string, locations: Array<{ id: string; name: string }>): string {
  return locations.find((location) => location.id === locationId)?.name ?? locationId;
}

function mapInventoryRow(
  row: { location: string; locationName?: string; quantity?: number },
  locations: Array<{ id: string; name: string }>
): LocationInventory {
  const location = resolveLocationId(row.location);
  return {
    location,
    locationName: locationNameFor(location, locations) || row.locationName || location,
    quantity: row.quantity ?? 0,
  };
}

export function normalizeSeedProduct(raw: LegacySeedProduct, locations = defaultLocationRows()): Product {
  const source = raw.inventories ?? raw.stocks ?? [];
  const inventories = source.map((row) => mapInventoryRow(row, locations));
  const totalInventory = inventories.reduce((sum, row) => sum + row.quantity, 0);
  return {
    id: raw.id,
    sku: raw.sku,
    normalizedSku: raw.normalizedSku ?? raw.sku.replace(/-/g, ''),
    barcode: raw.barcode ?? '',
    brand: raw.brand ?? '',
    name: raw.name ?? '',
    scale: raw.scale,
    spec: raw.spec,
    imageUrl: raw.imageUrl,
    listPrice: raw.listPrice ?? 0,
    inventories,
    totalInventory,
    loginStoreQuantity: 0,
    loginStoreReturnedQuantity: 0,
    note: raw.note,
    createdAt: raw.createdAt,
    createdBy: raw.createdBy,
    updatedAt: raw.updatedAt,
    updatedBy: raw.updatedBy,
  };
}

export function quantityAt(product: Pick<Product, 'inventories'>, locationId: string): number {
  const id = resolveLocationId(locationId);
  return product.inventories.find((row) => row.location === id)?.quantity ?? 0;
}

export function withStoreQuantities(product: Product, store: StoreDto | null): Product {
  const totalInventory = product.inventories.reduce((sum, row) => sum + row.quantity, 0);
  return {
    ...product,
    totalInventory,
    loginStoreQuantity: store ? quantityAt(product, store.inventoryLocationId) : 0,
    loginStoreReturnedQuantity: store ? quantityAt(product, store.returnedInventoryLocationId) : 0,
  };
}

export function readPersistedStoreName(): string {
  try {
    const raw = localStorage.getItem('FREDS_POS_SESSION');
    if (!raw) return '';
    const parsed = JSON.parse(raw) as { state?: { storeName?: unknown } };
    return typeof parsed?.state?.storeName === 'string' ? parsed.state.storeName : '';
  } catch {
    return '';
  }
}

export function loginStoreFrom(stores: StoreDto[], storeName: string): StoreDto | null {
  if (stores.length === 0) return null;
  return stores.find((store) => store.name === storeName) ?? stores[0];
}

export function presentProduct(product: Product, stores: StoreDto[], storeName: string): Product {
  return withStoreQuantities(product, loginStoreFrom(stores, storeName));
}

export function setQuantity(
  product: Product,
  locationId: string,
  quantity: number,
  locations: Array<{ id: string; name: string }>
): Product {
  const id = resolveLocationId(locationId);
  const name = locationNameFor(id, locations);
  const inventories = product.inventories.map((row) => ({ ...row }));
  const existing = inventories.find((row) => row.location === id);
  if (existing) {
    existing.quantity = quantity;
    existing.locationName = name;
  } else {
    inventories.push({ location: id, locationName: name, quantity });
  }
  return {
    ...product,
    inventories,
    totalInventory: inventories.reduce((sum, row) => sum + row.quantity, 0),
  };
}

export function addQuantity(
  product: Product,
  locationId: string,
  delta: number,
  locations: Array<{ id: string; name: string }>
): Product {
  return setQuantity(product, locationId, quantityAt(product, locationId) + delta, locations);
}

export function attachStoreBindings(
  locations: InventoryLocationDto[],
  stores: StoreDto[]
): InventoryLocationDto[] {
  return locations
    .map((location) => ({
      ...location,
      storeNames: stores.filter((store) => store.inventoryLocationId === location.id).map((store) => store.name),
      returnedStoreNames: stores
        .filter((store) => store.returnedInventoryLocationId === location.id)
        .map((store) => store.name),
    }))
    .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999) || a.id.localeCompare(b.id));
}

export function renameInventoryCopies(products: Product[], locationId: string, name: string): Product[] {
  return products.map((product) => ({
    ...product,
    inventories: product.inventories.map((row) =>
      row.location === locationId ? { ...row, locationName: name } : row
    ),
  }));
}
