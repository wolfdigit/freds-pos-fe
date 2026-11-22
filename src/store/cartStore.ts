import { create } from 'zustand';
import { getBoundCartUserId } from '@/auth/cartOwner';
import type { Product, ModelScale } from '@/types/product';
import type { Customer } from '@/types/customer';
import { POINTS_DISCOUNT_AMOUNT, type CheckoutOrder, type CheckoutOrderItem } from '@/types/checkout';
import { safeAdd } from '@/utils/currency';

export interface CartItem {
  productId: string;
  sku: string;
  barcode?: string;
  name: string;
  scale?: ModelScale | string;
  brand: string;
  spec?: string;
  originalPrice: number;
  unitPrice: number;
  isManualPrice: boolean;
  priceChangeReason?: string;
  quantity: number;
  loginStoreQuantity?: number | null;
  loginStoreReturnedQuantity?: number | null;
  totalInventory?: number;
  originalOrderId?: string;
  originalOrderNumber?: string;
  originalOrderItemId?: string;
  originalOrderCustomerId?: string;
  originalOrderCustomerName?: string;
  maxReturnableQty?: number;
  restock?: boolean;
  returnReason?: string;
  /** 這一列用了會員點數折抵（固定 1 件，單價已扣 POINTS_DISCOUNT_AMOUNT）。 */
  pointsDiscountApplied?: boolean;
  /** 勾選點數折抵前的單價；取消勾選時還原成這個價格。 */
  pointsBasePrice?: number;
  /** 預購取貨：這一列從門市的預購保留地點扣庫存。只用在銷售列。 */
  preorderPickup?: boolean;
}

export { POINTS_DISCOUNT_AMOUNT };

export function pointsDiscountedPrice(basePrice: number): number {
  return Math.max(0, basePrice - POINTS_DISCOUNT_AMOUNT);
}

/** 一般銷售列（不是退貨、不是點數折抵列）。 */
function isPlainSaleLine(item: CartItem): boolean {
  return item.quantity > 0 && !item.originalOrderId && !item.pointsDiscountApplied;
}

/**
 * 依商品與是否為點數折抵列找列。原本以 productId 操作的動作預設只動非點數列，
 * 點數列（同商品另一列、固定 1 件）要明確指定 points=true。
 */
function matchesLine(item: CartItem, productId: string, points: boolean): boolean {
  return item.productId === productId && Boolean(item.pointsDiscountApplied) === points;
}

/** 取消點數折抵：併回同商品的一般銷售列；沒有就把這一列還原成原價。 */
function withoutPointsLine(items: CartItem[], pointsLine: CartItem): CartItem[] {
  const plain = items.find((i) => i.productId === pointsLine.productId && isPlainSaleLine(i));
  if (plain) {
    return items
      .filter((i) => i !== pointsLine)
      .map((i) => (i === plain ? { ...i, quantity: i.quantity + pointsLine.quantity } : i));
  }
  const restored: CartItem = {
    ...pointsLine,
    unitPrice: pointsLine.pointsBasePrice ?? pointsLine.originalPrice,
  };
  delete restored.pointsDiscountApplied;
  delete restored.pointsBasePrice;
  return items.map((i) => (i === pointsLine ? restored : i));
}

function withoutAllPointsLines(items: CartItem[]): CartItem[] {
  let next = items;
  for (const line of items.filter((i) => i.pointsDiscountApplied)) {
    next = withoutPointsLine(next, line);
  }
  return next;
}

interface CartStore {
  items: CartItem[];
  attachedCustomer: Customer | null;
  shippingFee: number;
  orderNote: string;

  highlightedProductId: string | null;
  setHighlightedProductId: (id: string | null) => void;

