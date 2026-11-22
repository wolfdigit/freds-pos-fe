import { beforeEach, describe, expect, it } from 'vitest';
import { MockLocationService } from '@/services/mock/mockLocationService';
import { MockSystemService } from '@/services/mock/mockSystemService';
import { LOCATIONS_STORAGE_KEY, defaultLocationRows } from '@/services/mock/inventoryCatalog';
import { getStoredStores, setStoredStores } from '@/services/mock/storageHelper';
import { PREORDER_LOCATION_ID } from '@/types/inventory';

const COMPANY = 'e1a10003-0000-4000-8000-000000000003';
const RETURNED = 'e1a10005-0000-4000-8000-000000000005';

describe('mock system locations and preorder binding', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('marks 公司總倉 / 退貨品 / 預購保留 as system locations and refuses to delete them', async () => {
    const service = new MockLocationService();
    const rows = await service.getLocations();
    const roles = Object.fromEntries(rows.filter((row) => row.systemRole).map((row) => [row.systemRole, row.name]));
    expect(roles).toEqual({ company: '公司總倉', defective: '退貨品', preorder: '預購保留' });
    for (const id of [COMPANY, RETURNED, PREORDER_LOCATION_ID]) {
      await expect(service.deleteLocation(id, {})).rejects.toMatchObject({ code: 'SYSTEM_LOCATION' });
    }
    const renamed = await service.updateLocation(PREORDER_LOCATION_ID, { name: '預購區' });
    expect(renamed.systemRole).toBe('preorder');
  });

  it('adds 預購保留 to old stored locations and backfills old stores to it', async () => {
    const old = defaultLocationRows()
      .filter((row) => row.id !== PREORDER_LOCATION_ID)
      .map(({ systemRole: _role, ...row }) => row);
    localStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(old));
    setStoredStores([
      {
        name: '舊門市',
        inventoryLocationId: 'e1a10001-0000-4000-8000-000000000001',
        inventoryLocationName: '門市現貨',
        returnedInventoryLocationId: RETURNED,
        returnedInventoryLocationName: '退貨品',
      } as never,
    ]);
    const rows = await new MockLocationService().getLocations();
    const preorder = rows.find((row) => row.systemRole === 'preorder');
    expect(preorder?.id).toBe(PREORDER_LOCATION_ID);
    expect(preorder?.preorderStoreNames).toEqual(['舊門市']);
    expect(getStoredStores()[0]?.preorderInventoryLocationId).toBe(PREORDER_LOCATION_ID);
    expect(new MockSystemService()).toBeTruthy();
  });
});
