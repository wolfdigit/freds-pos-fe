import { describe, expect, it } from 'vitest';
import { priceAdjustmentOf } from './priceAdjustment';

describe('priceAdjustmentOf', () => {
  it('signs a markdown negative and a markup positive', () => {
    expect(priceAdjustmentOf([{ originalPrice: 350, unitPrice: 280, quantity: 1 }])).toBe(-70);
    expect(priceAdjustmentOf([{ originalPrice: 350, unitPrice: 400, quantity: 2 }])).toBe(100);
    expect(
      priceAdjustmentOf([
        { originalPrice: 350, unitPrice: 280, quantity: 1 },
        { originalPrice: 350, unitPrice: 400, quantity: 1 },
      ])
    ).toBe(-20);
  });

  it('keeps 商品原價 + 價格調整 equal to the refund on return lines', () => {
    // 退貨原價 500，改成只退 400：退款 -400 = 原價 -500 + 調整 +100
    const lines = [{ originalPrice: 500, unitPrice: 400, quantity: -1 }];
    const actual = 400 * -1;
    const adjustment = priceAdjustmentOf(lines);
    expect(adjustment).toBe(100);
    expect(actual - adjustment).toBe(-500);
  });

  it('treats lines without an original price as unadjusted', () => {
    expect(priceAdjustmentOf([{ originalPrice: undefined, unitPrice: 280, quantity: 1 }])).toBe(0);
    expect(priceAdjustmentOf([{ originalPrice: 280, unitPrice: 280, quantity: 3 }])).toBe(0);
  });
});