  addItem: (product: Product, qty?: number) => void;
  switchItemSku: (oldProductId: string, newProduct: Product) => void;
  importReturnItem: (
    order: CheckoutOrder,
    item: CheckoutOrderItem,
    returnQty: number,
    reason?: string,
    restock?: boolean
  ) => void;
  updateItemQuantity: (productId: string, newQty: number, points?: boolean) => void;
  updateItemPrice: (productId: string, newPrice: number, reason?: string) => void;
  removeItem: (productId: string, points?: boolean) => void;
  /**
   * 勾選或取消某商品的點數折抵。勾選時從一般銷售列拆出 1 件成獨立的點數列，
   * 單價 = max(0, 原單價 − 360)；取消時併回。需要已綁定會員，同商品只能一列。
   */
  setPointsDiscount: (productId: string, applied: boolean) => void;
  /** 勾選或取消某一銷售列的「預購取貨」。points 指定是點數折抵列還是一般列。 */
  setPreorderPickup: (productId: string, points: boolean, pickup: boolean) => void;
  attachCustomer: (customer: Customer | null) => void;
  setShippingFee: (fee: number) => void;
  setOrderNote: (note: string) => void;
  clearCart: () => void;

  getSubtotal: () => number;
  getTotalAmount: () => number;
  getTotalItemsCount: () => number;
  getSalesItemsCount: () => number;
  getReturnItemsCount: () => number;
}

function canOperateCart(): boolean {
  return getBoundCartUserId() !== null;
}

