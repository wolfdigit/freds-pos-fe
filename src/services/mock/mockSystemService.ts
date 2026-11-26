import type { ISystemService } from '@/services/interfaces/ISystemService';
import type {
  StoreDto,
  CreateStoreRequest,
  UpdateStoreBindingRequest,
  DeleteStoreResponse,
  OAuthAccountDto,
  CreateOAuthAccountRequest,
  UpdateOAuthAccountRequest,
  StoreProductScope,
  StoreProductQuery,
  StoreProductPage,
  StoreProductBatchRequest,
  StoreProductChangeResult,
  CopyStoreProductsRequest,
  StoreProductItem,
} from '@/types/system';
import { STORE_PRODUCT_BATCH_MAX, storeProductScope } from '@/types/system';
import { isDelistedProduct } from '@/types/product';
import { isSkuMatch } from '@/utils/skuNormalizer';
import {
  accountGuardMessage,
  deletionBlock,
  demotionBlock,
  normalizeRole,
} from '@/auth/permissions';
import { simulateDelay, getProducts, getStoredStores, setStoredStores } from './storageHelper';
import {
  addListedProducts,
  deleteStoreList,
  readStoreProducts,
  removeListedProducts,
} from './storeProductCatalog';
import { defaultLocationRows, LOCATIONS_STORAGE_KEY, withSystemLocations } from './inventoryCatalog';
import type { InventoryLocationDto } from '@/types/inventory';
import { BusinessError } from '@/utils/errors';

const MOCK_ACCOUNTS_KEY = 'FREDS_POS_MOCK_OAUTH_ACCOUNTS';

export class MockSystemService implements ISystemService {
  async getStores(): Promise<StoreDto[]> {
    await simulateDelay(30, 80);
    return getStoredStores();
  }

  async createStore(request: CreateStoreRequest): Promise<StoreDto> {
    await simulateDelay(40, 100);
    const actor = await readMockActor();
    if (actor.role !== 'admin') {
      throw new BusinessError('AUTH_FORBIDDEN', '需要管理員權限');
    }
    const cleanName = request.name?.trim();
    if (!cleanName) {
      throw new BusinessError('INVALID_STORE_NAME', '門市名稱不可為空');
    }

    const current = getStoredStores();
    if (current.some((s) => s.name === cleanName)) {
      throw new BusinessError('DUPLICATE_STORE_NAME', `門市「${cleanName}」已存在`);
    }

    const normal = requireLocation(request.inventoryLocationId);
    const returned = requireLocation(request.returnedInventoryLocationId);
    // 沒指定預購保留時用系統地點「預購保留」。
    const preorder = request.preorderInventoryLocationId
      ? requireLocation(request.preorderInventoryLocationId)
      : systemLocation('preorder');
    const newStore: StoreDto = {
      name: cleanName,
      isDefault: current.length === 0,
      inventoryLocationId: normal.id,
      inventoryLocationName: normal.name,
      returnedInventoryLocationId: returned.id,
      returnedInventoryLocationName: returned.name,
      preorderInventoryLocationId: preorder.id,
      preorderInventoryLocationName: preorder.name,
      productScope: request.productScope ?? 'all',
    };

    setStoredStores([...current, newStore]);
    return newStore;
  }

  async rebindStore(storeName: string, request: UpdateStoreBindingRequest): Promise<StoreDto> {
    await simulateDelay(40, 100);
    const actor = await readMockActor();
    if (actor.role !== 'admin') {
      throw new BusinessError('AUTH_FORBIDDEN', '需要管理員權限');
    }
    const current = getStoredStores();
    const idx = current.findIndex((store) => store.name === storeName);
    if (idx === -1) throw new BusinessError('STORE_NOT_FOUND', `找不到門市「${storeName}」`);
    const normal = requireLocation(request.inventoryLocationId);
    const returned = requireLocation(request.returnedInventoryLocationId);
    // 省略預購保留時維持原綁定。
    const preorder = request.preorderInventoryLocationId
      ? requireLocation(request.preorderInventoryLocationId)
      : null;
    const updated: StoreDto = {
      ...current[idx],
      inventoryLocationId: normal.id,
      inventoryLocationName: normal.name,
      returnedInventoryLocationId: returned.id,
      returnedInventoryLocationName: returned.name,
      ...(preorder
        ? { preorderInventoryLocationId: preorder.id, preorderInventoryLocationName: preorder.name }
        : {}),
    };
    const next = [...current];
    next[idx] = updated;
    setStoredStores(next);
    return updated;
  }

