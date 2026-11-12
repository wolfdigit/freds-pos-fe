import { useRef, useState } from 'react';
import { checkoutService } from '@/services';
import { useCartStore } from '@/store/cartStore';
import { useSessionStore } from '@/store/sessionStore';
import { useToastStore } from '@/components/feedback/toastStore';
import { BusinessError } from '@/utils/errors';
import type { CheckoutReceipt, CreateOrderPayload, PaymentTender } from '@/types/checkout';

export function useCheckoutWorkflow() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inFlight = useRef(false);
  const [receipt, setReceipt] = useState<CheckoutReceipt | null>(null);
  const { items, attachedCustomer, shippingFee, orderNote, clearCart } = useCartStore();
  const showToast = useToastStore((s) => s.showToast);

  const submitCheckout = async (payments: PaymentTender[]) => {
    // 檢查退貨數量限制
    const overReturnItem = items.find(
      (i) => i.quantity < 0 && i.maxReturnableQty !== undefined && Math.abs(i.quantity) > i.maxReturnableQty
    );
    if (overReturnItem) {
      showToast(
        `「${overReturnItem.name}」退貨數量超出原單可退上限 (${overReturnItem.maxReturnableQty}件)，請調整後再送出`,
        'error'
      );
      return null;
    }
    if (!useSessionStore.getState().storeName.trim()) {
      showToast('請先在上方選擇登入門市，才能結帳或辦理退貨。', 'warning');
      return null;
    }

    if (inFlight.current) return null;
    inFlight.current = true;
    setIsSubmitting(true);
    try {
      // 門市與收銀員由後端 session 決定。不要在 body 帶 branchId。
      // 庫存仍走既有的門市現貨檢查，換登入門市不會改扣其他庫存據點。
      const payload: CreateOrderPayload = {
        customerId: attachedCustomer?.id,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          isManualPrice: i.isManualPrice,
          priceDiffReason: i.priceChangeReason,
          originalOrderId: (i as any).originalOrderId,
          originalOrderItemId: (i as any).originalOrderItemId,
          restock: (i as any).restock ?? true,
          returnReason: (i as any).returnReason,
        })),
        shippingFee,
        payments,
        note: orderNote,
      };

      const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined;
      const result = await checkoutService.createCheckoutOrder(payload, idempotencyKey);
      setReceipt(result);
      clearCart();
      showToast(`結帳完成！單號 ${result.order.orderNumber}`, 'success');
      return result;
    } catch (err) {
      if (err instanceof BusinessError) {
        showToast(err.message, 'error');
      } else {
        showToast('結帳失敗，請稍後再試', 'error');
      }
      return null;
    } finally {
      inFlight.current = false;
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, receipt, setReceipt, submitCheckout };
}
