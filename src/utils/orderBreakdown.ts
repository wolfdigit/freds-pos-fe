import { safeAdd } from './currency';

interface BreakdownLine {
  originalPrice?: number | null;
  unitPrice: number;
  quantity: number;
  pointsDiscountApplied?: boolean;
}

export interface OrderAmountBreakdown {
  /** 商品原價 = Σ 原價 × 數量（退貨列為負）。 */
  originalTotal: number;
  /** 價格調整 = 沒有點數旗標的列 Σ（成交單價 − 原價）× 數量。減價為負、加價為正。 */
  priceAdjustment: number;
  /** 點數折抵 = 有點數旗標的列 Σ（原價 − 成交單價）× 數量，整個差額都算點數（與後端相同）。退貨為負。 */
  pointsDiscount: number;
  /** 成交小計 = Σ 成交單價 × 數量 = originalTotal + priceAdjustment − pointsDiscount。 */
  finalTotal: number;
}

function lineDifference(line: BreakdownLine): number {
  // 沒有原價的列視為沒調整，不補造原價。
  if (typeof line.originalPrice !== 'number' || !Number.isFinite(line.originalPrice)) return 0;
  return (line.unitPrice - line.originalPrice) * line.quantity;
}

/**
 * 訂單金額拆解：商品原價 + 價格調整 − 點數折抵 = 成交小計（itemsSubtotal）。
 * 點數列的差額只算在點數折抵，不算在價格調整（折讓）。
 */
export function orderAmountBreakdown(lines: readonly BreakdownLine[]): OrderAmountBreakdown {
  const charged = safeAdd(...lines.map((line) => line.unitPrice * line.quantity));
  const priceAdjustment = safeAdd(...lines.filter((line) => !line.pointsDiscountApplied).map(lineDifference));
  const pointsDiscount = -safeAdd(...lines.filter((line) => line.pointsDiscountApplied).map(lineDifference)) || 0;
  return {
    originalTotal: safeAdd(charged, -priceAdjustment, pointsDiscount),
    priceAdjustment,
    pointsDiscount,
    finalTotal: charged,
  };
}