export const useCartStore = create<CartStore>()((set, get) => ({
      items: [],
      attachedCustomer: null,
      shippingFee: 0,
      orderNote: '',
      highlightedProductId: null,

      setHighlightedProductId: (id) => set({ highlightedProductId: id }),

      addItem: (product, qty = 1) => {
        if (!canOperateCart()) return;
        const { items } = get();
        const isTargetReturn = qty < 0;
        const existing = items.find(
          (i) =>
            i.productId === product.id &&
            !i.originalOrderId &&
            !i.pointsDiscountApplied &&
            (isTargetReturn ? i.quantity < 0 : i.quantity > 0)
        );
        if (existing) {
          set({
            items: items.map((i) =>
              i === existing ? { ...i, quantity: i.quantity + qty } : i
            ),
            highlightedProductId: existing.productId,
          });
          return;
        }

        const newItem: CartItem = {
          productId: product.id,
          sku: product.sku,
          barcode: product.barcode,
          name: product.name,
          scale: product.scale,
          brand: product.brand,
          spec: product.spec,
          originalPrice: product.listPrice,
          unitPrice: product.listPrice,
          isManualPrice: false,
          quantity: qty,
          loginStoreQuantity: product.loginStoreQuantity,
          loginStoreReturnedQuantity: product.loginStoreReturnedQuantity,
          totalInventory: product.totalInventory,
        };
        set({ items: [...items, newItem] });
      },

      switchItemSku: (oldProductId, newProduct) => {
        if (!canOperateCart()) return;
        const { items } = get();
        const currentItem = items.find(
          (i) => i.productId === oldProductId && isPlainSaleLine(i)
        );
        if (!currentItem) return;

        // 依需求 1：檢查購物車中是否已存在相同貨號的待結品項，若有則自動合併數量
        const existingTarget = items.find(
          (i) =>
            i.productId === newProduct.id &&
            i !== currentItem &&
            isPlainSaleLine(i)
        );

        if (existingTarget) {
          const mergedQty = existingTarget.quantity + currentItem.quantity;
          set({
            items: items
              .filter((i) => i !== currentItem)
              .map((i) => (i === existingTarget ? { ...i, quantity: mergedQty } : i)),
            highlightedProductId: existingTarget.productId,
          });
          return;
        }

        set({
          items: items.map((i) => {
            if (i !== currentItem) return i;
            return {
              ...i,
              productId: newProduct.id,
              sku: newProduct.sku,
              barcode: newProduct.barcode,
              name: newProduct.name,
              scale: newProduct.scale,
              brand: newProduct.brand,
              spec: newProduct.spec,
              originalPrice: newProduct.listPrice,
              unitPrice: i.isManualPrice ? i.unitPrice : newProduct.listPrice,
              loginStoreQuantity: newProduct.loginStoreQuantity,
              loginStoreReturnedQuantity: newProduct.loginStoreReturnedQuantity,
              totalInventory: newProduct.totalInventory,
            };
          }),
        });
      },

      importReturnItem: (order, item, returnQty, reason = '門市退換貨', restock = true) => {
        if (!canOperateCart()) return;
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
            originalOrderNumber: order.orderNumber,
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
          originalOrderNumber: order.orderNumber,
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
            email: null,
            vipTier: 'Retail',
            vipTierName: '零售客戶 (Retail)',
            totalSpent: 0,
            createdAt: order.createdAt,
            updatedAt: order.createdAt,
          };
        }

        set({ items: [...items, returnItem], attachedCustomer: nextCustomer });
      },

      updateItemQuantity: (productId, newQty, points = false) => {
        if (!canOperateCart()) return;
        set({
          items: get().items.map((i) => {
            if (!matchesLine(i, productId, points)) return i;
            // 點數折抵列固定 1 件；要多買請加在一般列。
            if (i.pointsDiscountApplied) return i;
            if (newQty < 0 && i.maxReturnableQty !== undefined) {
              const clamped = Math.min(Math.abs(newQty), i.maxReturnableQty);
              return { ...i, quantity: -clamped };
            }
            return { ...i, quantity: newQty };
          }),
        });
      },

      updateItemPrice: (productId, newPrice, reason) => {
        if (!canOperateCart()) return;
        set({
          // 點數折抵列不能直接改價，要先取消勾選。
          items: get().items.map((i) =>
            matchesLine(i, productId, false)
              ? { ...i, unitPrice: newPrice, isManualPrice: true, priceChangeReason: reason }
              : i
          ),
        });
      },

      removeItem: (productId, points = false) => {
        if (!canOperateCart()) return;
        set({ items: get().items.filter((i) => !matchesLine(i, productId, points)) });
      },

      setPointsDiscount: (productId, applied) => {
        if (!canOperateCart()) return;
        const { items, attachedCustomer } = get();
        const pointsLine = items.find((i) => i.productId === productId && i.pointsDiscountApplied);
        if (!applied) {
          if (pointsLine) set({ items: withoutPointsLine(items, pointsLine) });
          return;
        }
        // 散客不能折抵；同一商品只能折抵一次。
        if (!attachedCustomer || pointsLine) return;
        const plain = items.find((i) => i.productId === productId && isPlainSaleLine(i));
        if (!plain) return;
        const basePrice = plain.unitPrice;
        const redeemed: CartItem = {
          ...plain,
          quantity: 1,
          unitPrice: pointsDiscountedPrice(basePrice),
          pointsDiscountApplied: true,
          pointsBasePrice: basePrice,
        };
        if (plain.quantity <= 1) {
          set({ items: items.map((i) => (i === plain ? redeemed : i)) });
          return;
        }
        // 多件時拆出 1 件折抵，其餘維持原價，所以一個商品最多折 360。
        const next: CartItem[] = [];
        for (const i of items) {
          if (i === plain) {
            next.push({ ...i, quantity: i.quantity - 1 }, redeemed);
          } else {
            next.push(i);
          }
        }
        set({ items: next });
      },

      setPreorderPickup: (productId, points, pickup) => {
        if (!canOperateCart()) return;
        set({
          items: get().items.map((i) => {
            if (!matchesLine(i, productId, points) || i.quantity <= 0 || i.originalOrderId) return i;
            if (pickup) return { ...i, preorderPickup: true };
            const next = { ...i };
            delete next.preorderPickup;
            return next;
          }),
        });
      },

      attachCustomer: (customer) => {
        if (!canOperateCart()) return;
        // 解除會員時，點數折抵全部取消並還原單價。
        set(customer ? { attachedCustomer: customer } : { attachedCustomer: null, items: withoutAllPointsLines(get().items) });
      },

      setShippingFee: (fee) => {
        if (!canOperateCart()) return;
        set({ shippingFee: fee });
      },
      setOrderNote: (note) => {
        if (!canOperateCart()) return;
        set({ orderNote: note });
      },

      clearCart: () => {
        if (!canOperateCart()) return;
        set({ items: [], attachedCustomer: null, shippingFee: 0, orderNote: '' });
      },

      getSubtotal: () => safeAdd(...get().items.map((i) => i.unitPrice * i.quantity)),
      getTotalAmount: () => safeAdd(get().getSubtotal(), get().shippingFee),
      getTotalItemsCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getSalesItemsCount: () => get().items.filter((i) => i.quantity > 0).reduce((sum, i) => sum + i.quantity, 0),
      getReturnItemsCount: () => get().items.filter((i) => i.quantity < 0).reduce((sum, i) => sum + Math.abs(i.quantity), 0),
    })
);

