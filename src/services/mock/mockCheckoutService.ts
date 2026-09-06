import type { ICheckoutService } from '@/services/interfaces/ICheckoutService';
import type {
  CheckoutOrder,
  CheckoutOrderItem,
  CreateOrderPayload,
  CheckoutReceipt,
  OrderSearchParams,
  OrderStatus,
} from '@/types/checkout';
import type { Product, StockLocation } from '@/types/product';
import { getProducts, setProducts, getOrders, setOrders, simulateDelay } from './storageHelper';
import { getPreOrders, setPreOrders } from './storageHelper';
import { derivePreOrderStatus } from './mockPreOrderService';
import { safeAdd } from '@/utils/currency';
import { nowIso, formatDate } from '@/utils/date';
import { BusinessError } from '@/utils/errors';
import { MockCustomerService } from './mockCustomerService';

const customerService = new MockCustomerService();

const STORE_LOCATION: StockLocation = 'store';

function buildOrderNumber(existingCount: number): string {
  const datePart = formatDate(nowIso()).replace(/-/g, '');
  const seq = String(existingCount + 1).padStart(4, '0');
  return `SO-${datePart}-${seq}`;
}

function buildReceiptHtml(order: CheckoutOrder): string {
  const rows = order.items
    .map(
      (item) =>
        `<tr><td>${item.name}</td><td>${item.quantity}</td><td>${item.unitPrice}</td><td>${item.subtotal}</td></tr>`
    )
    .join('');
  return `
    <div class="receipt">
      <h2>Fred's POS</h2>
      <p>單號: ${order.orderNumber}</p>
      <p>收銀員: ${order.cashierName}</p>
      <table>${rows}</table>
      <p>應收總額: NT$ ${order.totalAmount}</p>
    </div>
  `;
}

export class MockCheckoutService implements ICheckoutService {
  async createCheckoutOrder(payload: CreateOrderPayload, _idempotencyKey?: string): Promise<CheckoutReceipt> {
    await simulateDelay();

    const products = getProducts();
    const preOrders = getPreOrders();
    const orders = getOrders();
    const productMap = new Map(products.map((p) => [p.id, p]));

    let customer = null;
    if (payload.customerId) {
      customer = await customerService.getCustomerById(payload.customerId);
      if (!customer) {
        throw new BusinessError('CUSTOMER_NOT_FOUND', '找不到指定的會員');
      }
    }

    // --- 1. 點數折抵驗證 ---
    const usedPoints = payload.usedPoints ?? 0;
    if (usedPoints > 0) {
      if (!customer) {
        throw new BusinessError('INSUFFICIENT_POINTS', '未綁定會員無法使用點數折抵');
      }
      if (customer.rewardPoints < usedPoints) {
        throw new BusinessError('INSUFFICIENT_POINTS', `會員點數不足 (現有: ${customer.rewardPoints} 點，欲折抵: ${usedPoints} 點)`);
      }
    }

    // --- 2. 逐項運算與業務前置驗證 ---
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
        if (customer && product.vipPrice) {
          unitPrice = product.vipPrice;
        } else {
          unitPrice = product.listPrice;
        }
      }

