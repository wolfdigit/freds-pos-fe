import { describe, expect, it } from 'vitest';
import { orderLocationsForStore } from './locationOrder';

function loc(
  id: string,
  displayOrder: number,
  bindings: { normal?: string[]; returned?: string[]; preorder?: string[]; role?: 'company' | 'preorder' | 'defective' } = {}
) {
  return {
    id,
    name: id,
    displayOrder,
    storeNames: bindings.normal ?? [],
    returnedStoreNames: bindings.returned ?? [],
    preorderStoreNames: bindings.preorder ?? [],
    systemRole: bindings.role ?? null,
  };
}

const LOCATIONS = [
  loc('unbound-wh', 2),
  loc('company', 3, { role: 'company' }),
  loc('defective', 5, { role: 'defective', returned: ['奇可門市'] }),
  loc('preorder', 6, { role: 'preorder', preorder: ['奇可門市', '台南快閃店'] }),
  loc('main-shelf', 1, { normal: ['奇可門市'] }),
  loc('popup-shelf', 10, { normal: ['台南快閃店'] }),
  loc('popup-returned', 11, { returned: ['台南快閃店'] }),
  loc('temp', 4),
];

const ids = (storeName: string | null) => orderLocationsForStore(LOCATIONS, storeName).map((row) => row.id);

describe('orderLocationsForStore', () => {
  it('puts the store sellable, preorder, returned first, then the system locations, other stores, unbound', () => {
    expect(ids('台南快閃店')).toEqual([
      'popup-shelf',
      'preorder',
      'popup-returned',
      'company',
      'defective',
      'main-shelf',
      'unbound-wh',
      'temp',
    ]);
  });

  it('lists a location bound to the store and also a system location only once, at its earliest place', () => {
    // 奇可門市的預購與退貨綁在系統地點：預購保留在退貨品之前，接著才是公司總倉。
    expect(ids('奇可門市')).toEqual([
      'main-shelf',
      'preorder',
      'defective',
      'company',
      'popup-shelf',
      'popup-returned',
      'unbound-wh',
      'temp',
    ]);
  });

  it('starts with the system locations when there is no store', () => {
    expect(ids(null)).toEqual([
      'company',
      'preorder',
      'defective',
      'main-shelf',
      'popup-shelf',
      'popup-returned',
      'unbound-wh',
      'temp',
    ]);
  });

  it('does not change the input array', () => {
    const before = LOCATIONS.map((row) => row.id);
    orderLocationsForStore(LOCATIONS, '奇可門市');
    expect(LOCATIONS.map((row) => row.id)).toEqual(before);
  });
});
