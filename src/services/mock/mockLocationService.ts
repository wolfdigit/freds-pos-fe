import type { ILocationService } from '@/services/interfaces/ILocationService';
import type {
  InventoryLocationDto,
  CreateInventoryLocationRequest,
  UpdateInventoryLocationRequest,
  DeleteInventoryLocationRequest,
  DeleteInventoryLocationResponse,
  ReboundStore,
} from '@/types/inventory';
import { getProducts, getStoredStores, setProducts, setStoredStores, simulateDelay } from './storageHelper';
import {
  LOCATIONS_STORAGE_KEY,
  attachStoreBindings,
  defaultLocationRows,
  quantityAt,
  renameInventoryCopies,
} from './inventoryCatalog';
import { BusinessError } from '@/utils/errors';

function readStoredLocations(): InventoryLocationDto[] {
  const raw = localStorage.getItem(LOCATIONS_STORAGE_KEY);
  if (!raw) return defaultLocationRows();
  try {
    const parsed = JSON.parse(raw) as InventoryLocationDto[];
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultLocationRows();
    return parsed.map((location, index) => ({
      id: location.id,
      name: location.name || '未命名據點',
      icon: location.icon || '📍',
      isDefault: Boolean(location.isDefault),
      displayOrder: location.displayOrder ?? index + 1,
      storeNames: [],
      returnedStoreNames: [],
    }));
  } catch {
    return defaultLocationRows();
  }
}

function writeLocations(locations: InventoryLocationDto[]): void {
  localStorage.setItem(
    LOCATIONS_STORAGE_KEY,
    JSON.stringify(locations.map(({ storeNames: _storeNames, returnedStoreNames: _returned, ...location }) => location))
  );
}

function listed(): InventoryLocationDto[] {
  return attachStoreBindings(readStoredLocations(), getStoredStores());
}

export class MockLocationService implements ILocationService {
  async getLocations(): Promise<InventoryLocationDto[]> {
    await simulateDelay(30, 80);
    return listed();
  }

  async createLocation(location: CreateInventoryLocationRequest): Promise<InventoryLocationDto> {
    await simulateDelay(50, 100);
    const name = location.name.trim();
    if (!name) throw new BusinessError('INVALID_LOCATION_TRANSFER', '地點名稱不可空白');
    const current = readStoredLocations();
    if (current.some((row) => row.name === name)) {
      throw new BusinessError('LOCATION_NAME_TAKEN', '庫存點名稱已存在');
    }
    const created: InventoryLocationDto = {
      id: crypto.randomUUID(),
      name,
      icon: location.icon || '📍',
      isDefault: false,
      displayOrder: location.displayOrder ?? current.length + 1,
      storeNames: [],
      returnedStoreNames: [],
    };
    writeLocations([...current, created]);
    return attachStoreBindings([created], getStoredStores())[0];
  }

  async updateLocation(id: string, data: UpdateInventoryLocationRequest): Promise<InventoryLocationDto> {
    await simulateDelay(50, 100);
    const current = readStoredLocations();
    const idx = current.findIndex((location) => location.id === id);
    if (idx === -1) throw new BusinessError('LOCATION_NOT_FOUND', '找不到庫存地點');
    const name = data.name !== undefined ? data.name.trim() : current[idx].name;
    if (!name) throw new BusinessError('INVALID_LOCATION_TRANSFER', '地點名稱不可空白');
    if (current.some((location) => location.id !== id && location.name === name)) {
      throw new BusinessError('LOCATION_NAME_TAKEN', '庫存點名稱已存在');
    }
    const updated: InventoryLocationDto = {
      ...current[idx],
      name,
      icon: data.icon !== undefined ? data.icon : current[idx].icon,
      displayOrder: data.displayOrder !== undefined ? data.displayOrder : current[idx].displayOrder,
    };
    const next = [...current];
    next[idx] = updated;
    writeLocations(next);
    if (name !== current[idx].name) {
      setProducts(renameInventoryCopies(getProducts(), id, name));
      const stores = getStoredStores().map((store) => ({
        ...store,
        inventoryLocationName: store.inventoryLocationId === id ? name : store.inventoryLocationName,
        returnedInventoryLocationName:
          store.returnedInventoryLocationId === id ? name : store.returnedInventoryLocationName,
      }));
      setStoredStores(stores);
    }
    return attachStoreBindings([updated], getStoredStores())[0];
  }

  async deleteLocation(
    id: string,
    request: DeleteInventoryLocationRequest
  ): Promise<DeleteInventoryLocationResponse> {
    await simulateDelay(80, 150);
    const current = readStoredLocations();
    const source = current.find((location) => location.id === id);
    if (!source) throw new BusinessError('LOCATION_NOT_FOUND', '找不到欲刪除的庫存地點');
    if (current.length <= 1) throw new BusinessError('LAST_LOCATION', '至少要保留一個庫存點');

    const products = getProducts();
    const blocked = products.some((product) => quantityAt(product, source.id) !== 0);
    if (blocked) {
      throw new BusinessError('LOCATION_NOT_EMPTY', '庫存點仍有數量（含負數），請先轉移或將數量改為 0');
    }

    const stores = getStoredStores();
    const bound = stores.filter(
      (store) => store.inventoryLocationId === source.id || store.returnedInventoryLocationId === source.id
    );
    const rebound: ReboundStore[] = [];
    let nextStores = stores;
    if (bound.length > 0) {
      if (!request.rebindToLocation) {
        throw new BusinessError('INVALID_LOCATION_TRANSFER', '請指定這些門市要改綁的庫存點');
      }
      const target = current.find((location) => location.id === request.rebindToLocation);
      if (!target || target.id === source.id) {
        throw new BusinessError('INVALID_LOCATION_TRANSFER', '改綁目標不能是即將刪除的庫存點');
      }
      nextStores = stores.map((store) => {
        let next = store;
        if (store.inventoryLocationId === source.id) {
          next = { ...next, inventoryLocationId: target.id, inventoryLocationName: target.name };
          rebound.push({ name: store.name, binding: 'normal', inventoryLocationId: target.id });
        }
        if (store.returnedInventoryLocationId === source.id) {
          next = {
            ...next,
            returnedInventoryLocationId: target.id,
            returnedInventoryLocationName: target.name,
          };
          rebound.push({ name: store.name, binding: 'returned', inventoryLocationId: target.id });
        }
        return next;
      });
      setStoredStores(nextStores);
    }

    setProducts(
      products.map((product) => ({
        ...product,
        inventories: product.inventories.filter((row) => row.location !== source.id),
        totalInventory: product.inventories
          .filter((row) => row.location !== source.id)
          .reduce((sum, row) => sum + row.quantity, 0),
      }))
    );
    writeLocations(current.filter((location) => location.id !== source.id));
    return { deletedLocation: source.id, reboundStoreNames: rebound };
  }
}
