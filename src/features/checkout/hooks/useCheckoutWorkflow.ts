import { useState } from 'react';
import { checkoutService } from '@/services';
import { useCartStore } from '@/store/cartStore';
import { useToastStore } from '@/components/feedback/toastStore';
import { BusinessError } from '@/utils/errors';
import type { CheckoutReceipt, InvoiceInfo, PaymentTender } from '@/types/checkout';
import { safeAdd } from '@/utils/currency';

export function useCheckoutWorkflow() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<CheckoutReceipt | null>(null);
  const { items, attachedCustomer, shippingFee, orderNote, clearCart } = useCartStore();
  const showToast = useToastStore((s) => s.showToast);

  const submitCheckout = async (payments: PaymentTender[], invoice: InvoiceInfo) => {
    setIsSubmitting(true);
    try {
      const payload = {
        customerId: attachedCustomer?.id,
        items: items.map((i) => ({
          productId: i.productId,
          sku: i.sku,
          name: i.name,
          scale: i.scale,
          originalPrice: i.originalPrice,
          unitPrice: i.unitPrice,
          isManualPrice: i.isManualPrice,
          priceDiffReason: i.priceChangeReason,
          quantity: i.quantity,
          subtotal: safeAdd(i.unitPrice * i.quantity),
          preOrderId: i.preOrderId,
          preOrderItemId: i.preOrderItemId,
        })),
        shippingFee,
        payments,
        invoice,
        note: orderNote,
      };

      const result = await checkoutService.createCheckoutOrder(payload);
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
