import { describe, expect, it } from 'vitest';
import type { InventoryLocationDto } from '@/types/inventory';
import {
  CREATE_PRODUCT_LOCATION_ROLES,
  PRODUCT_DETAIL_LOCATION_ROLES,
  resolveFeaturedLocations,
} from './featuredLocations';

function makeLocation(partial: Partial<InventoryLocationDto> & { id: string; name: string }): InventoryLocationDto {
  return {
    storeNames: [],
    returnedStoreNames: [],
    preorderStoreNames: [],
    systemRole: null,
    ...partial,
  };
}

describe('resolveFeaturedLocations', () => {
  const storeSale = makeLocation({ id: 'loc-store', name: '台北門市現貨', storeNames: ['台北店'] });
  const storePreorder = makeLocation({ id: 'loc-store-pre', name: '台北預購區', preorderStoreNames: ['台北店'] });
  const storeReturned = makeLocation({ id: 'loc-store-ret', name: '台北退貨區', returnedStoreNames: ['台北店'] });
  const sysCompany = makeLocation({ id: 'loc-company', name: '公司總倉', systemRole: 'company' });
  const sysPreorder = makeLocation({ id: 'loc-sys-pre', name: '預購保留', systemRole: 'preorder' });
  const sysReturned = makeLocation({ id: 'loc-sys-ret', name: '退貨品', systemRole: 'defective' });
  const warehouse = makeLocation({ id: 'loc-wh', name: '後方倉庫' });

  it('lists all 4 distinct locations for create product when store bindings do not overlap system defaults', () => {
    const locations = [storeSale, storePreorder, storeReturned, sysCompany, sysPreorder, sysReturned, warehouse];
    const result = resolveFeaturedLocations(locations, '台北店', CREATE_PRODUCT_LOCATION_ROLES);
    expect(result.map((e) => ({ id: e.location.id, roles: e.roles }))).toEqual([
      { id: 'loc-store', roles: ['storeSale'] },
      { id: 'loc-store-pre', roles: ['storePreorder'] },
      { id: 'loc-company', roles: ['systemCompany'] },
      { id: 'loc-sys-pre', roles: ['systemPreorder'] },
    ]);
  });

  it('merges overlapping store and system locations in create product', () => {
    const sharedPreorder = makeLocation({
      id: 'loc-sys-pre',
      name: '預購保留',
      systemRole: 'preorder',
      preorderStoreNames: ['台北店'],
    });
    const sharedCompanySale = makeLocation({
      id: 'loc-company',
      name: '公司總倉',
      systemRole: 'company',
      storeNames: ['台北店'],
    });
    const result = resolveFeaturedLocations([sharedCompanySale, sharedPreorder, warehouse], '台北店', CREATE_PRODUCT_LOCATION_ROLES);
    expect(result.map((e) => ({ id: e.location.id, roles: e.roles }))).toEqual([
      { id: 'loc-company', roles: ['storeSale', 'systemCompany'] },
      { id: 'loc-sys-pre', roles: ['storePreorder', 'systemPreorder'] },
    ]);
  });

  it('lists all 6 distinct locations for product detail and merges overlaps', () => {
    const distinct = resolveFeaturedLocations(
      [storeSale, storePreorder, storeReturned, sysCompany, sysPreorder, sysReturned, warehouse],
      '台北店',
      PRODUCT_DETAIL_LOCATION_ROLES
    );
    expect(distinct.map((e) => e.location.id)).toEqual([
      'loc-store',
      'loc-store-pre',
      'loc-store-ret',
      'loc-company',
      'loc-sys-pre',
      'loc-sys-ret',
    ]);

    const sharedPre = makeLocation({
      id: 'loc-sys-pre',
      name: '預購保留',
      systemRole: 'preorder',
      preorderStoreNames: ['台北店'],
    });
    const sharedRet = makeLocation({
      id: 'loc-sys-ret',
      name: '退貨品',
      systemRole: 'defective',
      returnedStoreNames: ['台北店'],
    });
    const merged = resolveFeaturedLocations(
      [storeSale, sysCompany, sharedPre, sharedRet, warehouse],
      '台北店',
      PRODUCT_DETAIL_LOCATION_ROLES
    );
    expect(merged.map((e) => ({ id: e.location.id, roles: e.roles }))).toEqual([
      { id: 'loc-store', roles: ['storeSale'] },
      { id: 'loc-sys-pre', roles: ['storePreorder', 'systemPreorder'] },
      { id: 'loc-sys-ret', roles: ['storeReturned', 'systemReturned'] },
      { id: 'loc-company', roles: ['systemCompany'] },
    ]);
  });

  it('still returns system defaults when no login store is selected', () => {
    const result = resolveFeaturedLocations([storeSale, sysCompany, sysPreorder, sysReturned], '', CREATE_PRODUCT_LOCATION_ROLES);
    expect(result.map((e) => e.location.id)).toEqual(['loc-company', 'loc-sys-pre']);
  });
});
