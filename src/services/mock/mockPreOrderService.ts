import type { IPreOrderService } from '@/services/interfaces/IPreOrderService';
import type { PreOrder, PreOrderItem, PreOrderStatus } from '@/types/preorder';
import { getPreOrders, setPreOrders, simulateDelay } from './storageHelper';
import { nowIso } from '@/utils/date';

/**
 * 依 04 §1.2 規則推導預購單狀態
 */
export function derivePreOrderStatus(items: PreOrderItem[]): PreOrderStatus {
  const allNotArrived = items.every((i) => i.qtyArrived === 0);
  const allDelivered = items.every((i) => i.qtyDelivered === i.qtyOrdered);
  const someDelivered = items.some((i) => i.qtyDelivered > 0);

  if (allNotArrived) return 'pending';
  if (allDelivered) return 'completed';
  if (someDelivered) return 'partially_completed';
  return 'partially_arrived';
}

export class MockPreOrderService implements IPreOrderService {
  async getPendingPreOrders(query: string): Promise<PreOrder[]> {
    await simulateDelay();
    const preOrders = getPreOrders();
    const q = query.trim();
    if (!q) return [];

    return preOrders.filter(
      (po) =>
        po.status !== 'completed' &&
        po.status !== 'cancelled' &&
        (po.customerPhone.includes(q) ||
          po.customerName.includes(q) ||
          po.orderNumber.toLowerCase().includes(q.toLowerCase()))
    );
  }

  async getPreOrdersByCustomerId(customerId: string): Promise<PreOrder[]> {
    await simulateDelay();
    const preOrders = getPreOrders();
    return preOrders.filter((po) => po.customerId === customerId);
  }

  async fulfillPreOrderItems(
    preOrderId: string,
    fulfilledItems: { preOrderItemId: string; qty: number }[]
  ): Promise<boolean> {
    await simulateDelay();
    const preOrders = getPreOrders();
    const idx = preOrders.findIndex((po) => po.id === preOrderId);
    if (idx === -1) return false;

    const preOrder = { ...preOrders[idx], items: preOrders[idx].items.map((i) => ({ ...i })) };
    for (const fulfilled of fulfilledItems) {
      const item = preOrder.items.find((i) => i.id === fulfilled.preOrderItemId);
      if (item) {
        item.qtyDelivered += fulfilled.qty;
      }
    }
    preOrder.status = derivePreOrderStatus(preOrder.items);
    preOrder.updatedAt = nowIso();

    const nextPreOrders = [...preOrders];
    nextPreOrders[idx] = preOrder;
    setPreOrders(nextPreOrders);
    return true;
  }

  async createPreOrder(preOrder: Partial<PreOrder>): Promise<PreOrder> {
    await simulateDelay();
    const preOrders = getPreOrders();
    const items = preOrder.items ?? [];
    const derivedStatus = preOrder.status ?? derivePreOrderStatus(items);
    const newPreOrder: PreOrder = {
      id: `po-${Date.now()}`,
      orderNumber: preOrder.orderNumber || `PO-${Date.now()}`,
      customerId: preOrder.customerId ?? '',
      customerName: preOrder.customerName ?? '',
      customerPhone: preOrder.customerPhone ?? '',
      orderDate: preOrder.orderDate ?? nowIso().split('T')[0],
      expectedArrivalDate: preOrder.expectedArrivalDate,
      status: derivedStatus,
      source: preOrder.source ?? 'in_store',
      items,
      note: preOrder.note,
      operatorName: preOrder.operatorName || '店長 Fred',
      updatedAt: nowIso(),
    };
    setPreOrders([...preOrders, newPreOrder]);
    return newPreOrder;
  }

  async updatePreOrder(id: string, updates: Partial<PreOrder>): Promise<PreOrder | null> {
    await simulateDelay();
    const preOrders = getPreOrders();
    const idx = preOrders.findIndex((po) => po.id === id);
    if (idx === -1) return null;

    const existing = preOrders[idx];
    const items = updates.items ?? existing.items;
    const derivedStatus = updates.status ?? derivePreOrderStatus(items);

    const updatedPreOrder: PreOrder = {
      ...existing,
      ...updates,
      items,
      status: derivedStatus,
      operatorName: updates.operatorName || existing.operatorName || '店長 Fred',
      updatedAt: nowIso(),
    };

    const nextPreOrders = [...preOrders];
    nextPreOrders[idx] = updatedPreOrder;
    setPreOrders(nextPreOrders);
    return updatedPreOrder;
  }

  async markItemsArrived(preOrderId: string, arrivedItems: { productId: string; qty: number }[]): Promise<boolean> {
    await simulateDelay();
    const preOrders = getPreOrders();
    const idx = preOrders.findIndex((po) => po.id === preOrderId);
    if (idx === -1) return false;

    const preOrder = { ...preOrders[idx], items: preOrders[idx].items.map((i) => ({ ...i })) };
    for (const arrived of arrivedItems) {
      const item = preOrder.items.find((i) => i.productId === arrived.productId);
      if (item) {
        item.qtyArrived = Math.min(item.qtyOrdered, item.qtyArrived + arrived.qty);
      }
    }
    preOrder.status = derivePreOrderStatus(preOrder.items);
    preOrder.updatedAt = nowIso();

    const nextPreOrders = [...preOrders];
    nextPreOrders[idx] = preOrder;
    setPreOrders(nextPreOrders);
    return true;
  }
}
