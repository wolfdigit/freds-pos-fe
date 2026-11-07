import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { hasPermission } from '@/auth/permissions';
import { authApi } from '@/services/api/httpAuthService';
import { isMockService, systemService } from '@/services';
import { INITIAL_STORES } from '@/services/mock/mockDataSeed';
import type { AuthUser } from '@/types/auth';

export interface OAuthUser {
  id: string;
  name: string;
  email?: string;
  role: string;
}

interface SessionStore {
  storeName: string;
  stores: string[];
  cashierId: string;
  cashierName: string;
  userRole: string;
  oauthUser: OAuthUser;

  setStoreName: (name: string) => void;
  fetchStores: () => Promise<string[]>;
  addStore: (name: string) => Promise<boolean>;
  removeStore: (name: string) => Promise<boolean>;

  setUserRole: (role: string) => void;
  applyAuthenticatedUser: (user: AuthUser, storeName: string | null) => void;
  clearIdentity: () => void;
  isSystemAdmin: () => boolean;
}

const mockIdentity = {
  storeName: INITIAL_STORES[0]?.name ?? '',
  stores: INITIAL_STORES.map((store) => store.name),
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
  cashierId: '',
  cashierName: '',
  userRole: '',
  oauthUser: { id: '', name: '', email: '', role: '' } satisfies OAuthUser,
};

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      ...(isMockService ? mockIdentity : blankIdentity),

      setStoreName: (name) => set({ storeName: name }),

      fetchStores: async () => {
        try {
          const storeDtos = isMockService ? await systemService.getStores() : await authApi.listStores();
          const names = (storeDtos || []).map((store) => store.name);
          if (!isMockService) {
            set({ stores: names });
            return names;
          }
          if (names.length > 0) {
            set((state) => {
              const currentStore = state.storeName;
              const newStore = names.includes(currentStore) ? currentStore : names[0];
              return { stores: names, storeName: newStore };
            });
            return names;
          }
          return get().stores;
        } catch (err) {
          console.error('Failed to fetch stores from systemService:', err);
          return get().stores;
        }
      },

      addStore: async (name) => {
        if (!hasPermission(get().userRole, 'store.manage')) return false;
        const clean = name.trim();
        if (!clean) return false;
        try {
          await systemService.createStore({ name: clean });
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
          cashierName: user.name,
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
      version: 3,
      partialize: (state) => ({
        storeName: state.storeName,
        stores: state.stores,
      }),
      migrate: (persistedState) => {
        const raw = (persistedState ?? {}) as { storeName?: unknown; stores?: unknown };
        const storeName = typeof raw.storeName === 'string' ? raw.storeName : '';
        const stores = Array.isArray(raw.stores)
          ? raw.stores.filter((store): store is string => typeof store === 'string')
          : [];
        if (!isMockService) {
          return { storeName: '', stores: [] } as unknown as SessionStore;
        }
        return { storeName, stores } as unknown as SessionStore;
      },
    }
  )
);
