import type { StoreDto, CreateStoreRequest, DeleteStoreResponse } from '@/types/system';

export interface ISystemService {
  /** 取得所有門市分店清單 (對應 GET /system/stores) */
  getStores(): Promise<StoreDto[]>;

  /** 新增門市分店 (對應 POST /system/stores) */
  createStore(request: CreateStoreRequest): Promise<StoreDto>;

  /** 刪除門市分店 (對應 DELETE /system/stores/{storeName}) */
  deleteStore(storeName: string): Promise<DeleteStoreResponse>;
}
