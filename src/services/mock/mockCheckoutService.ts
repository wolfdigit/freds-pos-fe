import type { ICheckoutService } from '@/services/interfaces/ICheckoutService';
import type { CheckoutOrder, CreateOrderPayload, CheckoutReceipt } from '@/types/checkout';
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
  async createCheckoutOrder(payload: CreateOrderPayload): Promise<CheckoutReceipt> {
    await simulateDelay();

    const products = getProducts();
    const preOrders = getPreOrders();
    const orders = getOrders();

    // --- 1. 驗證階段：任一條件不滿足就拋出錯誤，尚未寫入任何資料 ---
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of payload.items) {
      const product = productMap.get(item.productId);
      if (!product) throw new BusinessError('PRODUCT_NOT_FOUND', `找不到商品: ${item.name}`);

      // 現貨不足不拋出致命阻擋錯誤，允許門市彈性負庫存或後續調撥出單
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
      }
    }

    const itemsSubtotal = safeAdd(...payload.items.map((i) => i.subtotal));
    const discountAmount = safeAdd(
      ...payload.items.map((i) => (i.originalPrice - i.unitPrice) * i.quantity)
    );
    const totalAmount = safeAdd(itemsSubtotal, payload.shippingFee);
    const paymentsTotal = safeAdd(...payload.payments.map((p) => p.amount));

    if (paymentsTotal < totalAmount) {
      throw new BusinessError('PAYMENT_INSUFFICIENT', '支付總額不足');
    }

    // --- 2. 應用階段：驗證全數通過後，一次性寫入所有異動 ---
    let nextProducts = [...products];
    for (const item of payload.items) {
      nextProducts = nextProducts.map((p): Product => {
        if (p.id !== item.productId) return p;
        const next = { ...p, stocks: p.stocks.map((s) => ({ ...s })) };
        const storeStock = next.stocks.find((s) => s.location === STORE_LOCATION);
        if (storeStock) storeStock.quantity -= item.quantity;
        next.totalStock = next.stocks.reduce((sum, s) => sum + s.quantity, 0);
        return next;
      });
    }
    setProducts(nextProducts);

    let nextPreOrders = [...preOrders];
    for (const item of payload.items) {
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

    const earnedPoints = Math.max(0, Math.floor(totalAmount / 100));
    const order: CheckoutOrder = {
      id: `so-${Date.now()}`,
      orderNumber: buildOrderNumber(orders.length),
      cashierId: 'staff-001',
      cashierName: '店長 Fred',
      customerId: payload.customerId,
      items: payload.items,
      itemsSubtotal,
      discountAmount,
      shippingFee: payload.shippingFee,
      totalAmount,
      payments: payload.payments,
      invoice: payload.invoice,
      earnedPoints,
      usedPoints: 0,
      note: payload.note,
      createdAt: nowIso(),
    };

    if (payload.customerId) {
      const customer = await customerService.getCustomerById(payload.customerId);
      if (customer) {
        order.customerName = customer.name;
        order.customerPhone = customer.phone;
        await customerService.updateCustomerSpending(payload.customerId, totalAmount, earnedPoints);
      }
    }

    setOrders([...orders, order]);

    return { order, receiptPrintHtml: buildReceiptHtml(order) };
  }

  async getOrderHistory(customerId?: string): Promise<CheckoutOrder[]> {
    await simulateDelay();
    const orders = getOrders();
    if (!customerId) return orders;
    return orders.filter((o) => o.customerId === customerId);
  }

  async getOrderById(orderId: string): Promise<CheckoutOrder | null> {
    await simulateDelay();
    return getOrders().find((o) => o.id === orderId) ?? null;
  }

  async refundOrder(orderId: string, _reason: string): Promise<boolean> {
    await simulateDelay();
    const orders = getOrders();
    const exists = orders.some((o) => o.id === orderId);
    return exists;
  }
}
