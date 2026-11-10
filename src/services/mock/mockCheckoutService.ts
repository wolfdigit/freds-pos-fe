import type { ICheckoutService } from '@/services/interfaces/ICheckoutService';
import type {
  CheckoutOrder,
  CheckoutOrderItem,
  CreateOrderPayload,
  CheckoutReceipt,
  OrderSearchParams,
  OrderStatus,
} from '@/types/checkout';
import { getProducts, setProducts, getOrders, setOrders, getStoredStores, simulateDelay } from './storageHelper';
import { addQuantity, defaultLocationRows, LOCATIONS_STORAGE_KEY, loginStoreFrom, readPersistedStoreName } from './inventoryCatalog';
import { safeAdd } from '@/utils/currency';
import { nowIso, formatDate } from '@/utils/date';
import { BusinessError } from '@/utils/errors';
import { MockCustomerService } from './mockCustomerService';

const customerService = new MockCustomerService();

function buildOrderNumber(existingCount: number): string {
  const datePart = formatDate(nowIso()).replace(/-/g, '');
  const seq = String(existingCount + 1).padStart(4, '0');
  return `SO-${datePart}-${seq}`;
}

export class MockCheckoutService implements ICheckoutService {
  async createCheckoutOrder(payload: CreateOrderPayload, _idempotencyKey?: string): Promise<CheckoutReceipt> {
    await simulateDelay();

    const products = getProducts();
    const orders = getOrders();
    const productMap = new Map(products.map((p) => [p.id, p]));

    let customer = null;
    if (payload.customerId) {
      customer = await customerService.getCustomerById(payload.customerId);
      if (!customer) {
        throw new BusinessError('CUSTOMER_NOT_FOUND', '找不到指定的會員');
      }
    }

    // --- 1. 逐項運算與業務前置驗證 ---
    const calculatedItems: CheckoutOrderItem[] = [];
    let itemsSubtotal = 0;
    let discountAmount = 0;

    for (const item of payload.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new BusinessError('PRODUCT_NOT_FOUND', `找不到商品 (ID: ${item.productId})`);
      }

      // 決定單價與原價
      const originalPrice = product.listPrice;
      let unitPrice = item.unitPrice ?? product.listPrice;

      if (!item.isManualPrice) {
        unitPrice = product.listPrice;
      }


      // 若為負數退換貨品項
      if (item.quantity < 0) {
        if (item.originalOrderId) {
          const originalOrder = orders.find((o) => o.id === item.originalOrderId);
          if (originalOrder) {
            // 跨會員檢查：原單若屬於特定會員，不可在其他會員交易中辦理退貨 (但散客原單可退至當前會員)
            if (payload.customerId && originalOrder.customerId && originalOrder.customerId !== payload.customerId) {
              throw new BusinessError(
                'INVALID_RETURN_CUSTOMER',
                `原單屬於會員【${originalOrder.customerName || originalOrder.customerId}】，不可在當前會員【${customer?.name || payload.customerId}】之交易中退貨`
              );
            }

            const originalItem = originalOrder.items.find(
              (i) => i.productId === item.productId || (i as any).id === item.originalOrderItemId
            );
            if (originalItem) {
              const returnedSoFar = originalItem.returnedQuantity ?? 0;
              const remainingReturnable = originalItem.quantity - returnedSoFar;
              if (Math.abs(item.quantity) > remainingReturnable) {
                throw new BusinessError('RETURN_QTY_EXCEEDED', `退貨數量超過原單剩餘可退上限 (${remainingReturnable} 件)`);
              }
            }
          }
        }
      }

      const lineSubtotal = safeAdd(unitPrice * item.quantity);
      itemsSubtotal = safeAdd(itemsSubtotal, lineSubtotal);
      discountAmount = safeAdd(discountAmount, (originalPrice - unitPrice) * item.quantity);

      calculatedItems.push({
        productId: product.id,
        sku: product.sku,
        name: product.name,
        scale: product.scale,
        originalPrice,
        unitPrice,
        isManualPrice: !!item.isManualPrice,
        priceDiffReason: item.priceDiffReason,
        quantity: item.quantity,
        subtotal: lineSubtotal,
        note: item.note,
        returnedQuantity: 0,
        originalOrderId: item.originalOrderId,
        originalOrderItemId: item.originalOrderItemId,
        restock: item.restock ?? true,
        returnReason: item.returnReason,
      });
    }

    const shippingFee = payload.shippingFee ?? 0;
    const totalAmount = safeAdd(itemsSubtotal, shippingFee);
    const paymentsTotal = safeAdd(...payload.payments.map((p) => p.amount));

    // 純退款時 paymentsTotal 需等於 totalAmount (例如皆為 -650)；購買時 paymentsTotal 需大於等於 totalAmount
    if (totalAmount >= 0) {
      if (paymentsTotal < totalAmount) {
        throw new BusinessError('PAYMENT_INSUFFICIENT', '支付總額不足');
      }
    }

