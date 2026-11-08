import { describe, expect, it } from 'vitest';
import { LEGACY_SHARED_STOCK_LOCATION_ID, quantityAtMappedLocation } from './stockLocation';

const stocks = [
  { location: 'store', locationName: '門市現貨', quantity: 4 },
  { location: 'warehouse', locationName: '後方倉庫', quantity: 9 },
  { location: 'loc-other', locationName: '高雄倉', quantity: 2 },
];

describe('quantityAtMappedLocation', () => {
  it('reads the mapped location and treats the legacy shelf as the mock store row', () => {
    expect(quantityAtMappedLocation(stocks, 'loc-other')).toBe(2);
    expect(quantityAtMappedLocation(stocks, LEGACY_SHARED_STOCK_LOCATION_ID)).toBe(4);
    expect(quantityAtMappedLocation(stocks, 'missing')).toBe(0);
    expect(quantityAtMappedLocation(stocks, null)).toBe(4);
  });
});
