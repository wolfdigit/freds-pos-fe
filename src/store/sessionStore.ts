import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { errorMessage } from '@/auth/businessError';
import { displayAccountName } from '@/auth/displayName';
import { hasPermission } from '@/auth/permissions';
import { authApi } from '@/services/api/httpAuthService';
import { isMockService, systemService } from '@/services';
import { INITIAL_STORES } from '@/services/mock/mockDataSeed';
import type { AuthUser } from '@/types/auth';
import type { CreateStoreRequest } from '@/types/system';

export interface OAuthUser {
  id: string;
  name: string;
  email?: string;
  role: string;
}

export type StoreListStatus = 'idle' | 'loading' | 'ready' | 'error';

interface SessionStore {
  storeName: string;
  stores: string[];
  storeListStatus: StoreListStatus;
  storeListError: string | null;
  cashierId: string;
  cashierName: string;
  userRole: string;
  oauthUser: OAuthUser;

  setStoreName: (name: string) => void;
  fetchStores: () => Promise<string[]>;
  addStore: (request: CreateStoreRequest) => Promise<boolean>;
  removeStore: (name: string) => Promise<boolean>;

  setUserRole: (role: string) => void;
  applyAuthenticatedUser: (user: AuthUser, storeName: string | null) => void;
  clearIdentity: () => void;
  isSystemAdmin: () => boolean;
}

const mockIdentity = {
  storeName: INITIAL_STORES[0]?.name ?? '',
  stores: INITIAL_STORES.map((store) => store.name),
  storeListStatus: 'ready' as const,
  storeListError: null,
  cashierId: 'staff-001',
  cashierName: '店長 Fred',
  userRole: 'admin',
  oauthUser: {
    id: 'staff-001',
    name: '店長 Fred',
    email: 'fred@gmail.com',
    role: 'admin',
  } satisfies OAuthUser,
};

const blankIdentity = {
  storeName: '',
  stores: [] as string[],
  storeListStatus: 'idle' as const,
  storeListError: null,
  cashierId: '',
  cashierName: '',
  userRole: '',
  oauthUser: { id: '', name: '', email: '', role: '' } satisfies OAuthUser,
};

let storeListRequest: Promise<string[]> | null = null;

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      ...(isMockService ? mockIdentity : blankIdentity),

      setStoreName: (name) => set({ storeName: name }),

      fetchStores: () => {
        if (storeListRequest) return storeListRequest;
        let resolveRequest: (names: string[]) => void = () => undefined;
        const request = new Promise<string[]>((resolve) => {
          resolveRequest = resolve;
        });
        storeListRequest = request;
        void (async () => {
          if (get().stores.length === 0) {
            set({ storeListStatus: 'loading', storeListError: null });
          }
          try {
            const storeDtos = isMockService ? await systemService.getStores() : await authApi.listStores();
            const names = (storeDtos || []).map((store) => store.name).filter((name) => name.trim());
            if (!isMockService) {
              set({ stores: names, storeListStatus: 'ready', storeListError: null });
              resolveRequest(names);
              return;
            }
            if (names.length > 0) {
              set((state) => {
                const currentStore = state.storeName.trim();
                const newStore = !currentStore
                  ? ''
                  : names.includes(currentStore)
                    ? currentStore
                    : names[0];
                return { stores: names, storeName: newStore, storeListStatus: 'ready', storeListError: null };
              });
              resolveRequest(names);
              return;
            }
            set({ storeListStatus: 'ready', storeListError: null });
            resolveRequest(get().stores);
          } catch (err) {
            console.error('Failed to fetch login stores:', err);
            set({
              storeListStatus: 'error',
              storeListError: errorMessage(err, '無法讀取門市清單'),
            });
            resolveRequest(get().stores);
          } finally {
            if (storeListRequest === request) storeListRequest = null;
          }
        })();
        return request;
      },

      addStore: async (request) => {
        if (!hasPermission(get().userRole, 'store.manage')) return false;
        const clean = request.name.trim();
        if (!clean || !request.inventoryLocationId || !request.returnedInventoryLocationId) return false;
        try {
          await systemService.createStore({ ...request, name: clean });
          const current = get().stores;
          if (!current.includes(clean)) {
            set({ stores: [...current, clean] });
          }
          return true;
        } catch (err) {
          console.error('Failed to add store via systemService:', err);
          return false;
        }
      },

      removeStore: async (name) => {
        if (!hasPermission(get().userRole, 'store.manage')) return false;
        try {
          await systemService.deleteStore(name);
          if (isMockService) {
            const current = get().stores;
            const next = current.filter((store) => store !== name);
            const newActive = get().storeName === name ? (next[0] ?? '') : get().storeName;
            set({ stores: next, storeName: newActive });
          } else {
            set((state) => ({ stores: state.stores.filter((store) => store !== name) }));
          }
          return true;
        } catch (err) {
          console.error('Failed to remove store via systemService:', err);
          return false;
        }
      },

      setUserRole: (role) => {
        if (!isMockService) return;
        set((state) => ({
          userRole: role,
          oauthUser: { ...state.oauthUser, role },
        }));
      },

      applyAuthenticatedUser: (user, storeName) =>
        set({
          cashierId: user.id,
          cashierName: displayAccountName(user.name, user.email),
          userRole: user.role,
          oauthUser: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          storeName: storeName ?? '',
        }),

      clearIdentity: () => set({ ...blankIdentity }),

      isSystemAdmin: () => hasPermission(get().userRole, 'whitelist.manage'),
    }),
    {
      name: 'FREDS_POS_SESSION',
      version: 4,
      partialize: (state) =>
        isMockService
          ? { storeName: state.storeName, stores: state.stores }
          : { storeName: state.storeName },
      migrate: (persistedState) => {
        const raw = (persistedState ?? {}) as { storeName?: unknown; stores?: unknown };
        const storeName = typeof raw.storeName === 'string' ? raw.storeName : '';
        const stores = Array.isArray(raw.stores)
          ? raw.stores.filter((store): store is string => typeof store === 'string')
          : [];
        if (!isMockService) {
          return { storeName: '' } as unknown as SessionStore;
        }
        return { storeName, stores } as unknown as SessionStore;
      },
    }
  )
);
