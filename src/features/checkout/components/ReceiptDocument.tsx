import { Fragment } from 'react';
import type { CheckoutOrder } from '@/types/checkout';
import { formatCurrency, formatSignedCurrency } from '@/utils/currency';
import { orderAmountBreakdown } from '@/utils/orderBreakdown';
import { formatReceiptDateTime } from '@/utils/date';
import { RECEIPT_PRINT_SHEET_ID } from '../printReceipt';
import '../receipt-print.css';

interface ReceiptMoneyRow {
  key: string;
  label: string;
  /** 單價，靠右對齊到共用的乘號欄。 */
  unitLabel: string;
  quantity: number;
  amountLabel: string;
  indent: boolean;
}

interface ReceiptLine {
  key: string;
  rows: ReceiptMoneyRow[];
}

interface ReceiptPaymentLine {
  key: string;
  name: string;
  amountLabel: string;
}

interface ReceiptModel {
  orderNumber: string;
  createdAtLabel: string;
  lines: ReceiptLine[];
  /** 商品原價合計。 */
  originalTotalLabel: string;
  /** 沒勾點數的列的價格調整合計（帶正負號），0 時不顯示。 */
  priceAdjustmentLabel: string | null;
  /** 點數折抵合計，0 時不顯示。 */
  pointsDiscountLabel: string | null;
  shippingLabel: string | null;
  /** 商品數量總計，例如「3 件」、「退貨 1 件」、「3 件／退貨 1 件」。 */
  quantityLabel: string;
  totalCaption: string;
  totalAmountLabel: string;
  payments: ReceiptPaymentLine[];
}

/**
 * 只用這一列訂單自己存下的 originalPrice。不回查目前商品牌價，也不補造缺少的原價。
 * 單價差額是成交單價減原價。列上的金額是該單價乘這列的數量，兩列相加等於成交小計。
 */
function unitPriceDelta(item: CheckoutOrder['items'][number]): number | null {
  if (typeof item.originalPrice !== 'number' || !Number.isFinite(item.originalPrice)) return null;
  if (!Number.isFinite(item.unitPrice) || item.originalPrice === item.unitPrice) return null;
  return item.unitPrice - item.originalPrice;
}

function itemTitle(item: CheckoutOrder['items'][number], hasDelta: boolean): string {
  const name = item.quantity < 0 ? `退貨 ${item.name}` : item.name;
  // 點數列有差額時，下面那列就叫「點數折抵」；沒有差額時才在品名標示。
  return item.pointsDiscountApplied && !hasDelta ? `${name}（點數折抵）` : name;
}

function moneyRows(item: CheckoutOrder['items'][number]): ReceiptMoneyRow[] {
  const delta = unitPriceDelta(item);
  const title = itemTitle(item, delta !== null);
  if (delta === null) {
    return [
      {
        key: 'charged',
        label: title,
        unitLabel: formatCurrency(item.unitPrice),
        quantity: item.quantity,
        amountLabel: formatCurrency(item.subtotal),
        indent: false,
      },
    ];
  }

  return [
    {
      key: 'original',
      label: title,
      unitLabel: formatCurrency(item.originalPrice),
      quantity: item.quantity,
      amountLabel: formatCurrency(item.originalPrice * item.quantity),
      indent: false,
    },
    {
      key: 'delta',
      label: item.pointsDiscountApplied ? '點數折抵' : '價格調整',
      unitLabel: formatSignedCurrency(delta),
      quantity: item.quantity,
      amountLabel: formatSignedCurrency(delta * item.quantity),
      indent: true,
    },
  ];
}


/** 銷售件數與退貨件數分開算，不互相抵銷，讓店員一眼看出各有幾件。 */
export function receiptQuantityLabel(items: CheckoutOrder['items']): string {
  const sold = items.reduce((sum, item) => (item.quantity > 0 ? sum + item.quantity : sum), 0);
  const returned = items.reduce((sum, item) => (item.quantity < 0 ? sum - item.quantity : sum), 0);
  if (returned === 0) return `${sold} 件`;
  if (sold === 0) return `退貨 ${returned} 件`;
  return `${sold} 件／退貨 ${returned} 件`;
}

