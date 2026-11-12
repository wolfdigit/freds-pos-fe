import type { IProductService } from '@/services/interfaces/IProductService';
import type { Product, ProductSearchParams, CreateProductRequest, UpdateProductRequest } from '@/types/product';
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
  InventoryMovement,
  InventoryMovementPage,
  InventoryMovementQuery,
} from '@/types/inventory';
import { getProducts, setProducts, getStockLogs, addStockLog, getStoredStores, simulateDelay } from './storageHelper';
import {
  MOVEMENTS_STORAGE_KEY,
  RECEIPTS_STORAGE_KEY,
  addQuantity,
  defaultLocationRows,
  loginStoreFrom,
  quantityAt,
  withStoreQuantities,
  resolveLocationId,
  setQuantity,
} from './inventoryCatalog';
import { isSkuMatch, normalizeSku } from '@/utils/skuNormalizer';
import { BusinessError } from '@/utils/errors';

function readJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readLocations(): Array<{ id: string; name: string }> {
  const stored = readJson<Array<{ id: string; name: string }>>(
    'FREDS_POS_LOCATIONS',
    defaultLocationRows()
  );
  return stored.length > 0 ? stored : defaultLocationRows();
}

function knownLocation(locationId: string): { id: string; name: string } {
  const id = resolveLocationId(locationId);
  const found = readLocations().find((location) => location.id === id);
  if (!found) throw new BusinessError('LOCATION_NOT_FOUND', '找不到庫存地點');
  return found;
}

async function presentAll(products: Product[]): Promise<Product[]> {
  const { useSessionStore } = await import('@/store/sessionStore');
  const name = useSessionStore.getState().storeName ?? '';
  const store = loginStoreFrom(getStoredStores(), name);
  return products.map((product) => withStoreQuantities(product, store));
}

function requireProduct(products: Product[], productId: string): number {
  const idx = products.findIndex((product) => product.id === productId);
  if (idx === -1) throw new BusinessError('PRODUCT_NOT_FOUND', '找不到指定商品');
  return idx;
}

async function operatorName(): Promise<string> {
  const { useSessionStore } = await import('@/store/sessionStore');
  return useSessionStore.getState().cashierName || '店長 Fred';
}

function writeMovement(movement: InventoryMovement): void {
  const current = readJson<InventoryMovement[]>(MOVEMENTS_STORAGE_KEY, []);
  localStorage.setItem(MOVEMENTS_STORAGE_KEY, JSON.stringify([movement, ...current]));
}

export class MockProductService implements IProductService {
  async searchProducts(params: ProductSearchParams): Promise<Product[]> {
    await simulateDelay();
    const products = await presentAll(getProducts());
    const keyword = params.keyword?.trim() ?? '';

    return products.filter((product) => {
      if (keyword) {
        const matchesSku = isSkuMatch(keyword, product.sku, product.barcode);
        const matchesName = product.name.toLowerCase().includes(keyword.toLowerCase());
        const matchesBrand = product.brand.toLowerCase().includes(keyword.toLowerCase());
        if (!matchesSku && !matchesName && !matchesBrand) return false;
      }
      if (params.scale && params.scale !== 'ALL' && product.scale !== params.scale) return false;
      if (params.brand && params.brand !== 'ALL' && product.brand !== params.brand) return false;
      if (params.inInventoryOnly && product.totalInventory <= 0) return false;
      return true;
    });
  }

  async getProductById(id: string): Promise<Product | null> {
    await simulateDelay();
    const found = getProducts().find((product) => product.id === id);
    if (!found) return null;
    return (await presentAll([found]))[0];
  }

