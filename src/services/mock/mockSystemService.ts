import type { ISystemService } from '@/services/interfaces/ISystemService';
import type { StoreDto, CreateStoreRequest, DeleteStoreResponse } from '@/types/system';
import { simulateDelay, getStoredStores, setStoredStores } from './storageHelper';
import { BusinessError } from '@/utils/errors';

export class MockSystemService implements ISystemService {
  async getStores(): Promise<StoreDto[]> {
    await simulateDelay(30, 80);
    return getStoredStores();
  }

  async createStore(request: CreateStoreRequest): Promise<StoreDto> {
    await simulateDelay(40, 100);
    const cleanName = request.name?.trim();
    if (!cleanName) {
      throw new BusinessError('INVALID_STORE_NAME', '門市名稱不可為空');
    }

    const current = getStoredStores();
    if (current.some((s) => s.name === cleanName)) {
      throw new BusinessError('DUPLICATE_STORE_NAME', `門市「${cleanName}」已存在`);
    }

    const newStore: StoreDto = {
      name: cleanName,
      isDefault: current.length === 0,
    };

    const updated = [...current, newStore];
    setStoredStores(updated);
    return newStore;
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
    return {
      success: true,
      deletedStore: storeName,
    };
  }
}
