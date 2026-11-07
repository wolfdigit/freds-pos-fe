export type PosRole = 'admin' | 'staff';

/**
 * Central permission names. Split a case here when admin and staff should diverge.
 * `store.select` is choosing or switching the login store.
 * `store.manage` is creating and deleting stores in settings.
 */
export type Permission =
  | 'business.access'
  | 'store.select'
  | 'store.manage'
  | 'store.createInitial'
  | 'whitelist.manage';

export function normalizeRole(role: string | null | undefined): PosRole | null {
  const value = (role ?? '').trim().toLowerCase();
  if (value === 'admin' || value === 'staff') return value;
  return null;
}

export function hasPermission(role: string | null | undefined, permission: Permission): boolean {
  const normalized = normalizeRole(role);
  if (!normalized) return false;
  if (permission === 'business.access' || permission === 'store.select') return true;
  return normalized === 'admin';
}

export type AccountGuard = 'self' | 'last-admin';

function sameEmail(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

/** Mirrors backend delete guards: last admin is rejected before self-protection. */
export function deletionBlock(args: {
  actorEmail: string;
  targetEmail: string;
  targetRole: string;
  adminCount: number;
}): AccountGuard | null {
  const targetIsAdmin = normalizeRole(args.targetRole) === 'admin';
  if (targetIsAdmin && args.adminCount <= 1) return 'last-admin';
  if (sameEmail(args.actorEmail, args.targetEmail)) return 'self';
  return null;
}

/** Mirrors backend demotion guards. Name and note edits are not a demotion. */
export function demotionBlock(args: {
  actorEmail: string;
  targetEmail: string;
  targetRole: string;
  nextRole: string;
  adminCount: number;
}): AccountGuard | null {
  const leavingAdmin = normalizeRole(args.targetRole) === 'admin' && normalizeRole(args.nextRole) !== 'admin';
  if (!leavingAdmin) return null;
  if (args.adminCount <= 1) return 'last-admin';
  if (sameEmail(args.actorEmail, args.targetEmail)) return 'self';
  return null;
}

export function accountGuardMessage(guard: AccountGuard, action: 'delete' | 'demote'): string {
  if (guard === 'last-admin') return '至少要保留一位管理員';
  return action === 'delete' ? '不能刪除自己的帳號' : '不能變更自己的角色';
}
