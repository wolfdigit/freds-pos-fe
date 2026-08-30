import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionStore {
  storeName: string;
  cashierId: string;
  cashierName: string;
  setStoreName: (name: string) => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      storeName: '台北旗艦店',
      cashierId: 'staff-001',
      cashierName: '店長 Fred',
      setStoreName: (name) => set({ storeName: name }),
    }),
    { name: 'FREDS_POS_SESSION' }
  )
);