function buildReceiptModel(order: CheckoutOrder): ReceiptModel {
  const items = order.items ?? [];
  const payments = order.payments ?? [];
  // 商品原價 + 價格調整 − 點數折抵 = 商品成交小計；點數列的差額只算點數折抵。
  const breakdown = orderAmountBreakdown(items);

  return {
    orderNumber: order.orderNumber,
    createdAtLabel: formatReceiptDateTime(order.createdAt),
    lines: items.map((item, index) => ({
      key: `${item.productId}-${index}`,
      rows: moneyRows(item),
    })),
    originalTotalLabel: formatCurrency(breakdown.originalTotal),
    priceAdjustmentLabel: breakdown.priceAdjustment !== 0 ? formatSignedCurrency(breakdown.priceAdjustment) : null,
    pointsDiscountLabel: breakdown.pointsDiscount !== 0 ? formatSignedCurrency(-breakdown.pointsDiscount) : null,
    quantityLabel: receiptQuantityLabel(items),
    shippingLabel: order.shippingFee > 0 ? `+${formatCurrency(order.shippingFee)}` : null,
    totalCaption: order.totalAmount < 0 ? '退款總額' : '結帳總額',
    totalAmountLabel: formatCurrency(order.totalAmount),
    payments: payments.map((payment, index) => ({
      key: `${payment.type}-${index}`,
      name: payment.name,
      amountLabel: formatCurrency(payment.amount),
    })),
  };
}

interface ReceiptDocumentProps {
  order: CheckoutOrder;
  variant: 'screen' | 'print';
}

export function ReceiptDocument({ order, variant }: ReceiptDocumentProps) {
  const model = buildReceiptModel(order);
  if (variant === 'print') return <PrintReceipt model={model} />;
  return <ScreenReceipt model={model} />;
}

function ReceiptLineGrid({ lines, variant }: { lines: ReceiptLine[]; variant: 'screen' | 'print' }) {
  return (
    <div className={variant === 'print' ? 'receipt-grid' : 'grid grid-cols-[minmax(0,1fr)_max-content_max-content_max-content_max-content] items-start gap-y-1 font-mono text-base leading-relaxed'}>
      {lines.map((line, lineIndex) =>
        line.rows.map((row, rowIndex) => (
          <Fragment key={`${line.key}-${row.key}`}>
            {lineIndex > 0 && rowIndex === 0 ? (
              <div className={variant === 'print' ? 'receipt-item-rule' : 'col-span-5 mt-2 border-t border-dashed border-zinc-700 pt-2'} />
            ) : null}
            <span
              className={
                variant === 'print'
                  ? row.indent
                    ? 'receipt-cell-name receipt-cell-child'
                    : 'receipt-cell-name'
                  : `min-w-0 whitespace-pre-wrap break-words pr-2 [overflow-wrap:anywhere] ${
                      row.indent ? 'pl-6 text-zinc-300' : 'font-semibold text-zinc-100'
                    }`
              }
            >
              {row.label}
            </span>
            <span className={variant === 'print' ? 'receipt-cell-unit' : 'whitespace-nowrap text-right text-zinc-300'}>
              {row.unitLabel}
            </span>
            <span className={variant === 'print' ? 'receipt-cell-times' : 'whitespace-nowrap px-1 text-center text-zinc-300'}>×</span>
            <span className={variant === 'print' ? 'receipt-cell-qty' : 'whitespace-nowrap pr-4 text-left font-bold text-zinc-200'}>
              {row.quantity}
            </span>
            <span className={variant === 'print' ? 'receipt-cell-amt' : 'whitespace-nowrap text-right font-bold text-cyan-300'}>
              {row.amountLabel}
            </span>
          </Fragment>
        ))
      )}
    </div>
  );
}

