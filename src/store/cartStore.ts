import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, ModelScale } from '@/types/product';
import type { Customer } from '@/types/customer';
import type { PreOrder, PreOrderItem } from '@/types/preorder';
import { safeAdd } from '@/utils/currency';

export interface CartItem {
  productId: string;
  sku: string;
  name: string;
  scale: ModelScale;
  brand: string;
  originalPrice: number;
  vipPrice?: number;
  unitPrice: number;
  isManualPrice: boolean;
  priceChangeReason?: string;
  quantity: number;
  storeStock?: number;
  totalStock?: number;
  preOrderPendingCount?: number;
  preOrderId?: string;
  preOrderItemId?: string;
}

function resolveUnitPrice(product: Product, customer: Customer | null): number {
  if (customer && product.vipPrice) return product.vipPrice;
  return product.listPrice;
}

interface CartStore {
  items: CartItem[];
  attachedCustomer: Customer | null;
  shippingFee: number;
  orderNote: string;

  addItem: (product: Product, qty?: number) => void;
  importPreOrderItem: (preOrder: PreOrder, item: PreOrderItem, qty: number) => void;
  updateItemQuantity: (productId: string, newQty: number) => void;
  updateItemPrice: (productId: string, newPrice: number, reason?: string) => void;
  removeItem: (productId: string) => void;
  attachCustomer: (customer: Customer | null) => void;
  setShippingFee: (fee: number) => void;
  setOrderNote: (note: string) => void;
  clearCart: () => void;

  getSubtotal: () => number;
  getTotalAmount: () => number;
  getTotalItemsCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      attachedCustomer: null,
      shippingFee: 0,
      orderNote: '',

      addItem: (product, qty = 1) => {
        const { items, attachedCustomer } = get();
        const existing = items.find((i) => i.productId === product.id && !i.preOrderId);
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === product.id && !i.preOrderId ? { ...i, quantity: i.quantity + qty } : i
            ),
          });
          return;
        }

        const unitPrice = resolveUnitPrice(product, attachedCustomer);
        const storeStock = product.stocks.find((s) => s.location === 'store')?.quantity ?? 0;
        const newItem: CartItem = {
          productId: product.id,
          sku: product.sku,
          name: product.name,
          scale: product.scale,
          brand: product.brand,
          originalPrice: product.listPrice,
          vipPrice: product.vipPrice,
          unitPrice,
          isManualPrice: false,
          quantity: qty,
          storeStock,
          totalStock: product.totalStock,
          preOrderPendingCount: product.preOrderPendingCount ?? 0,
        };
        set({ items: [...items, newItem] });
      },

      importPreOrderItem: (preOrder, item, qty) => {
        const { items } = get();
        const existingIndex = items.findIndex(
          (i) => i.preOrderId === preOrder.id && i.preOrderItemId === item.id
        );
        if (existingIndex !== -1) {
          // If already in cart, do not create duplicate item line
          const updatedItems = [...items];
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: Math.max(updatedItems[existingIndex].quantity, qty),
          };
          set({ items: updatedItems });
          return;
        }

        const newItem: CartItem = {
          productId: item.productId,
          sku: item.sku,
          name: item.productName,
          scale: item.scale,
          brand: item.brand,
          originalPrice: item.quotedPrice,
          unitPrice: item.quotedPrice,
          isManualPrice: false,
          quantity: qty,
          preOrderId: preOrder.id,
          preOrderItemId: item.id,
        };
        set({ items: [...items, newItem] });
      },

      updateItemQuantity: (productId, newQty) => {
        set({
          items: get().items.map((i) => (i.productId === productId ? { ...i, quantity: newQty } : i)),
        });
      },

      updateItemPrice: (productId, newPrice, reason) => {
        set({
          items: get().items.map((i) =>
            i.productId === productId
              ? { ...i, unitPrice: newPrice, isManualPrice: true, priceChangeReason: reason }
              : i
          ),
        });
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      attachCustomer: (customer) => {
        const { items } = get();
        const nextItems = items.map((i) => {
          if (i.isManualPrice || i.preOrderId) return i;
          if (customer && i.vipPrice) {
            return { ...i, unitPrice: i.vipPrice };
          }
          return { ...i, unitPrice: i.originalPrice };
        });
        set({ attachedCustomer: customer, items: nextItems });
      },

      setShippingFee: (fee) => set({ shippingFee: fee }),
      setOrderNote: (note) => set({ orderNote: note }),

      clearCart: () => set({ items: [], attachedCustomer: null, shippingFee: 0, orderNote: '' }),

      getSubtotal: () => safeAdd(...get().items.map((i) => i.unitPrice * i.quantity)),
      getTotalAmount: () => safeAdd(get().getSubtotal(), get().shippingFee),
      getTotalItemsCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'FREDS_POS_CART' }
  )
);
