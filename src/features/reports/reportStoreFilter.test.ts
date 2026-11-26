import { describe, expect, it } from 'vitest';
import type { StoreDto } from '@/types/system';
import {
  defaultReportStoreFilter,
  reportStoreButtons,
  reportStoreKey,
  reportStoreName,
} from './reportStoreFilter';

const store = (name: string) => ({ name }) as StoreDto;

describe('report store filter', () => {
  it('orders the login store first, other stores by name, and 所有門市總計 last', () => {
    const buttons = reportStoreButtons([store('台南快閃店'), store('奇可門市'), store('台北旗艦店'), store('奇可門市')], '奇可門市');
    expect(buttons.map((button) => button.label)).toEqual(['奇可門市', '台北旗艦店', '台南快閃店', '所有門市總計']);
    expect(buttons.at(-1)?.filter).toEqual({ kind: 'all' });
  });

  it('keeps the login store and 所有門市總計 even before the store list loads, and has no login button without one', () => {
    expect(reportStoreButtons([], ' 奇可門市 ').map((button) => button.label)).toEqual(['奇可門市', '所有門市總計']);
    expect(reportStoreButtons([store('奇可門市')], '').map((button) => button.label)).toEqual(['奇可門市', '所有門市總計']);
  });

  it('defaults to the login store, or all stores without one, and only sends storeName for a store', () => {
    expect(defaultReportStoreFilter(' 奇可門市 ')).toEqual({ kind: 'store', storeName: '奇可門市' });
    expect(defaultReportStoreFilter('')).toEqual({ kind: 'all' });
    expect(reportStoreName({ kind: 'store', storeName: '奇可門市' })).toBe('奇可門市');
    expect(reportStoreName({ kind: 'all' })).toBeUndefined();
    expect(reportStoreKey({ kind: 'all' })).toBe('all');
    expect(reportStoreKey({ kind: 'store', storeName: '奇可門市' })).toBe('store:奇可門市');
  });
});
