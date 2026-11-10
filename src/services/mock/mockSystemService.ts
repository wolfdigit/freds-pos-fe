import type { ISystemService } from '@/services/interfaces/ISystemService';
import type {
  StoreDto,
  CreateStoreRequest,
  UpdateStoreBindingRequest,
  DeleteStoreResponse,
  OAuthAccountDto,
  CreateOAuthAccountRequest,
  UpdateOAuthAccountRequest,
} from '@/types/system';
import {
  accountGuardMessage,
  deletionBlock,
  demotionBlock,
  normalizeRole,
} from '@/auth/permissions';
import { simulateDelay, getStoredStores, setStoredStores } from './storageHelper';
import { defaultLocationRows, LOCATIONS_STORAGE_KEY } from './inventoryCatalog';
import type { InventoryLocationDto } from '@/types/inventory';
import { BusinessError } from '@/utils/errors';

const MOCK_ACCOUNTS_KEY = 'FREDS_POS_MOCK_OAUTH_ACCOUNTS';

export class MockSystemService implements ISystemService {
  async getStores(): Promise<StoreDto[]> {
    await simulateDelay(30, 80);
    return getStoredStores();
  }

  async createStore(request: CreateStoreRequest): Promise<StoreDto> {
    await simulateDelay(40, 100);
    const actor = await readMockActor();
    if (actor.role !== 'admin') {
      throw new BusinessError('AUTH_FORBIDDEN', '需要管理員權限');
    }
    const cleanName = request.name?.trim();
    if (!cleanName) {
      throw new BusinessError('INVALID_STORE_NAME', '門市名稱不可為空');
    }

    const current = getStoredStores();
    if (current.some((s) => s.name === cleanName)) {
      throw new BusinessError('DUPLICATE_STORE_NAME', `門市「${cleanName}」已存在`);
    }

    const normal = requireLocation(request.inventoryLocationId);
    const returned = requireLocation(request.returnedInventoryLocationId);
    const newStore: StoreDto = {
      name: cleanName,
      isDefault: current.length === 0,
      inventoryLocationId: normal.id,
      inventoryLocationName: normal.name,
      returnedInventoryLocationId: returned.id,
      returnedInventoryLocationName: returned.name,
    };

    setStoredStores([...current, newStore]);
    return newStore;
  }

  async rebindStore(storeName: string, request: UpdateStoreBindingRequest): Promise<StoreDto> {
    await simulateDelay(40, 100);
    const actor = await readMockActor();
    if (actor.role !== 'admin') {
      throw new BusinessError('AUTH_FORBIDDEN', '需要管理員權限');
    }
    const current = getStoredStores();
    const idx = current.findIndex((store) => store.name === storeName);
    if (idx === -1) throw new BusinessError('STORE_NOT_FOUND', `找不到門市「${storeName}」`);
    const normal = requireLocation(request.inventoryLocationId);
    const returned = requireLocation(request.returnedInventoryLocationId);
    const updated: StoreDto = {
      ...current[idx],
      inventoryLocationId: normal.id,
      inventoryLocationName: normal.name,
      returnedInventoryLocationId: returned.id,
      returnedInventoryLocationName: returned.name,
    };
    const next = [...current];
    next[idx] = updated;
    setStoredStores(next);
    return updated;
  }

  async deleteStore(storeName: string): Promise<DeleteStoreResponse> {
    await simulateDelay(40, 100);
    const current = getStoredStores();
    if (current.length <= 1) {
      throw new BusinessError('CANNOT_DELETE_LAST_STORE', '系統至少需保留一間門市，無法全數刪除');
    }

    const found = current.some((s) => s.name === storeName);
    if (!found) {
      throw new BusinessError('STORE_NOT_FOUND', `找不到門市「${storeName}」`);
    }

    const updated = current.filter((s) => s.name !== storeName);
    setStoredStores(updated);
    return {
      success: true,
      deletedStore: storeName,
    };
  }

  async listAccounts(): Promise<OAuthAccountDto[]> {
    await simulateDelay(20, 40);
    return readMockAccounts();
  }