  async deleteStore(storeName: string): Promise<DeleteStoreResponse> {
    await simulateDelay(40, 100);
    const current = getStoredStores();
    if (current.length <= 1) {
      throw new BusinessError('CANNOT_DELETE_LAST_STORE', '系統至少需保留一間門市，無法全數刪除');
    }

    const found = current.some((s) => s.name === storeName);
    if (!found) {
      throw new BusinessError('STORE_NOT_FOUND', `找不到門市「${storeName}」`);
    }

    const updated = current.filter((s) => s.name !== storeName);
    setStoredStores(updated);
    deleteStoreList(storeName);
    return {
      success: true,
      deletedStore: storeName,
    };
  }

  async listStoreChoices(): Promise<StoreDto[]> {
    await simulateDelay(20, 60);
    return getStoredStores().map((store) => ({ ...store, productScope: storeProductScope(store) }));
  }

  async setStoreProductScope(storeName: string, productScope: StoreProductScope): Promise<StoreDto> {
    // 一般店員也可以切換（跟後端一致）。
    await simulateDelay(30, 80);
    const current = getStoredStores();
    const idx = current.findIndex((store) => store.name === storeName);
    if (idx === -1) throw new BusinessError('STORE_NOT_FOUND', '找不到門市');
    const updated: StoreDto = { ...current[idx], productScope };
    const next = [...current];
    next[idx] = updated;
    setStoredStores(next);
    return updated;
  }

  async listStoreProducts(storeName: string, query: StoreProductQuery): Promise<StoreProductPage> {
    await simulateDelay(30, 80);
    const store = requireStore(storeName);
    const rows = new Map((readStoreProducts()[store.name] ?? []).map((row) => [row.productId, row]));
    const keyword = query.keyword?.trim() ?? '';
    const lower = keyword.toLowerCase();
    const visible = getProducts()
      .filter((product) => !isDelistedProduct(product))
      .sort((a, b) => a.sku.localeCompare(b.sku) || a.id.localeCompare(b.id));
    const matched = visible.filter((product) => {
      if (
        keyword &&
        !isSkuMatch(keyword, product.sku, product.barcode) &&
        !product.name.toLowerCase().includes(lower) &&
        !product.brand.toLowerCase().includes(lower)
      ) {
        return false;
      }
      if (query.inList === true) return rows.has(product.id);
      if (query.inList === false) return !rows.has(product.id);
      return true;
    });
    const start = (query.page - 1) * query.pageSize;
    const items: StoreProductItem[] = matched.slice(start, start + query.pageSize).map((product) => {
      const row = rows.get(product.id);
      return {
        productId: product.id,
        sku: product.sku,
        barcode: product.barcode,
        brand: product.brand,
        name: product.name,
        scale: product.scale ?? null,
        listPrice: product.listPrice,
        imageUrl: product.imageUrl ?? null,
        inList: Boolean(row),
        addedAt: row?.createdAt ?? null,
        addedBy: row?.createdBy ?? null,
      };
    });
    return {
      storeName: store.name,
      productScope: storeProductScope(store),
      listedTotal: visible.filter((product) => rows.has(product.id)).length,
      items,
      page: query.page,
      pageSize: query.pageSize,
      total: matched.length,
    };
  }

