import { safeAdd } from './currency';

interface PricedLine {
  originalPrice?: number | null;
  unitPrice: number;
  quantity: number;
}

/**
 * 價格調整合計 = Σ（成交單價 − 原價）× 數量。減價為負、加價為正，與收據「價格調整」列相同。
 * 退貨列數量為負，所以退貨改低退款金額會得到正數。
 * 沒有原價的列視為沒調整，不補造原價。
 * 「商品原價」= 成交小計 − 價格調整，兩列相加一定等於成交小計。
 */
export function priceAdjustmentOf(lines: readonly PricedLine[]): number {
  return safeAdd(
    ...lines.map((line) =>
      typeof line.originalPrice === 'number' && Number.isFinite(line.originalPrice)
        ? (line.unitPrice - line.originalPrice) * line.quantity
        : 0
    )
  );
}
