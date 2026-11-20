import { describe, expect, it } from 'vitest';
import { orderAmountBreakdown } from './orderBreakdown';

describe('orderAmountBreakdown', () => {
  it('keeps points lines out of 價格調整 and sums back to the charged subtotal', () => {
    const lines = [
      { originalPrice: 500, unitPrice: 500, quantity: 2 },
      { originalPrice: 500, unitPrice: 450, quantity: 1 },
      { originalPrice: 500, unitPrice: 90, quantity: 1, pointsDiscountApplied: true },
    ];
    const result = orderAmountBreakdown(lines);
    expect(result).toEqual({ originalTotal: 2000, priceAdjustment: -50, pointsDiscount: 410 });
    expect(result.originalTotal + result.priceAdjustment - result.pointsDiscount).toBe(1000 + 450 + 90);
  });

  it('counts the real gap, not 360, when the price floors at 0', () => {
    expect(orderAmountBreakdown([{ originalPrice: 80, unitPrice: 0, quantity: 1, pointsDiscountApplied: true }])).toEqual({
      originalTotal: 80,
      priceAdjustment: 0,
      pointsDiscount: 80,
    });
  });

  it('makes 點數折抵 negative on a return of a points line', () => {
    const result = orderAmountBreakdown([{ originalPrice: 500, unitPrice: 140, quantity: -1, pointsDiscountApplied: true }]);
    expect(result).toEqual({ originalTotal: -500, priceAdjustment: 0, pointsDiscount: -360 });
  });

  it('treats lines without an original price as unadjusted', () => {
    expect(orderAmountBreakdown([{ originalPrice: undefined, unitPrice: 280, quantity: 1 }])).toEqual({
      originalTotal: 280,
      priceAdjustment: 0,
      pointsDiscount: 0,
    });
  });

  it('signs a markdown negative and a markup positive without involving points', () => {
    const lines = [
      { originalPrice: 350, unitPrice: 280, quantity: 1 },
      { originalPrice: 350, unitPrice: 400, quantity: 1 },
    ];
    const result = orderAmountBreakdown(lines);
    expect(result).toEqual({ originalTotal: 700, priceAdjustment: -20, pointsDiscount: 0 });
    expect(result.originalTotal + result.priceAdjustment - result.pointsDiscount).toBe(680);
  });
});
