import type { ICheckoutService } from '@/services/interfaces/ICheckoutService';
import type {
  CheckoutOrder,
  CheckoutOrderItem,
  CheckoutOrderPage,
  CreateOrderPayload,
  CheckoutReceipt,
  OrderPageParams,
  OrderSearchParams,
  OrderStatus,
} from '@/types/checkout';
import { hasOrderHistoryFilter, ORDER_HISTORY_FILTER_REQUIRED } from '@/types/checkout';
import { getProducts, setProducts, getOrders, setOrders, getStoredStores, simulateDelay } from './storageHelper';
import { addQuantity, defaultLocationRows, LOCATIONS_STORAGE_KEY, loginStoreFrom, readPersistedStoreName } from './inventoryCatalog';
import { safeAdd } from '@/utils/currency';
import { nowIso, formatDate } from '@/utils/date';
import { BusinessError } from '@/utils/errors';
import { MockCustomerService } from './mockCustomerService';
import { soldInStore } from './storeProductCatalog';

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
    let pointsDiscountAmount = 0;
    const redeemedProducts = new Set<string>();

    for (const item of payload.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new BusinessError('PRODUCT_NOT_FOUND', `找不到商品 (ID: ${item.productId})`);
      }
      // 跟後端一樣：list 門市只能賣清單商品，退貨不檢查。
      if (
        item.quantity > 0 &&
        soldInStore(loginStoreFrom(getStoredStores(), readPersistedStoreName()), product.id) === false
      ) {
        throw new BusinessError(
          'PRODUCT_NOT_IN_STORE',
          `本門市未販售此商品：${product.sku} (ID: ${product.id})`
        );
      }

      // 決定單價與原價
      let originalPrice = product.listPrice;
      let unitPrice = item.unitPrice ?? product.listPrice;
      let isManualPrice = !!item.isManualPrice;

      // 與後端相同的點數折抵規則：需會員、需單價（不可負）、數量 1、同商品一次、退貨列不可送旗標。
      // 預購取貨只能用在銷售列（跟後端一樣回 422）。
      if (item.preorderPickup && item.quantity < 0) {
        throw new BusinessError('INVALID_PAYMENT', '退貨品項不能標記預購取貨');
      }
      let pointsApplied = Boolean(item.pointsDiscountApplied);
      if (pointsApplied) {
        if (item.quantity < 0) {
          throw new BusinessError('INVALID_PAYMENT', '退貨品項不能使用點數折抵');
        }
        if (!payload.customerId) {
          throw new BusinessError('INVALID_PAYMENT', '散客不能使用點數折抵');
        }
        if (redeemedProducts.has(item.productId)) {
          throw new BusinessError('INVALID_PAYMENT', '同一商品只能折抵一次');
        }
        if (item.unitPrice === undefined || item.unitPrice === null) {
          throw new BusinessError('INVALID_PAYMENT', '點數折抵必須提供單價');
        }
        if (item.unitPrice < 0) {
          throw new BusinessError('INVALID_PAYMENT', '點數折抵後單價不能為負數');
        }
        if (item.quantity !== 1) {
          throw new BusinessError('INVALID_PAYMENT', '點數折抵的品項數量必須為 1');
        }
        redeemedProducts.add(item.productId);
        unitPrice = item.unitPrice;
      } else if (!item.isManualPrice) {
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

            const originalItem =
              originalOrder.items.find((i) => (i as any).id && (i as any).id === item.originalOrderItemId) ??
              originalOrder.items.find((i) => i.productId === item.productId);
            if (originalItem) {
              const returnedSoFar = originalItem.returnedQuantity ?? 0;
              const remainingReturnable = originalItem.quantity - returnedSoFar;
              if (Math.abs(item.quantity) > remainingReturnable) {
                throw new BusinessError('RETURN_QTY_EXCEEDED', `退貨數量超過原單剩餘可退上限 (${remainingReturnable} 件)`);
              }
              // 與後端相同：退貨列沿用原單那一列的價格與點數旗標，退回的差額記在點數折抵。
              originalPrice = originalItem.originalPrice;
              unitPrice = originalItem.unitPrice;
              isManualPrice = originalItem.isManualPrice;
              pointsApplied = Boolean(originalItem.pointsDiscountApplied);
            }
          }
        }
      }

      const lineSubtotal = safeAdd(unitPrice * item.quantity);
      const priceDifference = (originalPrice - unitPrice) * item.quantity;
      itemsSubtotal = safeAdd(itemsSubtotal, lineSubtotal);
      // 點數列的整個差額算點數折抵；折讓只算手動改價且沒有點數旗標的列（與後端相同）。
      if (pointsApplied) {
        pointsDiscountAmount = safeAdd(pointsDiscountAmount, priceDifference);
      } else if (isManualPrice) {
        discountAmount = safeAdd(discountAmount, priceDifference);
      }

      calculatedItems.push({
        productId: product.id,
        sku: product.sku,
        name: product.name,
        scale: product.scale,
        originalPrice,
        unitPrice,
        isManualPrice,
        priceDiffReason: item.priceDiffReason,
        quantity: item.quantity,
        subtotal: lineSubtotal,
        pointsDiscountApplied: pointsApplied,
        preorderPickup: item.quantity > 0 && Boolean(item.preorderPickup),
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
    // 3.1 銷售扣登入門市的正常貨地點（可以變負數）；預購取貨的列改扣預購保留地點。
    // 退貨：restock 不是 false 時加回正常貨（可售）；false 時加到退貨庫存點。
    const loginStore = loginStoreFrom(getStoredStores(), readPersistedStoreName());
    if (!loginStore) throw new BusinessError('LOCATION_NOT_FOUND', '找不到門市');
    const locationRaw = localStorage.getItem(LOCATIONS_STORAGE_KEY);
    const locations = locationRaw ? (JSON.parse(locationRaw) as Array<{ id: string; name: string }>) : defaultLocationRows();
    let nextProducts = products.map((product) => ({ ...product, inventories: product.inventories.map((row) => ({ ...row })) }));
    for (const item of calculatedItems) {
      const idx = nextProducts.findIndex((product) => product.id === item.productId);
      if (idx === -1) continue;
      if (item.quantity > 0) {
        const fromPreorder = Boolean(item.preorderPickup) && Boolean(loginStore.preorderInventoryLocationId);
        const locationId = fromPreorder ? loginStore.preorderInventoryLocationId : loginStore.inventoryLocationId;
        const locationName = fromPreorder ? loginStore.preorderInventoryLocationName : loginStore.inventoryLocationName;
        nextProducts[idx] = addQuantity(nextProducts[idx], locationId, -item.quantity, locations);
        item.inventoryLocationId = locationId;
        item.inventoryLocationName = locationName;
      } else if (item.quantity < 0) {
        const toNormal = item.restock !== false;
        const locationId = toNormal ? loginStore.inventoryLocationId : loginStore.returnedInventoryLocationId;
        const locationName = toNormal ? loginStore.inventoryLocationName : loginStore.returnedInventoryLocationName;
        nextProducts[idx] = addQuantity(nextProducts[idx], locationId, Math.abs(item.quantity), locations);
        item.inventoryLocationId = locationId;
        item.inventoryLocationName = locationName;
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
      pointsDiscountAmount,
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

  async getRecentOrders(limit: number): Promise<CheckoutOrder[]> {
    await simulateDelay();
    return getOrders()
      .slice()
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, Math.max(0, limit));
  }

  async searchOrderPage(params: OrderPageParams): Promise<CheckoutOrderPage> {
    const { page, pageSize, ...filters } = params;
    await simulateDelay();
    const matched = this.filterOrders(filters)
      .slice()
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    const start = (Math.max(1, page) - 1) * pageSize;
    return { items: matched.slice(start, start + pageSize), page, pageSize, total: matched.length };
  }

  async getOrderHistory(params?: OrderSearchParams | string): Promise<CheckoutOrder[]> {
    await simulateDelay();
    // 與 HTTP 版相同：沒有限縮條件就拒絕，避免畫面在 mock 下正常、上線後抓全部歷史。
    if (!hasOrderHistoryFilter(typeof params === 'string' ? { customerId: params } : params)) {
      throw new Error(ORDER_HISTORY_FILTER_REQUIRED);
    }
    return this.filterOrders(params);
  }

  private filterOrders(params?: OrderSearchParams | string): CheckoutOrder[] {
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
