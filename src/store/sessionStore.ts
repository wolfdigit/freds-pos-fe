import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OAuthAccount {
  email: string;
  name?: string;
  note?: string;
}

export interface OAuthUser {
  id: string;
  name: string;
  email?: string;
  role: 'admin' | 'staff' | string;
  roles?: string[];
  avatarUrl?: string;
}

interface SessionStore {
  storeName: string;
  stores: string[];
  cashierId: string;
  cashierName: string;
  userRole: 'admin' | 'staff' | string;
  oauthUser: OAuthUser;

  adminAccounts: OAuthAccount[];
  staffAccounts: OAuthAccount[];

  // 門市管理
  setStoreName: (name: string) => void;
  addStore: (name: string) => boolean;
  removeStore: (name: string) => boolean;

  // 登入角色
  setUserRole: (role: 'admin' | 'staff' | string) => void;
  setOAuthUser: (user: Partial<OAuthUser>) => void;
  isSystemAdmin: () => boolean;

  // OAuth 管理員與店員帳號 (包含名稱與附註)
  addAdminAccount: (email: string, name?: string, note?: string) => boolean;
  updateAdminAccount: (email: string, data: { name?: string; note?: string }) => void;
  removeAdminAccount: (email: string) => boolean;

  addStaffAccount: (email: string, name?: string, note?: string) => boolean;
  updateStaffAccount: (email: string, data: { name?: string; note?: string }) => void;
  removeStaffAccount: (email: string) => boolean;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      storeName: '台北旗艦店',
      stores: ['台北旗艦店', '台中一中店', '高雄巨蛋店'],
      cashierId: 'staff-001',
      cashierName: '店長 Fred',
      userRole: 'admin',
      oauthUser: {
        id: 'staff-001',
        name: '店長 Fred',
        email: 'fred@gmail.com',
        role: 'admin',
        roles: ['admin', 'manager', 'cashier'],
      },

      adminAccounts: [
        { email: 'fred@gmail.com', name: '店長 Fred', note: '系統最高管理員 / 總部' },
        { email: 'admin@gmail.com', name: '資訊管理員', note: '資訊維運管理處' },
      ],
      staffAccounts: [
        { email: 'clerk01@gmail.com', name: '王小美', note: '台北店早班店員' },
        { email: 'clerk02@gmail.com', name: '李大同', note: '台北店晚班店員' },
        { email: 'staff@gmail.com', name: '門市支援', note: '支援收銀專員' },
      ],

      setStoreName: (name) => set({ storeName: name }),

      addStore: (name) => {
        const clean = name.trim();
        if (!clean) return false;
        const current = get().stores;
        if (current.includes(clean)) return false;
        set({ stores: [...current, clean] });
        return true;
      },

      removeStore: (name) => {
        const current = get().stores;
        if (current.length <= 1) return false; // 至少保留一間門市
        const next = current.filter((s) => s !== name);
        const newActive = get().storeName === name ? next[0] : get().storeName;
        set({ stores: next, storeName: newActive });
        return true;
      },

      setUserRole: (role) =>
        set((state) => ({
          userRole: role,
          oauthUser: { ...state.oauthUser, role },
        })),

      setOAuthUser: (user) =>
        set((state) => {
          const email = (user.email || state.oauthUser.email || '').toLowerCase().trim();
          let calculatedRole = user.role || state.userRole;
          let calculatedName = user.name || state.cashierName;

          // 依據 Gmail 白名單自動計算角色與名稱
          if (email) {
            const adminMatch = state.adminAccounts.find((a) => a.email.toLowerCase() === email);
            const staffMatch = state.staffAccounts.find((a) => a.email.toLowerCase() === email);

            if (adminMatch) {
              calculatedRole = 'admin';
              if (adminMatch.name) calculatedName = adminMatch.name;
            } else if (staffMatch) {
              calculatedRole = 'staff';
              if (staffMatch.name) calculatedName = staffMatch.name;
            }
          }

          return {
            oauthUser: { ...state.oauthUser, ...user, name: calculatedName, role: calculatedRole },
            cashierName: calculatedName,
            cashierId: user.id || state.cashierId,
            userRole: calculatedRole,
          };
        }),

      isSystemAdmin: () => {
        const { userRole, oauthUser, adminAccounts } = get();
        const userEmail = (oauthUser.email || '').toLowerCase().trim();
        if (userEmail && adminAccounts.some((a) => a.email.toLowerCase() === userEmail)) {
          return true;
        }
        return (
          userRole === 'admin' ||
          userRole === 'manager' ||
          oauthUser.role === 'admin' ||
          (oauthUser.roles?.includes('admin') ?? false)
        );
      },

      addAdminAccount: (email, name = '', note = '') => {
        const clean = email.trim().toLowerCase();
        if (!clean) return false;
        const { adminAccounts, staffAccounts } = get();
        if (adminAccounts.some((a) => a.email.toLowerCase() === clean)) return false;

        // 若原在 staffAccounts 則移轉
        const newStaff = staffAccounts.filter((a) => a.email.toLowerCase() !== clean);
        set({
          adminAccounts: [
            ...adminAccounts,
            { email: clean, name: name.trim(), note: note.trim() },
          ],
          staffAccounts: newStaff,
        });
        return true;
      },

      updateAdminAccount: (email, data) => {
        const clean = email.trim().toLowerCase();
        const { adminAccounts } = get();
        set({
          adminAccounts: adminAccounts.map((a) =>
            a.email.toLowerCase() === clean
              ? {
                  ...a,
                  name: data.name !== undefined ? data.name.trim() : a.name,
                  note: data.note !== undefined ? data.note.trim() : a.note,
                }
              : a
          ),
        });
      },

      removeAdminAccount: (email) => {
        const clean = email.trim().toLowerCase();
        const { adminAccounts } = get();
        if (adminAccounts.length <= 1) return false; // 至少保留一位管理員
        set({
          adminAccounts: adminAccounts.filter((a) => a.email.toLowerCase() !== clean),
        });
        return true;
      },

      addStaffAccount: (email, name = '', note = '') => {
        const clean = email.trim().toLowerCase();
        if (!clean) return false;
        const { adminAccounts, staffAccounts } = get();
        if (staffAccounts.some((a) => a.email.toLowerCase() === clean)) return false;

        // 若原在 adminAccounts 則移轉
        const newAdmin = adminAccounts.filter((a) => a.email.toLowerCase() !== clean);
        set({
          staffAccounts: [
            ...staffAccounts,
            { email: clean, name: name.trim(), note: note.trim() },
          ],
          adminAccounts: newAdmin,
        });
        return true;
      },

      updateStaffAccount: (email, data) => {
        const clean = email.trim().toLowerCase();
        const { staffAccounts } = get();
        set({
          staffAccounts: staffAccounts.map((a) =>
            a.email.toLowerCase() === clean
              ? {
                  ...a,
                  name: data.name !== undefined ? data.name.trim() : a.name,
                  note: data.note !== undefined ? data.note.trim() : a.note,
                }
              : a
          ),
        });
      },

      removeStaffAccount: (email) => {
        const clean = email.trim().toLowerCase();
        const { staffAccounts } = get();
        set({
          staffAccounts: staffAccounts.filter((a) => a.email.toLowerCase() !== clean),
        });
        return true;
      },
    }),
    {
      name: 'FREDS_POS_SESSION',
    }
  )
);
