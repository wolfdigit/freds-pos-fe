import { Fragment } from 'react';
import type { CheckoutOrder } from '@/types/checkout';
import { formatCurrency } from '@/utils/currency';
import { formatDateTime } from '@/utils/date';
import { RECEIPT_PRINT_SHEET_ID } from '../printReceipt';
import '../receipt-print.css';

interface ReceiptMoneyRow {
  key: string;
  label: string;
  /** 括號單價，靠右對齊到共用的乘號欄。 */
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
  itemsSubtotalLabel: string;
  shippingLabel: string | null;
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

function itemTitle(item: CheckoutOrder['items'][number]): string {
  return item.quantity < 0 ? `退貨 ${item.name}` : item.name;
}

function parenthesized(unit: string): string {
  return `（${unit}）`;
}

function moneyRows(item: CheckoutOrder['items'][number]): ReceiptMoneyRow[] {
  const delta = unitPriceDelta(item);
  const title = itemTitle(item);
  if (delta === null) {
    return [
      {
        key: 'charged',
        label: title,
        unitLabel: parenthesized(formatCurrency(item.unitPrice)),
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
      unitLabel: parenthesized(formatCurrency(item.originalPrice)),
      quantity: item.quantity,
      amountLabel: formatCurrency(item.originalPrice * item.quantity),
      indent: false,
    },
    {
      key: 'delta',
      label: '折讓改價',
      unitLabel: parenthesized(formatSignedCurrency(delta)),
      quantity: item.quantity,
      amountLabel: formatSignedCurrency(delta * item.quantity),
      indent: true,
    },
  ];
}

function formatSignedCurrency(amount: number): string {
  const label = formatCurrency(Math.abs(amount));
  if (amount > 0) return `+${label}`;
  if (amount < 0) return `-${label}`;
  return label;
}

function buildReceiptModel(order: CheckoutOrder): ReceiptModel {
  const items = order.items ?? [];
  const payments = order.payments ?? [];

  return {
    orderNumber: order.orderNumber,
    createdAtLabel: formatDateTime(order.createdAt),
    lines: items.map((item, index) => ({
      key: `${item.productId}-${index}`,
      rows: moneyRows(item),
    })),
    itemsSubtotalLabel: formatCurrency(order.itemsSubtotal),
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
    <div className={variant === 'print' ? 'receipt-grid' : 'grid grid-cols-[minmax(0,1fr)_max-content_max-content_max-content_max-content] items-start font-mono text-xs'}>
      {lines.map((line, lineIndex) =>
        line.rows.map((row, rowIndex) => (
          <Fragment key={`${line.key}-${row.key}`}>
            {lineIndex > 0 && rowIndex === 0 ? (
              <div className={variant === 'print' ? 'receipt-item-rule' : 'col-span-5 mt-1.5 border-t border-dashed border-zinc-700 pt-1.5'} />
            ) : null}
            <span
              className={
                variant === 'print'
                  ? row.indent
                    ? 'receipt-cell-name receipt-cell-child'
                    : 'receipt-cell-name'
                  : `min-w-0 whitespace-pre-wrap break-words pr-2 [overflow-wrap:anywhere] ${
                      row.indent ? 'pl-4 text-zinc-400' : 'font-medium text-zinc-200'
                    }`
              }
            >
              {row.label}
            </span>
            <span className={variant === 'print' ? 'receipt-cell-unit' : 'whitespace-nowrap text-right text-zinc-400'}>
              {row.unitLabel}
            </span>
            <span className={variant === 'print' ? 'receipt-cell-times' : 'whitespace-nowrap text-center text-zinc-300'}>×</span>
            <span className={variant === 'print' ? 'receipt-cell-qty' : 'whitespace-nowrap pr-3 text-left font-bold text-zinc-300'}>
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

function ScreenReceipt({ model }: { model: ReceiptModel }) {
  return (
    <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-sm">
      <div className="text-center">
        <p className="text-lg font-bold text-cyan-300">FRED'S POS</p>
        <p className="text-sm font-semibold text-zinc-200">結帳明細</p>
        <p className="text-xs text-zinc-500">{model.orderNumber}</p>
        <p className="text-xs text-zinc-500">{model.createdAtLabel}</p>
      </div>
      <div className="border-t border-dashed border-zinc-700 pt-2 text-zinc-300">
        <ReceiptLineGrid lines={model.lines} variant="screen" />
      </div>
      <div className="space-y-1 border-t border-dashed border-zinc-700 pt-2">
        <div className="flex justify-between text-zinc-400">
          <span>商品小計</span>
          <span>{model.itemsSubtotalLabel}</span>
        </div>
        {model.shippingLabel ? (
          <div className="flex justify-between text-cyan-300">
            <span>運費</span>
            <span>{model.shippingLabel}</span>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-zinc-800 pt-1 text-base font-bold text-cyan-300">
          <span>{model.totalCaption}</span>
          <span>{model.totalAmountLabel}</span>
        </div>
      </div>
      <div className="space-y-1 border-t border-dashed border-zinc-700 pt-2 text-zinc-400">
        {model.payments.map((payment) => (
          <div key={payment.key} className="flex justify-between">
            <span>支付方式：{payment.name}</span>
            <span className="font-bold text-zinc-200">{payment.amountLabel}</span>
          </div>
        ))}
      </div>
      <p className="border-t border-dashed border-zinc-700 pt-2 text-center text-xs text-zinc-400">
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
          <span>商品小計</span>
          <span>{model.itemsSubtotalLabel}</span>
        </div>
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
