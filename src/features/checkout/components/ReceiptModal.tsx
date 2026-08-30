import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import type { CheckoutReceipt } from '@/types/checkout';
import { formatCurrency } from '@/utils/currency';
import { formatDateTime } from '@/utils/date';

interface ReceiptModalProps {
  receipt: CheckoutReceipt | null;
  onClose: () => void;
}

export function ReceiptModal({ receipt, onClose }: ReceiptModalProps) {
  if (!receipt) return null;
  const { order } = receipt;

  return (
    <Modal open={!!receipt} onClose={onClose} title="電子收據預覽" widthClassName="max-w-md">
      <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-sm">
        <div className="text-center">
          <p className="text-lg font-bold text-cyan-300">FRED'S POS</p>
          <p className="text-xs text-zinc-500">{order.orderNumber}</p>
          <p className="text-xs text-zinc-500">{formatDateTime(order.createdAt)}</p>
        </div>
        <div className="border-t border-dashed border-zinc-700 pt-2 divide-y divide-zinc-800/60">
          {order.items.map((item, i) => (
            <div key={i} className="py-1.5 flex items-start justify-between gap-3 text-zinc-300">
              {/* 品名 */}
              <div className="flex-1 min-w-0">
                <p className="truncate font-sans font-medium text-zinc-200 text-sm">{item.name}</p>
                <p className="text-xs text-zinc-500 font-mono">@{formatCurrency(item.unitPrice)}</p>
              </div>
              {/* 數量 (獨立欄位) */}
              <div className="shrink-0 text-center font-mono font-bold text-zinc-300 w-12">
                x{item.quantity}
              </div>
              {/* 小計 (獨立欄位靠右) */}
              <div className="shrink-0 text-right font-mono font-bold text-cyan-300 w-24">
                {formatCurrency(item.subtotal)}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-dashed border-zinc-700 pt-2 space-y-1">
          <div className="flex justify-between text-zinc-400">
            <span>商品小計</span>
            <span>{formatCurrency(order.itemsSubtotal)}</span>
          </div>
          {order.shippingFee > 0 && (
            <div className="flex justify-between text-cyan-300">
              <span>運費</span>
              <span>+{formatCurrency(order.shippingFee)}</span>
            </div>
          )}
          {order.discountAmount !== 0 && (
            <div className="flex justify-between text-amber-400">
              <span>折讓</span>
              <span>-{formatCurrency(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-cyan-300 pt-1 border-t border-zinc-800">
            <span>應收總額</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
        <div className="border-t border-dashed border-zinc-700 pt-2 space-y-1 text-zinc-400">
          {order.payments.map((p, i) => (
            <div key={i} className="flex justify-between">
              <span>{p.name}</span>
              <span>{formatCurrency(p.amount)}</span>
            </div>
          ))}
          {order.payments[0]?.changeAmount !== undefined && (
            <div className="flex justify-between text-emerald-400">
              <span>找零</span>
              <span>{formatCurrency(order.payments[0].changeAmount)}</span>
            </div>
          )}
        </div>
        {order.invoice.type !== 'none' && (
          <div className="border-t border-dashed border-zinc-700 pt-2 text-xs text-zinc-500">
            {order.invoice.type === 'carrier' && `載具: ${order.invoice.carrierCode}`}
            {order.invoice.type === 'tax_id' && `統編: ${order.invoice.taxId} (${order.invoice.buyerTitle})`}
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="primary" onClick={onClose}>
          完成，返回結帳櫃檯
        </Button>
      </div>
    </Modal>
  );
}
