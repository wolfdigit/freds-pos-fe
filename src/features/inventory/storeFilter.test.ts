import { describe, expect, it } from 'vitest';
import type { StoreDto } from '@/types/system';
import {
  ALL_PRODUCTS_FILTER,
  defaultStoreFilter,
  focusStoreName,
  selectedStoreScope,
  storeFilterButtons,
  storeFilterScope,
} from './storeFilter';

function store(name: string, productScope: 'all' | 'list' = 'all'): StoreDto {
  return {
    name,
    inventoryLocationId: `${name}-shelf`,
    inventoryLocationName: '',
    returnedInventoryLocationId: 'ret',
    returnedInventoryLocationName: '',
    preorderInventoryLocationId: 'pre',
    preorderInventoryLocationName: '',
    productScope,
  };
}

const STORES = [store('線上網購'), store('台南快閃店', 'list'), store('奇可門市')];

describe('inventory store filter', () => {
  it('orders buttons: login store, all products, then the other stores by name', () => {
    const labels = storeFilterButtons(STORES, '奇可門市').map((button) => button.label);
    expect(labels[0]).toBe('奇可門市');
    expect(labels[1]).toBe('全部商品');
    expect(labels.slice(2)).toEqual(['台南快閃店', '線上網購'].sort((a, b) => a.localeCompare(b, 'zh-Hant')));
  });

  it('has no login store button for an admin without a store and defaults to all products', () => {
    expect(storeFilterButtons(STORES, '').map((button) => button.label)[0]).toBe('全部商品');
    expect(defaultStoreFilter('')).toEqual(ALL_PRODUCTS_FILTER);
    expect(defaultStoreFilter('奇可門市')).toEqual({ kind: 'store', storeName: '奇可門市' });
  });

  it('sends storeName only for another store and allProducts for 全部商品', () => {
    expect(storeFilterScope({ kind: 'store', storeName: '奇可門市' }, '奇可門市')).toEqual({});
    expect(storeFilterScope({ kind: 'store', storeName: '台南快閃店' }, '奇可門市')).toEqual({ storeName: '台南快閃店' });
    expect(storeFilterScope(ALL_PRODUCTS_FILTER, '奇可門市')).toEqual({ allProducts: true });
  });

  it('focuses the selected store, or the login store for 全部商品', () => {
    expect(focusStoreName({ kind: 'store', storeName: '台南快閃店' }, '奇可門市')).toBe('台南快閃店');
    expect(focusStoreName(ALL_PRODUCTS_FILTER, '奇可門市')).toBe('奇可門市');
    expect(focusStoreName(ALL_PRODUCTS_FILTER, '')).toBeNull();
  });

  it('reads the selected store product scope', () => {
    expect(selectedStoreScope({ kind: 'store', storeName: '台南快閃店' }, STORES)).toBe('list');
    expect(selectedStoreScope({ kind: 'store', storeName: '奇可門市' }, STORES)).toBe('all');
    expect(selectedStoreScope(ALL_PRODUCTS_FILTER, STORES)).toBeNull();
  });
});
