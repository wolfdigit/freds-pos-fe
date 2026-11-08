import { useState } from 'react';
import { checkoutService } from '@/services';
import { useCartStore } from '@/store/cartStore';
import { useToastStore } from '@/components/feedback/toastStore';
import { BusinessError } from '@/utils/errors';
import { buildCheckoutPayload } from '@/features/checkout/buildCheckoutPayload';
import type { CheckoutReceipt, PaymentTender } from '@/types/checkout';

export function useCheckoutWorkflow() {
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    setIsSubmitting(true);
    try {
      // 門市、收銀員與扣庫存地點都由後端依目前登入門市決定。不要在 body 帶庫存地點。
      // restock 不是 false 的退貨，入庫地點也是這一筆請求當下的登入門市對應，不是原銷售單。
      const payload = buildCheckoutPayload({
        customer: attachedCustomer,
        items,
        shippingFee,
        payments,
        note: orderNote,
      });

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
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, receipt, setReceipt, submitCheckout };
}
