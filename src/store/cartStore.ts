import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, ModelScale } from '@/types/product';
import type { Customer } from '@/types/customer';
import type { PreOrder, PreOrderItem } from '@/types/preorder';
import type { CheckoutOrder, CheckoutOrderItem } from '@/types/checkout';
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
  originalOrderId?: string;
  originalOrderItemId?: string;
  originalOrderCustomerId?: string;
  originalOrderCustomerName?: string;
  maxReturnableQty?: number;
  restock?: boolean;
  returnReason?: string;
}

function resolveUnitPrice(product: Product, customer: Customer | null): number {
  if (customer && product.vipPrice) return product.vipPrice;
  return product.listPrice;
}

interface CartStore {
  items: CartItem[];
  attachedCustomer: Customer | null;
  shippingFee: number;
  usedPoints: number;
  orderNote: string;

  addItem: (product: Product, qty?: number) => void;
  importPreOrderItem: (preOrder: PreOrder, item: PreOrderItem, qty: number) => void;
  importReturnItem: (
    order: CheckoutOrder,
    item: CheckoutOrderItem,
    returnQty: number,
    reason?: string,
    restock?: boolean
  ) => void;
  updateItemQuantity: (productId: string, newQty: number) => void;
  updateItemPrice: (productId: string, newPrice: number, reason?: string) => void;
  removeItem: (productId: string) => void;
  attachCustomer: (customer: Customer | null) => void;
  setShippingFee: (fee: number) => void;
  setUsedPoints: (points: number) => void;
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
      usedPoints: 0,
      orderNote: '',

      addItem: (product, qty = 1) => {
        const { items, attachedCustomer } = get();
        const isTargetReturn = qty < 0;
        const existing = items.find(
          (i) =>
            i.productId === product.id &&
            !i.preOrderId &&
            !i.originalOrderId &&
            (isTargetReturn ? i.quantity < 0 : i.quantity > 0)
        );
        if (existing) {
          set({
            items: items.map((i) =>
              i === existing ? { ...i, quantity: i.quantity + qty } : i
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

      importReturnItem: (order, item, returnQty, reason = '門市退換貨', restock = true) => {
        const { items, attachedCustomer } = get();

        // 綁定會員檢查：若已綁定會員，原單屬於「其他會員」（非當前會員且非散客）則不可帶入
        if (attachedCustomer && order.customerId && order.customerId !== attachedCustomer.id) {
          throw new Error(
            `原單屬於會員【${order.customerName || order.customerId}】，不可在當前會員【${attachedCustomer.name}】的結帳中辦理退貨`
          );
        }

        const maxReturnable = Math.max(0, item.quantity - (item.returnedQuantity ?? 0));
        const absQty = Math.min(Math.max(1, Math.abs(returnQty)), maxReturnable > 0 ? maxReturnable : Math.abs(returnQty));
        const existingIndex = items.findIndex(
          (i) => i.originalOrderId === order.id && (i.productId === item.productId || i.originalOrderItemId === (item as any).id)
        );

        if (existingIndex !== -1) {
          const updated = [...items];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: -absQty,
            originalOrderCustomerId: order.customerId,
            originalOrderCustomerName: order.customerName,
            maxReturnableQty: maxReturnable,
            returnReason: reason,
            restock,
          };
          set({ items: updated });
          return;
        }

        const returnItem: CartItem = {
          productId: item.productId,
          sku: item.sku,
          name: item.name,
          scale: item.scale,
          brand: '',
          originalPrice: item.originalPrice,
          unitPrice: item.unitPrice,
          isManualPrice: item.isManualPrice,
          priceChangeReason: item.priceDiffReason,
          quantity: -absQty,
          originalOrderId: order.id,
          originalOrderItemId: (item as any).id || item.productId,
          originalOrderCustomerId: order.customerId,
          originalOrderCustomerName: order.customerName,
          maxReturnableQty: maxReturnable,
          restock,
          returnReason: reason,
        };

        // 若購物車尚未綁定會員，自動帶入原單會員 (若原單為會員單)
        let nextCustomer = attachedCustomer;
        if (!attachedCustomer && order.customerId) {
          nextCustomer = {
            id: order.customerId,
            name: order.customerName || '會員',
            phone: order.customerPhone || '',
            vipTier: 'regular',
            vipTierName: '一般會員',
            rewardPoints: 0,
            totalSpent: 0,
            createdAt: order.createdAt,
          };
        }

        set({ items: [...items, returnItem], attachedCustomer: nextCustomer });
      },

      updateItemQuantity: (productId, newQty) => {
        set({
          items: get().items.map((i) => {
            if (i.productId !== productId) return i;
            if (newQty < 0 && i.maxReturnableQty !== undefined) {
              const clamped = Math.min(Math.abs(newQty), i.maxReturnableQty);
              return { ...i, quantity: -clamped };
            }
            return { ...i, quantity: newQty };
          }),
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
          if (i.isManualPrice || i.preOrderId || i.originalOrderId) return i;
          if (customer && i.vipPrice) {
            return { ...i, unitPrice: i.vipPrice };
          }
          return { ...i, unitPrice: i.originalPrice };
        });
        set({ attachedCustomer: customer, items: nextItems });
      },

      setShippingFee: (fee) => set({ shippingFee: fee }),
      setUsedPoints: (points) => set({ usedPoints: points }),
      setOrderNote: (note) => set({ orderNote: note }),

      clearCart: () => set({ items: [], attachedCustomer: null, shippingFee: 0, usedPoints: 0, orderNote: '' }),

      getSubtotal: () => safeAdd(...get().items.map((i) => i.unitPrice * i.quantity)),
      getTotalAmount: () => safeAdd(get().getSubtotal(), get().shippingFee, -get().usedPoints),
      getTotalItemsCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'FREDS_POS_CART' }
  )
);
