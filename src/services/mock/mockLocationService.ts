import type { ILocationService } from '@/services/interfaces/ILocationService';
import type {
  StockLocationDto,
  CreateStockLocationRequest,
  UpdateStockLocationRequest,
  DeleteStockLocationRequest,
  DeleteStockLocationResponse,
} from '@/types/inventory';
import type { Product } from '@/types/product';
import { simulateDelay, STORAGE_KEYS } from './storageHelper';
import { BusinessError } from '@/utils/errors';

const DEFAULT_LOCATIONS: StockLocationDto[] = [
  { id: 'e1a10001-0000-4000-8000-000000000001', name: '門市現貨', icon: '🏪', isDefault: true, displayOrder: 1, isActive: true },
  { id: 'e1a10002-0000-4000-8000-000000000002', name: '後方倉庫', icon: '📦', isDefault: false, displayOrder: 2, isActive: true },
  { id: 'e1a10003-0000-4000-8000-000000000003', name: '公司總倉', icon: '🏢', isDefault: false, displayOrder: 3, isActive: true },
  { id: 'e1a10004-0000-4000-8000-000000000004', name: '調度暫存', icon: '🚚', isDefault: false, displayOrder: 4, isActive: true },
];

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class MockLocationService implements ILocationService {
  async getLocations(): Promise<StockLocationDto[]> {
    await simulateDelay(30, 80);
    const raw = localStorage.getItem('FREDS_POS_LOCATIONS');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // 確保每筆資料都有 id (UUID)
          const list: StockLocationDto[] = parsed.map((loc: any, idx: number) => ({
            id: loc.id || `e1a1000${idx + 1}-0000-4000-8000-00000000000${idx + 1}`,
            name: loc.name || '未命名據點',
            icon: loc.icon || '📍',
            isDefault: Boolean(loc.isDefault),
            displayOrder: loc.displayOrder ?? idx + 1,
            isActive: loc.isActive !== false,
          }));
          return list.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
        }
      } catch {
        // fallback
      }
    }
    return DEFAULT_LOCATIONS.slice().sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
  }

  async createLocation(location: CreateStockLocationRequest): Promise<StockLocationDto> {
    await simulateDelay(50, 100);
    const current = await this.getLocations();
    const newId = generateUuid();

    const newLoc: StockLocationDto = {
      id: newId,
      name: location.name.trim() || '未命名地點',
      icon: location.icon || '📍',
      isDefault: false,
      displayOrder: location.displayOrder ?? current.length + 1,
      isActive: location.isActive !== false,
    };

    const updated = [...current, newLoc];
    localStorage.setItem('FREDS_POS_LOCATIONS', JSON.stringify(updated));
    return newLoc;
  }

  async updateLocation(id: string, data: UpdateStockLocationRequest): Promise<StockLocationDto> {
    await simulateDelay(50, 100);
    const current = await this.getLocations();
    const idx = current.findIndex((l) => l.id === id);
    if (idx === -1) {
      throw new BusinessError('LOCATION_NOT_FOUND', `找不到庫存地點: ${id}`);
    }

    const updatedLoc: StockLocationDto = {
      ...current[idx],
      name: data.name !== undefined ? data.name.trim() : current[idx].name,
      icon: data.icon !== undefined ? data.icon : current[idx].icon,
      displayOrder: data.displayOrder !== undefined ? data.displayOrder : current[idx].displayOrder,
      isActive: data.isActive !== undefined ? data.isActive : current[idx].isActive,
    };

    const next = [...current];
    next[idx] = updatedLoc;
    localStorage.setItem('FREDS_POS_LOCATIONS', JSON.stringify(next));
    return updatedLoc;
  }

  async deleteLocation(id: string, request: DeleteStockLocationRequest): Promise<DeleteStockLocationResponse> {
    await simulateDelay(80, 150);
    const currentLocations = await this.getLocations();
    const targetLoc = currentLocations.find((l) => l.id === id);

    if (!targetLoc) {
      throw new BusinessError('LOCATION_NOT_FOUND', `找不到欲刪除的庫存地點: ${id}`);
    }

    if (targetLoc.id === request.transferToLocation) {
      throw new BusinessError('INVALID_LOCATION_TRANSFER', '轉移目標地點不能與被刪除地點相同');
    }

    const destLoc = currentLocations.find((l) => l.id === request.transferToLocation);
    if (!destLoc) {
      throw new BusinessError('TARGET_LOCATION_NOT_FOUND', `找不到轉移目標地點: ${request.transferToLocation}`);
    }

    // 1. 轉移商品庫存
    let affectedProductsCount = 0;
    let totalQuantityTransferred = 0;

    const rawProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (rawProducts) {
      try {
        const products: Product[] = JSON.parse(rawProducts);

        const updatedProducts = products.map((prod) => {
          const fromStock = prod.stocks.find((s) => s.location === targetLoc.id);
          const fromQty = fromStock ? fromStock.quantity : 0;

          if (fromQty > 0) {
            affectedProductsCount += 1;
            totalQuantityTransferred += fromQty;
          }

          // 重新計算 stocks: 移除被刪除地點，將數量合併入 destLoc.id
          const newStocks = prod.stocks.filter((s) => s.location !== targetLoc.id);
          const destStockIdx = newStocks.findIndex((s) => s.location === destLoc.id);

          if (destStockIdx !== -1) {
            newStocks[destStockIdx] = {
              ...newStocks[destStockIdx],
              quantity: newStocks[destStockIdx].quantity + fromQty,
            };
          } else if (fromQty > 0) {
            newStocks.push({
              location: destLoc.id,
              locationName: destLoc.name,
              quantity: fromQty,
            });
          }

          return {
            ...prod,
            stocks: newStocks,
          };
        });

        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedProducts));
      } catch {
        // ignore
      }
    }

    // 2. 從地點清單中移除
    const remainingLocations = currentLocations.filter((l) => l.id !== targetLoc.id);
    localStorage.setItem('FREDS_POS_LOCATIONS', JSON.stringify(remainingLocations));

    return {
      success: true,
      deletedLocation: targetLoc.id,
      transferredToLocation: destLoc.id,
      affectedProductsCount,
      totalQuantityTransferred,
      message: `成功刪除地點「${targetLoc.name}」，並將 ${affectedProductsCount} 項商品共 ${totalQuantityTransferred} 台庫存轉移至「${destLoc.name}」`,
    };
  }
}
