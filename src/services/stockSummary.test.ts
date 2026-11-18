import { describe, expect, it } from 'vitest';
import { summarizeLocationStock } from './stockSummary';

describe('summarizeLocationStock', () => {
  it('matches the backend rules: signed totals of listed products, delisted stock only blocks delete', () => {
    const locations = [
      { id: 'shelf', name: '門市' },
      { id: 'company', name: '總倉' },
      { id: 'empty', name: '暫存' },
    ];
    const products = [
      { inventories: [{ location: 'shelf', locationName: '門市', quantity: 5 }] },
      { inventories: [{ location: 'shelf', locationName: '門市', quantity: -2 }] },
      { inventories: [{ location: 'shelf', locationName: '門市', quantity: 0 }] },
      { status: 'deleted', inventories: [{ location: 'company', locationName: '總倉', quantity: 7 }] },
      { inventories: [{ location: 'gone', locationName: '已刪', quantity: 9 }] },
    ];
    expect(summarizeLocationStock(locations, products)).toEqual([
      { locationId: 'shelf', locationName: '門市', totalQuantity: 3, productCount: 2, hasNonZeroStock: true },
      { locationId: 'company', locationName: '總倉', totalQuantity: 0, productCount: 0, hasNonZeroStock: true },
      { locationId: 'empty', locationName: '暫存', totalQuantity: 0, productCount: 0, hasNonZeroStock: false },
    ]);
  });
});
