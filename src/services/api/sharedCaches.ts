import type { InventoryLocationDto } from '@/types/inventory';
import type { StoreDto } from '@/types/system';
import { invalidateLoginStores } from '@/auth/storePrefetch';
import { httpClient } from './httpClient';
import { createSharedRequest } from './sharedRequest';

/**
 * 多個畫面／元件都會讀的清單。短時間內共用同一次請求，
 * 任何門市或庫存點的新增、修改、刪除都會讓它們全部作廢。
 */

/** /system/stores 的共用時間。 */
export const STORE_RECORDS_TTL_MS = 30_000;
/** /inventory/locations 的共用時間。 */
export const LOCATIONS_TTL_MS = 30_000;

export const storeRecords = createSharedRequest<StoreDto[]>(
  () => httpClient.get<StoreDto[]>('/system/stores').then((data) => data || []),
  STORE_RECORDS_TTL_MS
);

export const locationList = createSharedRequest<InventoryLocationDto[]>(
  () =>
    httpClient.get<InventoryLocationDto[]>('/inventory/locations').then((data) =>
      (data || [])
        .map((location) => ({
          ...location,
          storeNames: location.storeNames ?? [],
          returnedStoreNames: location.returnedStoreNames ?? [],
        }))
        .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999))
    ),
  LOCATIONS_TTL_MS
);

export function invalidateStoreRecords(): void {
  storeRecords.invalidate();
}

export function invalidateLocations(): void {
  locationList.invalidate();
}

/** 門市或庫存點有任何寫入後呼叫：門市資料、登入門市清單、庫存點清單都會重新查詢。 */
export function invalidateStoreAndLocationCaches(): void {
  storeRecords.invalidate();
  locationList.invalidate();
  invalidateLoginStores();
}