    // --- 3. 原子寫入異動階段 ---
    // 3.1 銷售扣登入門市的正常貨地點（可以變負數）。退貨回補退貨地點。
    const loginStore = loginStoreFrom(getStoredStores(), readPersistedStoreName());
    if (!loginStore) throw new BusinessError('LOCATION_NOT_FOUND', '找不到門市');
    const locationRaw = localStorage.getItem(LOCATIONS_STORAGE_KEY);
    const locations = locationRaw ? (JSON.parse(locationRaw) as Array<{ id: string; name: string }>) : defaultLocationRows();
    let nextProducts = products.map((product) => ({ ...product, inventories: product.inventories.map((row) => ({ ...row })) }));
    for (const item of calculatedItems) {
      const idx = nextProducts.findIndex((product) => product.id === item.productId);
      if (idx === -1) continue;
      if (item.quantity > 0) {
        nextProducts[idx] = addQuantity(nextProducts[idx], loginStore.inventoryLocationId, -item.quantity, locations);
        item.inventoryLocationId = loginStore.inventoryLocationId;
        item.inventoryLocationName = loginStore.inventoryLocationName;
      } else if (item.quantity < 0 && item.restock !== false) {
        nextProducts[idx] = addQuantity(
          nextProducts[idx],
          loginStore.returnedInventoryLocationId,
          Math.abs(item.quantity),
          locations
        );
        item.inventoryLocationId = loginStore.returnedInventoryLocationId;
        item.inventoryLocationName = loginStore.returnedInventoryLocationName;
      }
    }
    setProducts(nextProducts);

    // 3.2 若為退貨，更新原訂單之 returnedQuantity 與狀態
    let nextOrders = [...orders];
    for (const item of calculatedItems) {
      if (item.quantity < 0 && item.originalOrderId) {
        nextOrders = nextOrders.map((ord) => {
          if (ord.id !== item.originalOrderId) return ord;
          const updatedItems = ord.items.map((oi) => {
            if (oi.productId === item.productId || (oi as any).id === item.originalOrderItemId) {
              const currentReturned = oi.returnedQuantity ?? 0;
              return { ...oi, returnedQuantity: currentReturned + Math.abs(item.quantity) };
            }
            return oi;
          });
          const allReturned = updatedItems.every((oi) => (oi.returnedQuantity ?? 0) >= oi.quantity);
          const someReturned = updatedItems.some((oi) => (oi.returnedQuantity ?? 0) > 0);
          const newStatus: OrderStatus = allReturned ? 'refunded' : someReturned ? 'partially_refunded' : ord.status;
          return { ...ord, items: updatedItems, status: newStatus };
        });
      }
    }

    // 3.4 建立並儲存本次新訂單
    const newOrder: CheckoutOrder = {
      id: `so-${Date.now()}`,
      orderNumber: buildOrderNumber(orders.length),
      cashierId: 'staff-001',
      cashierName: '店長 Fred',
      status: 'completed',
      customerId: payload.customerId,
      customerName: customer?.name || 'Retail',
      customerPhone: customer?.phone,
      items: calculatedItems,
      itemsSubtotal,
      discountAmount,
      shippingFee,
      totalAmount,
      payments: payload.payments,
      note: payload.note,
      createdAt: nowIso(),
      createdBy: '店長 Fred',
      updatedAt: nowIso(),
      updatedBy: '店長 Fred',
    };

    // 3.5 更新會員消費額
    if (payload.customerId && customer) {
      await customerService.updateCustomerSpending(payload.customerId, totalAmount);
    }

    setOrders([...nextOrders, newOrder]);

    return { order: newOrder };
  }

  async getOrderHistory(params?: OrderSearchParams | string): Promise<CheckoutOrder[]> {
    await simulateDelay();
    const orders = getOrders();

    if (typeof params === 'string') {
      return orders.filter((o) => o.customerId === params);
    }

    if (!params) {
      return orders;
    }

    const products = getProducts();
    const productBarcodeMap = new Map(products.map((p) => [p.id, p.barcode]));

    return orders.filter((o) => {
      if (params.customerId && o.customerId !== params.customerId) return false;
      if (params.orderNumber && !o.orderNumber.toLowerCase().includes(params.orderNumber.toLowerCase())) return false;
      if (params.productId && !o.items.some((i) => i.productId === params.productId)) return false;
      if (params.status && params.status !== 'all' && o.status !== params.status) return false;
      if (params.startDate && o.createdAt < params.startDate) return false;
      if (params.endDate) {
        // If endDate has time (e.g. YYYY-MM-DDTHH:mm), compare directly, otherwise append end of day
        const endCompare = params.endDate.includes('T') ? params.endDate : `${params.endDate}T23:59:59.999Z`;
        if (o.createdAt > endCompare) return false;
      }
      if (params.minAmount !== undefined && !isNaN(params.minAmount) && o.totalAmount < params.minAmount) return false;
      if (params.maxAmount !== undefined && !isNaN(params.maxAmount) && o.totalAmount > params.maxAmount) return false;
      if (params.productKeyword) {
        const pkw = params.productKeyword.toLowerCase().trim();
        const hasProduct = o.items.some((i) => {
          const barcode = productBarcodeMap.get(i.productId) || '';
          return (
            i.name.toLowerCase().includes(pkw) ||
            i.sku.toLowerCase().includes(pkw) ||
            barcode.includes(pkw)
          );
        });
        if (!hasProduct) return false;
      }
      if (params.keyword) {
        const kw = params.keyword.toLowerCase().trim();
        const matchNumber = o.orderNumber.toLowerCase().includes(kw);
        const matchCustomer =
          (o.customerName && o.customerName.toLowerCase().includes(kw)) ||
          (o.customerPhone && o.customerPhone.includes(kw));
        const matchProduct = o.items.some((i) => {
          const barcode = productBarcodeMap.get(i.productId) || '';
          return (
            i.name.toLowerCase().includes(kw) ||
            i.sku.toLowerCase().includes(kw) ||
            barcode.includes(kw)
          );
        });
        if (!matchNumber && !matchCustomer && !matchProduct) return false;
      }
      return true;
    });


  }

  async getOrderById(orderId: string): Promise<CheckoutOrder | null> {
    await simulateDelay();
    return getOrders().find((o) => o.id === orderId) ?? null;
  }
}