  async createProduct(product: CreateProductRequest): Promise<Product> {
    await simulateDelay();
    const products = getProducts();
    const normalized = normalizeSku(product.sku);
    const exists = products.some(
      (item) => item.normalizedSku === normalized || item.sku.toLowerCase() === product.sku.trim().toLowerCase()
    );
    if (exists) throw new BusinessError('PRODUCT_SKU_DUPLICATE', '貨號已存在');

    const created: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      normalizedSku: normalized,
      inventories: [],
      totalInventory: 0,
      loginStoreQuantity: null,
      loginStoreReturnedQuantity: null,
      createdAt: new Date().toISOString(),
      createdBy: await operatorName(),
      updatedAt: new Date().toISOString(),
      updatedBy: await operatorName(),
    };
    setProducts([...products, created]);
    return (await presentAll([created]))[0];
  }

  async updateProduct(id: string, updates: UpdateProductRequest): Promise<Product> {
    await simulateDelay();
    const products = getProducts();
    const idx = requireProduct(products, id);
    const orig = products[idx];

    if (updates.sku && updates.sku.trim() !== orig.sku) {
      const nextNormalized = normalizeSku(updates.sku);
      const duplicate = products.some(
        (product) =>
          product.id !== id &&
          (product.normalizedSku === nextNormalized || product.sku.toLowerCase() === updates.sku!.trim().toLowerCase())
      );
      if (duplicate) throw new BusinessError('PRODUCT_SKU_DUPLICATE', '貨號已存在');
    }

    const updated: Product = {
      ...orig,
      ...updates,
      sku: updates.sku ? updates.sku.trim() : orig.sku,
      normalizedSku: updates.sku ? normalizeSku(updates.sku) : orig.normalizedSku,
      inventories: orig.inventories,
      totalInventory: orig.inventories.reduce((sum, row) => sum + row.quantity, 0),
      updatedAt: new Date().toISOString(),
      updatedBy: await operatorName(),
    };
    const next = [...products];
    next[idx] = updated;
    setProducts(next);
    return (await presentAll([updated]))[0];
  }

  async transferStock(request: InventoryTransferRequest): Promise<boolean> {
    await simulateDelay();
    const from = knownLocation(request.fromLocation);
    const to = knownLocation(request.toLocation);
    if (from.id === to.id) throw new BusinessError('INVALID_LOCATION_TRANSFER', '調出與調入地點不可相同');
    if (!Number.isInteger(request.quantity) || request.quantity < 1) {
      throw new BusinessError('INVALID_LOCATION_TRANSFER', '調撥數量至少為 1');
    }

    const products = getProducts();
    const idx = requireProduct(products, request.productId);
    if (quantityAt(products[idx], from.id) < request.quantity) {
      throw new BusinessError('INSUFFICIENT_INVENTORY', '調出地點庫存不足');
    }

    const locations = readLocations();
    let next = addQuantity(products[idx], from.id, -request.quantity, locations);
    next = addQuantity(next, to.id, request.quantity, locations);
    const copy = [...products];
    copy[idx] = next;
    setProducts(copy);

    const sourceId = `trf-${Date.now()}`;
    const operator = await operatorName();
    const createdAt = new Date().toISOString();
    writeMovement({
      id: `${sourceId}-out`,
      type: 'transfer_out',
      productId: request.productId,
      locationId: from.id,
      quantityDelta: -request.quantity,
      quantityAfter: quantityAt(next, from.id),
      reason: request.reason,
      sourceId,
      operatorName: operator,
      createdAt,
    });
    writeMovement({
      id: `${sourceId}-in`,
      type: 'transfer_in',
      productId: request.productId,
      locationId: to.id,
      quantityDelta: request.quantity,
      quantityAfter: quantityAt(next, to.id),
      reason: request.reason,
      sourceId,
      operatorName: operator,
      createdAt,
    });
    return true;
  }

  async moveAllStock(request: MoveAllInventoryRequest): Promise<boolean> {
    await simulateDelay();
    const from = knownLocation(request.fromLocation);
    const to = knownLocation(request.toLocation);
    if (from.id === to.id) throw new BusinessError('INVALID_LOCATION_TRANSFER', '調出與調入地點不可相同');

    const locations = readLocations();
    const products = getProducts();
    const sourceId = `trf-${Date.now()}`;
    const operator = await operatorName();
    const createdAt = new Date().toISOString();
    const next = products.map((product) => {
      const moved = quantityAt(product, from.id);
      if (moved === 0) return product;
      let updated = setQuantity(product, from.id, 0, locations);
      updated = addQuantity(updated, to.id, moved, locations);
      writeMovement({
        id: `${sourceId}-${product.id}-out`,
        type: 'transfer_out',
        productId: product.id,
        locationId: from.id,
        quantityDelta: -moved,
        quantityAfter: 0,
        reason: request.reason,
        sourceId,
        operatorName: operator,
        createdAt,
      });
      writeMovement({
        id: `${sourceId}-${product.id}-in`,
        type: 'transfer_in',
        productId: product.id,
        locationId: to.id,
        quantityDelta: moved,
        quantityAfter: quantityAt(updated, to.id),
        reason: request.reason,
        sourceId,
        operatorName: operator,
        createdAt,
      });
      return updated;
    });
    setProducts(next);
    return true;
  }

  async adjustStock(request: InventoryAdjustRequest): Promise<boolean> {
    await simulateDelay();
    if (!request.reason?.trim()) throw new BusinessError('INVALID_LOCATION_TRANSFER', '調整原因不可空白');
    const location = knownLocation(request.location);
    const products = getProducts();
    const idx = requireProduct(products, request.productId);
    const oldQty = quantityAt(products[idx], location.id);
    const updated = setQuantity(products[idx], location.id, request.newQuantity, readLocations());
    const copy = [...products];
    copy[idx] = updated;
    setProducts(copy);
    writeMovement({
      id: `adj-${Date.now()}`,
      type: 'adjust',
      productId: request.productId,
      locationId: location.id,
      quantityDelta: request.newQuantity - oldQty,
      quantityAfter: request.newQuantity,
      reason: request.reason.trim(),
      sourceId: `adj-${Date.now()}`,
      operatorName: await operatorName(),
      createdAt: new Date().toISOString(),
    });
    return true;
  }

  async batchAdjustStock(request: BatchInventoryAdjustRequest): Promise<boolean> {
    await simulateDelay();
    const note = request.note?.trim() ?? '';
    if (!note) throw new BusinessError('INVALID_LOCATION_TRANSFER', '備註不可空白');

    const locations = readLocations();
    const products = getProducts();
    const next = products.map((product) => ({ ...product, inventories: product.inventories.map((row) => ({ ...row })) }));
    let totalQtyChange = 0;
    const operator = await operatorName();
    const timestamp = new Date().toISOString();

    for (const item of request.adjustments) {
      const idx = next.findIndex((product) => product.id === item.productId);
      if (idx === -1) continue;
      let current = next[idx];
      for (const change of item.changes) {
        const location = knownLocation(change.location);
        const oldQty = quantityAt(current, location.id);
        current = setQuantity(current, location.id, change.newQty, locations);
        totalQtyChange += change.newQty - oldQty;
        writeMovement({
          id: `adj-${timestamp}-${item.productId}-${location.id}`,
          type: 'adjust',
          productId: item.productId,
          locationId: location.id,
          quantityDelta: change.newQty - oldQty,
          quantityAfter: change.newQty,
          reason: note,
          sourceId: `adj-${timestamp}`,
          operatorName: operator,
          createdAt: timestamp,
        });
      }
      next[idx] = current;
    }

    setProducts(next);
    const log: InventoryAdjustmentLog = {
      id: `log-${Date.now()}`,
      timestamp,
      operatorName: operator,
      items: request.adjustments,
      totalQtyChange,
      note,
    };
    addStockLog(log);
    return true;
  }

  async getStockAdjustmentLogs(): Promise<InventoryAdjustmentLog[]> {
    await simulateDelay();
    return getStockLogs();
  }

  async createReceipt(request: CreateInventoryReceiptRequest): Promise<InventoryReceipt> {
    await simulateDelay();
    const location = knownLocation(request.locationId);
    if (!request.items?.length) throw new BusinessError('PRODUCT_NOT_FOUND', '進貨明細不可空白');

    const merged = new Map<string, number>();
    for (const line of request.items) {
      if (!Number.isInteger(line.quantity) || line.quantity < 1) {
        throw new BusinessError('INVALID_LOCATION_TRANSFER', '進貨數量至少為 1');
      }
      merged.set(line.productId, (merged.get(line.productId) ?? 0) + line.quantity);
    }

    const products = getProducts();
    const locations = readLocations();
    const operator = await operatorName();
    const createdAt = new Date().toISOString();
    const receiptId = `rcp-${Date.now()}`;
    const items: InventoryReceipt['items'] = [];
    const next = products.map((product) => ({ ...product, inventories: product.inventories.map((row) => ({ ...row })) }));

    for (const [productId, quantity] of merged) {
      const idx = requireProduct(next, productId);
      const updated = addQuantity(next[idx], location.id, quantity, locations);
      next[idx] = updated;
      items.push({
        productId,
        sku: updated.sku,
        name: updated.name,
        quantity,
      });
      writeMovement({
        id: `${receiptId}-${productId}`,
        type: 'receipt',
        productId,
        sku: updated.sku,
        name: updated.name,
        locationId: location.id,
        quantityDelta: quantity,
        quantityAfter: quantityAt(updated, location.id),
        reason: request.note,
        sourceId: receiptId,
        operatorName: operator,
        createdAt,
      });
    }

    setProducts(next);
    const receipt: InventoryReceipt = {
      id: receiptId,
      locationId: location.id,
      locationName: location.name,
      supplier: request.supplier,
      note: request.note,
      operatorName: operator,
      createdAt,
      items,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    };
    const receipts = readJson<InventoryReceipt[]>(RECEIPTS_STORAGE_KEY, []);
    localStorage.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify([receipt, ...receipts]));
    return receipt;
  }

  async searchReceipts(query: InventoryReceiptQuery = {}): Promise<InventoryReceiptPage> {
    await simulateDelay();
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    let items = readJson<InventoryReceipt[]>(RECEIPTS_STORAGE_KEY, []);
    if (query.locationId) {
      const locationId = resolveLocationId(query.locationId);
      items = items.filter((receipt) => receipt.locationId === locationId);
    }
    if (query.productId) {
      items = items.filter((receipt) => receipt.items.some((item) => item.productId === query.productId));
    }
    const start = (page - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), page, pageSize, total: items.length };
  }

  async searchMovements(query: InventoryMovementQuery = {}): Promise<InventoryMovementPage> {
    await simulateDelay();
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    let items = readJson<InventoryMovement[]>(MOVEMENTS_STORAGE_KEY, []);
    if (query.productId) items = items.filter((row) => row.productId === query.productId);
    if (query.locationId) {
      const locationId = resolveLocationId(query.locationId);
      items = items.filter((row) => row.locationId === locationId);
    }
    if (query.type) items = items.filter((row) => row.type === query.type);
    const start = (page - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), page, pageSize, total: items.length };
  }
}
