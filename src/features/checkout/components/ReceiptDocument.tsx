import type { CheckoutOrder } from '@/types/checkout';
import { formatCurrency } from '@/utils/currency';
import { formatDateTime } from '@/utils/date';
import { RECEIPT_PRINT_SHEET_ID } from '../printReceipt';
import '../receipt-print.css';

interface ReceiptLine {
  key: string;
  name: string;
  quantity: number;
  isReturn: boolean;
  unitPriceLabel: string;
  subtotalLabel: string;
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
  discountNote: string | null;
  totalCaption: string;
  totalAmountLabel: string;
  payments: ReceiptPaymentLine[];
}

/**
 * 改價折讓是原牌價與成交單價的差額，結帳時已計入各列 unitPrice / subtotal。
 * 商品小計是這些成交小計的加總，結帳總額 = 商品小計 + 運費。
 * 折讓不再以負項排進這個加總，避免被再扣一次。
 */
function buildDiscountNote(discountAmount: number): string | null {
  if (!discountAmount) return null;
  const amountLabel = formatCurrency(Math.abs(discountAmount));
  const caption = discountAmount > 0 ? '改價折讓' : '改價加價';
  return `${caption} ${amountLabel}，已計入品項單價`;
}

function buildReceiptModel(order: CheckoutOrder): ReceiptModel {
  const items = order.items ?? [];
  const payments = order.payments ?? [];

  return {
    orderNumber: order.orderNumber,
    createdAtLabel: formatDateTime(order.createdAt),
    lines: items.map((item, index) => ({
      key: `${item.productId}-${index}`,
      name: item.name,
      quantity: item.quantity,
      isReturn: item.quantity < 0,
      unitPriceLabel: formatCurrency(item.unitPrice),
      subtotalLabel: formatCurrency(item.subtotal),
    })),
    itemsSubtotalLabel: formatCurrency(order.itemsSubtotal),
    shippingLabel: order.shippingFee > 0 ? `+${formatCurrency(order.shippingFee)}` : null,
    discountNote: buildDiscountNote(order.discountAmount),
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

function ScreenReceipt({ model }: { model: ReceiptModel }) {
  return (
    <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-sm">
      <div className="text-center">
        <p className="text-lg font-bold text-cyan-300">FRED'S POS</p>
        <p className="text-sm font-semibold text-zinc-200">結帳明細</p>
        <p className="text-xs text-zinc-500">{model.orderNumber}</p>
        <p className="text-xs text-zinc-500">{model.createdAtLabel}</p>
      </div>
      <div className="border-t border-dashed border-zinc-700 pt-2 divide-y divide-zinc-800/60">
        {model.lines.map((line) => (
          <div key={line.key} className="flex items-start justify-between gap-3 py-1.5 text-zinc-300">
            <div className="min-w-0 flex-1">
              <p className="whitespace-pre-wrap break-words font-sans text-sm font-medium text-zinc-200 [overflow-wrap:anywhere]">
                {line.isReturn ? <span className="mr-1 font-semibold text-rose-300">退貨</span> : null}
                {line.name}
              </p>
              <p className="font-mono text-xs text-zinc-500">@{line.unitPriceLabel}</p>
            </div>
            <div className="w-12 shrink-0 text-center font-mono font-bold text-zinc-300">x{line.quantity}</div>
            <div className="w-24 shrink-0 text-right font-mono font-bold text-cyan-300">{line.subtotalLabel}</div>
          </div>
        ))}
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
        {model.discountNote ? <p className="text-xs text-amber-400">{model.discountNote}</p> : null}
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
      <div>
        {model.lines.map((line) => (
          <div key={line.key} className="receipt-item">
            <p className="receipt-name">
              {line.isReturn ? <span className="receipt-return-tag">退貨</span> : null}
              {line.name}
            </p>
            <div className="receipt-nums">
              <span>@{line.unitPriceLabel}</span>
              <span>x{line.quantity}</span>
              <span className="receipt-amount">{line.subtotalLabel}</span>
            </div>
          </div>
        ))}
      </div>
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
        {model.discountNote ? <p className="receipt-discount-note">{model.discountNote}</p> : null}
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