  async saveStoreProducts(storeName: string, request: StoreProductBatchRequest): Promise<StoreProductChangeResult> {
    await simulateDelay(30, 80);
    const store = requireStore(storeName);
    const add = uniqueIds(request.add);
    const remove = uniqueIds(request.remove);
    if (add.length === 0 && remove.length === 0) {
      throw new BusinessError('VALIDATION_ERROR', 'add 與 remove 至少要有一個商品');
    }
    if (add.length + remove.length > STORE_PRODUCT_BATCH_MAX) {
      throw new BusinessError('VALIDATION_ERROR', `一次最多變更 ${STORE_PRODUCT_BATCH_MAX} 個商品`);
    }
    const removeSet = new Set(remove);
    const both = add.find((id) => removeSet.has(id));
    if (both) throw new BusinessError('VALIDATION_ERROR', `同一個商品不能同時加入又移出 (ID: ${both})`);
    const products = new Map(getProducts().map((product) => [product.id, product]));
    const missing = add.find((id) => {
      const product = products.get(id);
      return !product || isDelistedProduct(product);
    });
    // 跟後端一樣整批不寫入。
    if (missing) throw new BusinessError('PRODUCT_NOT_FOUND', `找不到商品或商品已刪除 (ID: ${missing})`);
    const removed = removeListedProducts(store.name, remove);
    const added = addListedProducts(store.name, add, await readMockActorName());
    return changeResult(store, added, removed);
  }

  async copyStoreProducts(storeName: string, request: CopyStoreProductsRequest): Promise<StoreProductChangeResult> {
    await simulateDelay(40, 100);
    const store = requireStore(storeName);
    const source = requireStore(request.sourceStoreName.trim());
    if (source.name === store.name) return changeResult(store, 0, 0);
    const products = new Map(getProducts().map((product) => [product.id, product]));
    const sourceIds = (readStoreProducts()[source.name] ?? [])
      .map((row) => row.productId)
      .filter((id) => {
        const product = products.get(id);
        return product && !isDelistedProduct(product);
      });
    let removed = 0;
    if (request.replace) {
      const keep = new Set(sourceIds);
      const current = (readStoreProducts()[store.name] ?? []).map((row) => row.productId);
      removed = removeListedProducts(
        store.name,
        current.filter((id) => !keep.has(id))
      );
    }
    const added = addListedProducts(store.name, sourceIds, await readMockActorName());
    return changeResult(store, added, removed);
  }

  async listAccounts(): Promise<OAuthAccountDto[]> {
    await simulateDelay(20, 40);
    return readMockAccounts();
  }

  async createAccount(request: CreateOAuthAccountRequest): Promise<OAuthAccountDto> {
    await simulateDelay(20, 40);
    const actor = await readMockActor();
    if (actor.role !== 'admin') {
      throw new BusinessError('AUTH_FORBIDDEN', '需要管理員權限');
    }
    const email = request.email.trim().toLowerCase();
    const role = normalizeRole(request.role);
    const name = (request.name || '').trim();
    if (!role) throw new BusinessError('ACCOUNT_ROLE_INVALID', '角色只允許 admin 或 staff');
    if (name.length > 128) {
      throw new BusinessError('ACCOUNT_NAME_REQUIRED', '請設定 128 字以內的顯示名稱');
    }
    const accounts = readMockAccounts();
    if (accounts.some((account) => account.email.toLowerCase() === email)) {
      throw new BusinessError('CUSTOMER_EMAIL_DUPLICATE', '帳號已存在');
    }
    const created: OAuthAccountDto = {
      id: `mock-${crypto.randomUUID()}`,
      email,
      role,
      name,
      note: request.note ?? null,
    };
    writeMockAccounts([...accounts, created]);
    return created;
  }

  async updateAccount(email: string, request: UpdateOAuthAccountRequest): Promise<OAuthAccountDto> {
    await simulateDelay(20, 40);
    const actor = await readMockActor();
    if (actor.role !== 'admin') {
      throw new BusinessError('AUTH_FORBIDDEN', '需要管理員權限');
    }
    const accounts = readMockAccounts();
    const key = email.trim().toLowerCase();
    const current = accounts.find((account) => account.email.toLowerCase() === key);
    if (!current) throw new BusinessError('CUSTOMER_NOT_FOUND', '找不到帳號');
    const adminCount = accounts.filter((account) => account.role === 'admin').length;
    let role = current.role;
    if (request.role !== undefined) {
      const nextRole = normalizeRole(request.role);
      if (!nextRole) throw new BusinessError('ACCOUNT_ROLE_INVALID', '角色只允許 admin 或 staff');
      const blocked = demotionBlock({
        actorEmail: actor.email,
        targetEmail: current.email,
        targetRole: current.role,
        nextRole,
        adminCount,
      });
      if (blocked) throw new BusinessError(blocked === 'self' ? 'ACCOUNT_SELF_PROTECTED' : 'ACCOUNT_LAST_ADMIN', accountGuardMessage(blocked, 'demote'));
      role = nextRole;
    }
    let name = current.name ?? '';
    if (request.name !== undefined && request.name !== null) {
      name = request.name.trim();
      if (name.length > 128) {
        throw new BusinessError('ACCOUNT_NAME_REQUIRED', '請設定 128 字以內的顯示名稱');
      }
    }
    const updated: OAuthAccountDto = {
      ...current,
      role,
      name,
      note: request.note !== undefined ? request.note : current.note,
    };
    writeMockAccounts(accounts.map((account) => (account.email.toLowerCase() === key ? updated : account)));
    return updated;
  }

