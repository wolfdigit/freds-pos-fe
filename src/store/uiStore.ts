import { create } from 'zustand';
import type { CartItem } from './cartStore';
import { getHashFromState } from '@/utils/hashRouter';

export type ActiveTab = 'checkout' | 'inventory' | 'customers';

interface UiStore {
  activeTab: ActiveTab | null;
  isSidebarCollapsed: boolean;
  isPreOrderDrawerOpen: boolean;
  isManualPriceModalOpen: boolean;
  isPaymentModalOpen: boolean;
  isStockTransferModalOpen: boolean;
  isProductCreateModalOpen: boolean;
  selectedCustomerId: string | null;
  currentEditingCartItem: CartItem | null;

  toggleSidebar: () => void;
  setActiveTab: (tab: ActiveTab | null) => void;
  navigateToCustomer: (customerId: string) => void;
  setSelectedCustomerId: (id: string | null) => void;
  syncStateFromHash: (tab: ActiveTab | null, customerId: string | null) => void;
  openPreOrderDrawer: () => void;
  closePreOrderDrawer: () => void;
  openManualPriceModal: (item: CartItem) => void;
  closeManualPriceModal: () => void;
  openPaymentModal: () => void;
  closePaymentModal: () => void;
  openStockTransferModal: () => void;
  closeStockTransferModal: () => void;
  openProductCreateModal: () => void;
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
  isPreOrderDrawerOpen: false,
  isManualPriceModalOpen: false,
  isPaymentModalOpen: false,
  isStockTransferModalOpen: false,
  isProductCreateModalOpen: false,
  selectedCustomerId: null,
  currentEditingCartItem: null,

  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setActiveTab: (tab) =>
    set((state) => {
      const customerId = tab === 'customers' ? state.selectedCustomerId : null;
      syncHashWithState(tab, customerId);
      return {
        activeTab: tab,
        isSidebarCollapsed: tab !== null,
      };
    }),
  navigateToCustomer: (customerId) =>
    set(() => {
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
      return {
        activeTab: tab,
        selectedCustomerId: customerId,
        isSidebarCollapsed: tab !== null,
      };
    }),
  openPreOrderDrawer: () => set({ isPreOrderDrawerOpen: true }),
  closePreOrderDrawer: () => set({ isPreOrderDrawerOpen: false }),
  openManualPriceModal: (item) => set({ isManualPriceModalOpen: true, currentEditingCartItem: item }),
  closeManualPriceModal: () => set({ isManualPriceModalOpen: false, currentEditingCartItem: null }),
  openPaymentModal: () => set({ isPaymentModalOpen: true }),
  closePaymentModal: () => set({ isPaymentModalOpen: false }),
  openStockTransferModal: () => set({ isStockTransferModalOpen: true }),
  closeStockTransferModal: () => set({ isStockTransferModalOpen: false }),
  openProductCreateModal: () => set({ isProductCreateModalOpen: true }),
  closeProductCreateModal: () => set({ isProductCreateModalOpen: false }),
  closeAllOverlays: () =>
    set({
      isPreOrderDrawerOpen: false,
      isManualPriceModalOpen: false,
      isPaymentModalOpen: false,
      isStockTransferModalOpen: false,
      isProductCreateModalOpen: false,
      currentEditingCartItem: null,
    }),
}));
