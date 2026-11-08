import { describe, expect, it } from 'vitest';
import { setBoundCartUserId } from '@/auth/cartOwner';
import { useCartStore } from '@/store/cartStore';
import { useSessionStore } from '@/store/sessionStore';
import type { Product } from '@/types/product';
import {
  defaultTransferLocations,
  LEGACY_SHARED_STOCK_LOCATION_ID,
  quantityAtMappedLocation,
  restockShelfLabel,
} from './stockLocation';

const SHELF_A = '11111111-1111-4111-8111-111111111111';
const SHELF_B = '22222222-2222-4222-8222-222222222222';

const uuidStocks = [
  { location: SHELF_A, locationName: '甲倉', quantity: 5 },
  { location: SHELF_B, locationName: '乙倉', quantity: 2 },
];

describe('quantityAtMappedLocation', () => {
  it('reads each mapped UUID and does not borrow another location or the mock store row', () => {
    expect(quantityAtMappedLocation(uuidStocks, SHELF_A)).toBe(5);
    expect(quantityAtMappedLocation(uuidStocks, SHELF_B)).toBe(2);
    expect(quantityAtMappedLocation(uuidStocks, '33333333-3333-4333-8333-333333333333')).toBe(0);
    expect(
      quantityAtMappedLocation(
        [...uuidStocks, { location: 'store', locationName: '門市現貨', quantity: 9 }],
        SHELF_B
      )
    ).toBe(2);
  });

  it('uses the store key only for the known shared location id', () => {
    const legacy = [
      { location: 'store', locationName: '門市現貨', quantity: 4 },
      { location: SHELF_B, locationName: '乙倉', quantity: 2 },
    ];
    expect(quantityAtMappedLocation(legacy, LEGACY_SHARED_STOCK_LOCATION_ID)).toBe(4);
    expect(quantityAtMappedLocation(legacy, null)).toBe(4);
    expect(quantityAtMappedLocation(legacy, SHELF_B)).toBe(2);
  });
});

describe('restockShelfLabel', () => {
  it('names the current login store mapping instead of a fixed shared shelf', () => {
    expect(restockShelfLabel('乙店', { stockLocationId: SHELF_B, stockLocationName: '乙倉' })).toBe(
      '「乙店」對應的乙倉'
    );
    expect(restockShelfLabel('舊店', { stockLocationId: LEGACY_SHARED_STOCK_LOCATION_ID, stockLocationName: '門市現貨' })).toBe(
      '「舊店」對應的門市現貨'
    );
  });
});

describe('defaultTransferLocations', () => {
  it('aims the transfer at the mapped UUID row instead of the store or warehouse keys', () => {
    expect(
      defaultTransferLocations({
        optionIds: [LEGACY_SHARED_STOCK_LOCATION_ID, SHELF_A, SHELF_B],
        stocks: uuidStocks,
        mappedLocationId: SHELF_B,
      })
    ).toEqual({ fromLocation: SHELF_A, toLocation: SHELF_B });
  });
});

describe('cart mapped quantity refresh', () => {
  it('replaces the cart shelf quantity when the login store mapping changes', () => {
    const product = {
      id: 'prod-uuid',
      sku: 'SKU-UUID',
      normalizedSku: 'SKUUUID',
      barcode: '999',
      name: '雙倉車',
      brand: 'MiniGT',
      listPrice: 100,
      totalStock: 7,
      stocks: uuidStocks,
    } as Product;
    useSessionStore.setState({
      userRole: 'staff',
      storeName: '甲店',
      stores: ['甲店', '乙店'],
      storeRecords: [
        { name: '甲店', stockLocationId: SHELF_A, stockLocationName: '甲倉' },
        { name: '乙店', stockLocationId: SHELF_B, stockLocationName: '乙倉' },
      ],
      oauthUser: { id: 'acct-1', name: '店員', email: 'clerk@example.com', role: 'staff' },
    });
    setBoundCartUserId('acct-1');
    useCartStore.setState({ items: [], attachedCustomer: null, shippingFee: 0, orderNote: '' });
    useCartStore.getState().addItem(product, 1);
    expect(useCartStore.getState().items[0]?.storeStock).toBe(5);

    useSessionStore.setState({ storeName: '乙店' });
    useCartStore.getState().refreshMappedStock([product]);
    expect(useCartStore.getState().items[0]?.storeStock).toBe(2);
    expect(useCartStore.getState().items[0]?.quantity).toBe(1);
  });
});