  async deleteAccount(email: string): Promise<void> {
    await simulateDelay(20, 40);
    const actor = await readMockActor();
    if (actor.role !== 'admin') {
      throw new BusinessError('AUTH_FORBIDDEN', '需要管理員權限');
    }
    const accounts = readMockAccounts();
    const key = email.trim().toLowerCase();
    const current = accounts.find((account) => account.email.toLowerCase() === key);
    if (!current) throw new BusinessError('CUSTOMER_NOT_FOUND', '找不到帳號');
    const adminCount = accounts.filter((account) => account.role === 'admin').length;
    const blocked = deletionBlock({
      actorEmail: actor.email,
      targetEmail: current.email,
      targetRole: current.role,
      adminCount,
    });
    if (blocked) {
      throw new BusinessError(
        blocked === 'self' ? 'ACCOUNT_SELF_PROTECTED' : 'ACCOUNT_LAST_ADMIN',
        accountGuardMessage(blocked, 'delete')
      );
    }
    writeMockAccounts(accounts.filter((account) => account.email.toLowerCase() !== key));
  }
}

function readMockAccounts(): OAuthAccountDto[] {
  const raw = localStorage.getItem(MOCK_ACCOUNTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as OAuthAccountDto[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeMockAccounts(accounts: OAuthAccountDto[]): void {
  localStorage.setItem(MOCK_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function mockLocations(): InventoryLocationDto[] {
  const raw = localStorage.getItem(LOCATIONS_STORAGE_KEY);
  const locations: InventoryLocationDto[] = raw ? (JSON.parse(raw) as InventoryLocationDto[]) : defaultLocationRows();
  return withSystemLocations(Array.isArray(locations) && locations.length > 0 ? locations : defaultLocationRows());
}

function requireLocation(locationId: string): InventoryLocationDto {
  const found = mockLocations().find((location) => location.id === locationId);
  if (!found) throw new BusinessError('LOCATION_NOT_FOUND', '找不到庫存地點');
  return found;
}

function systemLocation(role: 'company' | 'preorder' | 'defective'): InventoryLocationDto {
  const found = mockLocations().find((location) => location.systemRole === role);
  if (!found) throw new BusinessError('LOCATION_NOT_FOUND', '找不到系統庫存點');
  return found;
}

function requireStore(storeName: string): StoreDto {
  const store = getStoredStores().find((row) => row.name === storeName);
  if (!store) throw new BusinessError('STORE_NOT_FOUND', '找不到門市');
  return store;
}

function uniqueIds(ids: string[]): string[] {
  return Array.from(new Set(ids.map((id) => id.trim()).filter(Boolean)));
}

function changeResult(store: StoreDto, added: number, removed: number): StoreProductChangeResult {
  const products = new Map(getProducts().map((product) => [product.id, product]));
  const listedTotal = (readStoreProducts()[store.name] ?? []).filter((row) => {
    const product = products.get(row.productId);
    return product && !isDelistedProduct(product);
  }).length;
  return {
    storeName: store.name,
    productScope: storeProductScope(store),
    changed: added + removed,
    added,
    removed,
    listedTotal,
  };
}

async function readMockActorName(): Promise<string> {
  const { useSessionStore } = await import('@/store/sessionStore');
  return useSessionStore.getState().cashierName || '店長 Fred';
}

async function readMockActor(): Promise<{ email: string; role: string }> {
  const { useSessionStore } = await import('@/store/sessionStore');
  const state = useSessionStore.getState();
  return { email: state.oauthUser.email || '', role: state.userRole };
}