  async createAccount(request: CreateOAuthAccountRequest): Promise<OAuthAccountDto> {
    await simulateDelay(20, 40);
    const actor = await readMockActor();
    if (actor.role !== 'admin') {
      throw new BusinessError('AUTH_FORBIDDEN', '需要管理員權限');
    }
    const email = request.email.trim().toLowerCase();
    const role = normalizeRole(request.role);
    const name = (request.name || '').trim();
    if (!role) throw new BusinessError('ACCOUNT_ROLE_INVALID', '角色只允許 admin 或 staff');
    if (name.length > 128) {
      throw new BusinessError('ACCOUNT_NAME_REQUIRED', '請設定 128 字以內的顯示名稱');
    }
    const accounts = readMockAccounts();
    if (accounts.some((account) => account.email.toLowerCase() === email)) {
      throw new BusinessError('CUSTOMER_EMAIL_DUPLICATE', '帳號已存在');
    }
    const created: OAuthAccountDto = {
      id: `mock-${crypto.randomUUID()}`,
      email,
      role,
      name,
      note: request.note ?? null,
    };
    writeMockAccounts([...accounts, created]);
    return created;
  }

  async updateAccount(email: string, request: UpdateOAuthAccountRequest): Promise<OAuthAccountDto> {
    await simulateDelay(20, 40);
    const actor = await readMockActor();
    if (actor.role !== 'admin') {
      throw new BusinessError('AUTH_FORBIDDEN', '需要管理員權限');
    }
    const accounts = readMockAccounts();
    const key = email.trim().toLowerCase();
    const current = accounts.find((account) => account.email.toLowerCase() === key);
    if (!current) throw new BusinessError('CUSTOMER_NOT_FOUND', '找不到帳號');
    const adminCount = accounts.filter((account) => account.role === 'admin').length;
    let role = current.role;
    if (request.role !== undefined) {
      const nextRole = normalizeRole(request.role);
      if (!nextRole) throw new BusinessError('ACCOUNT_ROLE_INVALID', '角色只允許 admin 或 staff');
      const blocked = demotionBlock({
        actorEmail: actor.email,
        targetEmail: current.email,
        targetRole: current.role,
        nextRole,
        adminCount,
      });
      if (blocked) throw new BusinessError(blocked === 'self' ? 'ACCOUNT_SELF_PROTECTED' : 'ACCOUNT_LAST_ADMIN', accountGuardMessage(blocked, 'demote'));
      role = nextRole;
    }
    let name = current.name ?? '';
    if (request.name !== undefined && request.name !== null) {
      name = request.name.trim();
      if (name.length > 128) {
        throw new BusinessError('ACCOUNT_NAME_REQUIRED', '請設定 128 字以內的顯示名稱');
      }
    }
    const updated: OAuthAccountDto = {
      ...current,
      role,
      name,
      note: request.note !== undefined ? request.note : current.note,
    };
    writeMockAccounts(accounts.map((account) => (account.email.toLowerCase() === key ? updated : account)));
    return updated;
  }

  async deleteAccount(email: string): Promise<void> {
    await simulateDelay(20, 40);
    const actor = await readMockActor();
    if (actor.role !== 'admin') {
      throw new BusinessError('AUTH_FORBIDDEN', '需要管理員權限');
    }
    const accounts = readMockAccounts();
    const key = email.trim().toLowerCase();
    const current = accounts.find((account) => account.email.toLowerCase() === key);
    if (!current) throw new BusinessError('CUSTOMER_NOT_FOUND', '找不到帳號');
    const adminCount = accounts.filter((account) => account.role === 'admin').length;
    const blocked = deletionBlock({
      actorEmail: actor.email,
      targetEmail: current.email,
      targetRole: current.role,
      adminCount,
    });
    if (blocked) {
      throw new BusinessError(
        blocked === 'self' ? 'ACCOUNT_SELF_PROTECTED' : 'ACCOUNT_LAST_ADMIN',
        accountGuardMessage(blocked, 'delete')
      );
    }
    writeMockAccounts(accounts.filter((account) => account.email.toLowerCase() !== key));
  }
}

function readMockAccounts(): OAuthAccountDto[] {
  const raw = localStorage.getItem(MOCK_ACCOUNTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as OAuthAccountDto[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeMockAccounts(accounts: OAuthAccountDto[]): void {
  localStorage.setItem(MOCK_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function requireLocation(locationId: string): InventoryLocationDto {
  const raw = localStorage.getItem(LOCATIONS_STORAGE_KEY);
  const locations: InventoryLocationDto[] = raw ? (JSON.parse(raw) as InventoryLocationDto[]) : defaultLocationRows();
  const found = (Array.isArray(locations) && locations.length > 0 ? locations : defaultLocationRows()).find(
    (location) => location.id === locationId
  );
  if (!found) throw new BusinessError('LOCATION_NOT_FOUND', '找不到庫存地點');
  return found;
}

async function readMockActor(): Promise<{ email: string; role: string }> {
  const { useSessionStore } = await import('@/store/sessionStore');
  const state = useSessionStore.getState();
  return { email: state.oauthUser.email || '', role: state.userRole };
}
