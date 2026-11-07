import { describe, expect, it } from 'vitest';
import {
  accountGuardMessage,
  deletionBlock,
  demotionBlock,
  hasPermission,
} from './permissions';

describe('permissions', () => {
  it('lets admin and staff use business features, and only admin manage the whitelist', () => {
    expect(hasPermission('admin', 'business.access')).toBe(true);
    expect(hasPermission('staff', 'business.access')).toBe(true);
    expect(hasPermission('staff', 'whitelist.manage')).toBe(false);
    expect(hasPermission('admin', 'whitelist.manage')).toBe(true);
    expect(hasPermission('manager', 'business.access')).toBe(false);
    expect(hasPermission('staff', 'store.select')).toBe(true);
    expect(hasPermission('admin', 'store.select')).toBe(true);
    expect(hasPermission('staff', 'store.manage')).toBe(false);
    expect(hasPermission('admin', 'store.manage')).toBe(true);
    expect(hasPermission('staff', 'store.createInitial')).toBe(false);
    expect(hasPermission('admin', 'store.createInitial')).toBe(true);
  });

  it('blocks self deletion and last-admin removal in the same order as the backend', () => {
    expect(
      deletionBlock({ actorEmail: 'A@Example.com', targetEmail: 'a@example.com', targetRole: 'admin', adminCount: 2 })
    ).toBe('self');
    expect(
      deletionBlock({ actorEmail: 'a@example.com', targetEmail: 'a@example.com', targetRole: 'admin', adminCount: 1 })
    ).toBe('last-admin');
    expect(
      deletionBlock({ actorEmail: 'a@example.com', targetEmail: 'b@example.com', targetRole: 'admin', adminCount: 1 })
    ).toBe('last-admin');
    expect(
      deletionBlock({ actorEmail: 'a@example.com', targetEmail: 'b@example.com', targetRole: 'staff', adminCount: 1 })
    ).toBe(null);
    expect(accountGuardMessage('self', 'delete')).toBe('不能刪除自己的帳號');
    expect(accountGuardMessage('last-admin', 'demote')).toBe('至少要保留一位管理員');
  });

  it('blocks demoting yourself or the last admin, and still allows name edits', () => {
    expect(
      demotionBlock({
        actorEmail: 'a@example.com',
        targetEmail: 'a@example.com',
        targetRole: 'admin',
        nextRole: 'staff',
        adminCount: 2,
      })
    ).toBe('self');
    expect(
      demotionBlock({
        actorEmail: 'a@example.com',
        targetEmail: 'b@example.com',
        targetRole: 'admin',
        nextRole: 'staff',
        adminCount: 1,
      })
    ).toBe('last-admin');
    expect(
      demotionBlock({
        actorEmail: 'a@example.com',
        targetEmail: 'a@example.com',
        targetRole: 'admin',
        nextRole: 'admin',
        adminCount: 1,
      })
    ).toBe(null);
  });
});