// 螢幕版字級放大給視力較差的使用者看（內文 16px 以上、總額更大）。列印版另用 receipt-print.css，不受影響。
function ScreenReceipt({ model }: { model: ReceiptModel }) {
  return (
    <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-950 p-5 font-mono text-base leading-relaxed">
      <div className="text-center">
        <p className="text-2xl font-bold text-cyan-300">FRED'S POS</p>
        <p className="text-lg font-semibold text-zinc-100">結帳明細</p>
        <p className="text-base text-zinc-300">{model.orderNumber}</p>
        <p className="text-base text-zinc-300">{model.createdAtLabel}</p>
      </div>
      <div className="border-t border-dashed border-zinc-700 pt-3 text-zinc-200">
        <ReceiptLineGrid lines={model.lines} variant="screen" />
      </div>
      <div className="space-y-1.5 border-t border-dashed border-zinc-700 pt-3 text-lg">
        <div className="flex justify-between text-zinc-200">
          <span>商品數量總計</span>
          <span className="font-bold">{model.quantityLabel}</span>
        </div>
        <div className="flex justify-between text-zinc-300">
          <span>商品原價</span>
          <span>{model.originalTotalLabel}</span>
        </div>
        {model.priceAdjustmentLabel ? (
          <div className="flex justify-between text-zinc-300">
            <span>價格調整</span>
            <span>{model.priceAdjustmentLabel}</span>
          </div>
        ) : null}
        {model.pointsDiscountLabel ? (
          <div className="flex justify-between text-violet-300">
            <span>點數折抵</span>
            <span>{model.pointsDiscountLabel}</span>
          </div>
        ) : null}
        {model.shippingLabel ? (
          <div className="flex justify-between text-cyan-300">
            <span>運費</span>
            <span>{model.shippingLabel}</span>
          </div>
        ) : null}
        <div className="flex items-baseline justify-between border-t border-zinc-800 pt-2 text-2xl font-bold text-cyan-300">
          <span>{model.totalCaption}</span>
          <span>{model.totalAmountLabel}</span>
        </div>
      </div>
      <div className="space-y-1.5 border-t border-dashed border-zinc-700 pt-3 text-lg text-zinc-300">
        {model.payments.map((payment) => (
          <div key={payment.key} className="flex justify-between">
            <span>支付方式：{payment.name}</span>
            <span className="font-bold text-zinc-100">{payment.amountLabel}</span>
          </div>
        ))}
      </div>
      <p className="border-t border-dashed border-zinc-700 pt-3 text-center text-base text-zinc-300">
        本單為結帳明細，非電子發票或統一發票
      </p>
    </div>
  );
}

function PrintReceipt({ model }: { model: ReceiptModel }) {
  return (
    <article id={RECEIPT_PRINT_SHEET_ID} className="receipt-print-sheet" lang="zh-Hant">
      <header className="receipt-head">
        <p className="receipt-brand">FRED'S POS</p>
        <p className="receipt-doc-type">結帳明細</p>
        <p className="receipt-meta">{model.orderNumber}</p>
        <p className="receipt-meta">{model.createdAtLabel}</p>
      </header>
      <div className="receipt-rule" />
      <ReceiptLineGrid lines={model.lines} variant="print" />
      <div className="receipt-rule" />
      <div className="receipt-summary">
        <div className="receipt-row">
          <span>商品數量總計</span>
          <span>{model.quantityLabel}</span>
        </div>
        <div className="receipt-row">
          <span>商品原價</span>
          <span>{model.originalTotalLabel}</span>
        </div>
        {model.priceAdjustmentLabel ? (
          <div className="receipt-row">
            <span>價格調整</span>
            <span>{model.priceAdjustmentLabel}</span>
          </div>
        ) : null}
        {model.pointsDiscountLabel ? (
          <div className="receipt-row">
            <span>點數折抵</span>
            <span>{model.pointsDiscountLabel}</span>
          </div>
        ) : null}
        {model.shippingLabel ? (
          <div className="receipt-row">
            <span>運費</span>
            <span>{model.shippingLabel}</span>
          </div>
        ) : null}
        <div className="receipt-row receipt-grand">
          <span>{model.totalCaption}</span>
          <span>{model.totalAmountLabel}</span>
        </div>
      </div>
      <div className="receipt-rule" />
      <div className="receipt-payments">
        {model.payments.map((payment) => (
          <div key={payment.key} className="receipt-row">
            <span>支付方式：{payment.name}</span>
            <span className="receipt-amount">{payment.amountLabel}</span>
          </div>
        ))}
      </div>
      <p className="receipt-disclaimer">本單為結帳明細，非電子發票或統一發票</p>
    </article>
  );
}
