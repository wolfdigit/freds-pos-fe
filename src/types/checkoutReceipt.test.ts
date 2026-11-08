import { describe, expect, it } from 'vitest';
import type { CheckoutOrder, CheckoutReceipt } from './checkout';

describe('checkout receipt contract', () => {
  it('accepts a receipt that contains only the order', () => {
    const order = { orderNumber: 'SO-1', totalAmount: 1200 } as CheckoutOrder;
    const firstResponse: CheckoutReceipt = { order };
    const replayResponse: CheckoutReceipt = { order: firstResponse.order };

    expect(replayResponse.order.orderNumber).toBe('SO-1');
    expect(replayResponse.order.totalAmount).toBe(1200);
    expect(Object.keys(firstResponse)).toEqual(['order']);
  });
});