      // 若為預購取貨
      if (item.preOrderId && item.preOrderItemId) {
        const preOrder = preOrders.find((po) => po.id === item.preOrderId);
        const preOrderItem = preOrder?.items.find((i) => i.id === item.preOrderItemId);
        if (!preOrder || !preOrderItem) {
          throw new BusinessError('PREORDER_QTY_EXCEEDED', '找不到對應的預購單品項');
        }
        const available = preOrderItem.qtyArrived - preOrderItem.qtyDelivered;
        if (item.quantity > available) {
          throw new BusinessError('PREORDER_QTY_EXCEEDED', `超過可取數量上限：${preOrderItem.productName}`);
        }
        unitPrice = preOrderItem.quotedPrice;
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
        returnedQuantity: 0,
        preOrderId: item.preOrderId,
        preOrderItemId: item.preOrderItemId,
        originalOrderId: item.originalOrderId,
        originalOrderItemId: item.originalOrderItemId,
        restock: item.restock ?? true,
        returnReason: item.returnReason,
      });
    }

    const shippingFee = payload.shippingFee ?? 0;
    const totalAmount = safeAdd(itemsSubtotal, shippingFee, -usedPoints);
    const paymentsTotal = safeAdd(...payload.payments.map((p) => p.amount));

    // 純退款時 paymentsTotal 需等於 totalAmount (例如皆為 -650)；購買時 paymentsTotal 需大於等於 totalAmount
    if (totalAmount >= 0) {
      if (paymentsTotal < totalAmount) {
        throw new BusinessError('PAYMENT_INSUFFICIENT', '支付總額不足');
      }
    }

    // --- 3. 原子寫入異動階段 ---
    // 3.1 更新門市庫存
    let nextProducts = [...products];
    for (const item of calculatedItems) {
      nextProducts = nextProducts.map((p): Product => {
        if (p.id !== item.productId) return p;
        const next = { ...p, stocks: p.stocks.map((s) => ({ ...s })) };
        const storeStock = next.stocks.find((s) => s.location === STORE_LOCATION);
        if (storeStock) {
          if (item.quantity > 0) {
            storeStock.quantity -= item.quantity;
          } else if (item.quantity < 0 && item.restock !== false) {
            storeStock.quantity += Math.abs(item.quantity);
          }
        }
        next.totalStock = next.stocks.reduce((sum, s) => sum + s.quantity, 0);
        return next;
      });
    }
    setProducts(nextProducts);

    // 3.2 沖銷預購單
    let nextPreOrders = [...preOrders];
    for (const item of calculatedItems) {
      if (!item.preOrderId || !item.preOrderItemId || item.quantity <= 0) continue;
      nextPreOrders = nextPreOrders.map((po) => {
        if (po.id !== item.preOrderId) return po;
        const nextItems = po.items.map((i) =>
          i.id === item.preOrderItemId ? { ...i, qtyDelivered: i.qtyDelivered + item.quantity } : i
        );
        return { ...po, items: nextItems, status: derivePreOrderStatus(nextItems), updatedAt: nowIso() };
      });
    }
    setPreOrders(nextPreOrders);

    // 3.3 若為退貨，更新原訂單之 returnedQuantity 與狀態
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
    const earnedPoints = totalAmount > 0 ? Math.floor(totalAmount / 100) : 0;
    const newOrder: CheckoutOrder = {
      id: `so-${Date.now()}`,
      orderNumber: buildOrderNumber(orders.length),
      cashierId: 'staff-001',
      cashierName: '店長 Fred',
      status: 'completed',
      customerId: payload.customerId,
      customerName: customer?.name,
      customerPhone: customer?.phone,
      items: calculatedItems,
      itemsSubtotal,
      discountAmount,
      shippingFee,
      totalAmount,
      payments: payload.payments,
      invoice: payload.invoice,
      earnedPoints,
      usedPoints,
      note: payload.note,
      createdAt: nowIso(),
    };

    // 3.5 更新會員消費額與點數
    if (payload.customerId && customer) {
      const netPointsDiff = earnedPoints - usedPoints;
      await customerService.updateCustomerSpending(payload.customerId, totalAmount, netPointsDiff);
    }

    setOrders([...nextOrders, newOrder]);

    return { order: newOrder, receiptPrintHtml: buildReceiptHtml(newOrder) };
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

    return orders.filter((o) => {
      if (params.customerId && o.customerId !== params.customerId) return false;
      if (params.orderNumber && !o.orderNumber.toLowerCase().includes(params.orderNumber.toLowerCase())) return false;
      if (params.productId && !o.items.some((i) => i.productId === params.productId)) return false;
      if (params.status && params.status !== 'all' && o.status !== params.status) return false;
      if (params.startDate && o.createdAt < params.startDate) return false;
      if (params.endDate && o.createdAt > `${params.endDate}T23:59:59.999Z`) return false;
      if (params.keyword) {
        const kw = params.keyword.toLowerCase().trim();
        const matchNumber = o.orderNumber.toLowerCase().includes(kw);
        const matchCustomer = (o.customerName && o.customerName.toLowerCase().includes(kw)) ||
                              (o.customerPhone && o.customerPhone.includes(kw));
        const matchProduct = o.items.some((i) => i.name.toLowerCase().includes(kw) || i.sku.toLowerCase().includes(kw));
        const matchInvoice = o.invoice?.taxId?.includes(kw) || o.invoice?.carrierCode?.includes(kw);
        if (!matchNumber && !matchCustomer && !matchProduct && !matchInvoice) return false;
      }
      return true;
    });
  }

  async getOrderById(orderId: string): Promise<CheckoutOrder | null> {
    await simulateDelay();
    return getOrders().find((o) => o.id === orderId) ?? null;
  }
}
