import { describe, expect, it } from 'vitest';
import { orderStoreName } from './orderStore';

describe('orderStoreName', () => {
  const stores = new Set(['奇可門市', '台南快閃店']);

  it('shows branchId only when it is a current store name', () => {
    expect(orderStoreName({ branchId: '奇可門市' }, stores)).toBe('奇可門市');
    expect(orderStoreName({ branchId: 'branch-store' }, stores)).toBe('');
    expect(orderStoreName({ branchId: 'branch-online' }, stores)).toBe('');
    expect(orderStoreName({ branchId: '已刪除門市' }, stores)).toBe('');
    expect(orderStoreName({}, stores)).toBe('');
    expect(orderStoreName({ branchId: '奇可門市' }, new Set())).toBe('');
  });
});
