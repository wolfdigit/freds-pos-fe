import { create } from 'zustand';
import type { CartItem } from './cartStore';
import { getHashFromState } from '@/utils/hashRouter';
import { confirmDiscardUnsavedChanges } from '@/utils/unsavedChanges';

export type ActiveTab = 'checkout' | 'inventory' | 'customers' | 'settings' | 'reports';

interface UiStore {
  activeTab: ActiveTab | null;
  isSidebarCollapsed: boolean;
  isManualPriceModalOpen: boolean;
  isPaymentModalOpen: boolean;
  isStockTransferModalOpen: boolean;
  isProductCreateModalOpen: boolean;
  productCreateKeyword: string;
  selectedCustomerId: string | null;
  currentEditingCartItem: CartItem | null;

  toggleSidebar: () => void;
  setActiveTab: (tab: ActiveTab | null) => void;
  navigateToCustomer: (customerId: string) => void;
  setSelectedCustomerId: (id: string | null) => void;
  syncStateFromHash: (tab: ActiveTab | null, customerId: string | null) => void;
  openManualPriceModal: (item: CartItem) => void;
  closeManualPriceModal: () => void;
  openPaymentModal: () => void;
  closePaymentModal: () => void;
  openStockTransferModal: () => void;
  closeStockTransferModal: () => void;
  openProductCreateModal: (keyword?: string) => void;
  closeProductCreateModal: () => void;
  closeAllOverlays: () => void;
}

function syncHashWithState(activeTab: ActiveTab | null, selectedCustomerId: string | null) {
  if (typeof window === 'undefined') return;
  const targetHash = getHashFromState(activeTab, selectedCustomerId);
  if (window.location.hash !== targetHash) {
    window.location.hash = targetHash;
  }
}

export const useUiStore = create<UiStore>((set) => ({
  activeTab: null,
  isSidebarCollapsed: false,
  isManualPriceModalOpen: false,
  isPaymentModalOpen: false,
  isStockTransferModalOpen: false,
  isProductCreateModalOpen: false,
  productCreateKeyword: '',
  selectedCustomerId: null,
  currentEditingCartItem: null,

  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setActiveTab: (tab) =>
    set((state) => {
      // 有未存檔變更時先確認；取消就留在原頁。
      if (tab !== state.activeTab && !confirmDiscardUnsavedChanges()) {
        return state;
      }
      const customerId = tab === 'customers' ? state.selectedCustomerId : null;
      syncHashWithState(tab, customerId);
      return {
        activeTab: tab,
        isSidebarCollapsed: tab !== null,
      };
    }),
  navigateToCustomer: (customerId) =>
    set((state) => {
      if (state.activeTab !== 'customers' && !confirmDiscardUnsavedChanges()) {
        return state;
      }
      syncHashWithState('customers', customerId);
      return {
        activeTab: 'customers',
        selectedCustomerId: customerId,
        isSidebarCollapsed: true,
      };
    }),
  setSelectedCustomerId: (id) =>
    set((state) => {
      if (state.activeTab === 'customers') {
        syncHashWithState('customers', id);
      }
      return { selectedCustomerId: id };
    }),
  syncStateFromHash: (tab, customerId) =>
    set((state) => {
      if (state.activeTab === tab && state.selectedCustomerId === customerId) {
        return state;
      }
      // 瀏覽器返回 / 手動改網址：有未存檔變更且使用者取消時，把網址改回目前頁面。
      if (tab !== state.activeTab && !confirmDiscardUnsavedChanges()) {
        syncHashWithState(state.activeTab, state.selectedCustomerId);
        return state;
      }
      return {
        activeTab: tab,
        selectedCustomerId: customerId,
        isSidebarCollapsed: tab !== null,
      };
    }),
  openManualPriceModal: (item) => set({ isManualPriceModalOpen: true, currentEditingCartItem: item }),
  closeManualPriceModal: () => set({ isManualPriceModalOpen: false, currentEditingCartItem: null }),
  openPaymentModal: () => set({ isPaymentModalOpen: true }),
  closePaymentModal: () => set({ isPaymentModalOpen: false }),
  openStockTransferModal: () => set({ isStockTransferModalOpen: true }),
  closeStockTransferModal: () => set({ isStockTransferModalOpen: false }),
  openProductCreateModal: (keyword?: string) =>
    set({ isProductCreateModalOpen: true, productCreateKeyword: keyword?.trim() ?? '' }),
  closeProductCreateModal: () => set({ isProductCreateModalOpen: false, productCreateKeyword: '' }),
  closeAllOverlays: () =>
    set({
      isManualPriceModalOpen: false,
      isPaymentModalOpen: false,
      isStockTransferModalOpen: false,
      isProductCreateModalOpen: false,
      productCreateKeyword: '',
      currentEditingCartItem: null,
    }),
}));
