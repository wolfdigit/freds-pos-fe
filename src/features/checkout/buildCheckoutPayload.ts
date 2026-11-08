import type { CartItem } from '@/store/cartStore';
import type { CreateOrderPayload, PaymentTender } from '@/types/checkout';
import type { Customer } from '@/types/customer';

/** Checkout never chooses a stock location. The server uses the current login store. */
export function buildCheckoutPayload(input: {
  customer?: Customer | null;
  items: CartItem[];
  shippingFee: number;
  payments: PaymentTender[];
  note?: string;
}): CreateOrderPayload {
  return {
    customerId: input.customer?.id,
    items: input.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      isManualPrice: item.isManualPrice,
      priceDiffReason: item.priceChangeReason,
      originalOrderId: item.originalOrderId,
      originalOrderItemId: item.originalOrderItemId,
      restock: item.restock ?? true,
      returnReason: item.returnReason,
    })),
    shippingFee: input.shippingFee,
    payments: input.payments,
    note: input.note,
  };
}
