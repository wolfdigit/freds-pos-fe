import { useState } from 'react';
import { checkoutService } from '@/services';
import { useCartStore } from '@/store/cartStore';
import { useToastStore } from '@/components/feedback/toastStore';
import { BusinessError } from '@/utils/errors';
import type { CheckoutReceipt, CreateOrderPayload, InvoiceInfo, PaymentTender } from '@/types/checkout';

export function useCheckoutWorkflow() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<CheckoutReceipt | null>(null);
  const { items, attachedCustomer, shippingFee, usedPoints, orderNote, clearCart } = useCartStore();
  const showToast = useToastStore((s) => s.showToast);

  const submitCheckout = async (payments: PaymentTender[], invoice: InvoiceInfo) => {
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
      const payload: CreateOrderPayload = {
        customerId: attachedCustomer?.id,
        usedPoints: usedPoints > 0 ? usedPoints : undefined,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          isManualPrice: i.isManualPrice,
          priceDiffReason: i.priceChangeReason,
          preOrderId: i.preOrderId,
          preOrderItemId: i.preOrderItemId,
          originalOrderId: (i as any).originalOrderId,
          originalOrderItemId: (i as any).originalOrderItemId,
          restock: (i as any).restock ?? true,
          returnReason: (i as any).returnReason,
        })),
        shippingFee,
        payments,
        invoice,
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
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, receipt, setReceipt, submitCheckout };
}
