import { useEffect, useState } from 'react';
import type { CheckoutOrder, CheckoutReceipt } from '@/types/checkout';
import { checkoutService } from '@/services';
import { formatCurrency } from '@/utils/currency';
import { formatDateTime } from '@/utils/date';
import { ReceiptModal } from '@/features/checkout/components/ReceiptModal';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';

interface CustomerHistoryTabProps {
  customerId: string;
}

export function CustomerHistoryTab({ customerId }: CustomerHistoryTabProps) {
  const [orders, setOrders] = useState<CheckoutOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState<CheckoutReceipt | null>(null);

  useEffect(() => {
    setLoading(true);
    checkoutService
      .getOrderHistory(customerId)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [customerId]);

  const handleReprint = (order: CheckoutOrder) => {
    setReceipt({ order, receiptPrintHtml: '' });
  };

  const renderPaymentBadge = (payments: CheckoutOrder['payments']) => {
    if (!payments || payments.length === 0) return <Badge color="zinc">未標示</Badge>;
    if (payments.length > 1) return <Badge color="purple">組合支付 ({payments.length})</Badge>;
    const p = payments[0];
    switch (p.type) {
      case 'cash':
        return <Badge color="emerald">💵 現金</Badge>;
      case 'credit_card':
        return <Badge color="cyan">💳 信用卡</Badge>;
      case 'line_pay':
        return <Badge color="amber">📱 LINE Pay</Badge>;
      case 'bank_transfer':
        return <Badge color="purple">🏦 銀行轉帳</Badge>;
      default:
        return <Badge color="zinc">{p.name || p.type}</Badge>;
    }
  };

  if (loading) {
    return <p className="py-8 text-center text-base text-zinc-500">載入結帳歷史紀錄中...</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-8 text-center">
        <p className="text-4xl mb-2">🧾</p>
        <p className="text-base font-medium text-zinc-400">此會員目前無歷史結帳紀錄</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);

        return (
          <div
            key={order.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 transition-all hover:border-zinc-700 shadow-md"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3.5">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-bold text-zinc-100">{order.orderNumber}</span>
                  {renderPaymentBadge(order.payments)}
                  {order.invoice?.type === 'tax_id' && (
                    <Badge color="amber">統編: {order.invoice.taxId}</Badge>
                  )}
                </div>
                <p className="mt-1 font-mono text-sm text-zinc-400">
                  結帳時間：{formatDateTime(order.createdAt)} · 收銀員：{order.cashierName || '店長 Fred'}
                </p>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <p className="font-mono text-xs text-zinc-400">實收總計</p>
                  <p className="font-mono text-lg font-bold text-cyan-300">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
                <Button
                  size="md"
                  variant="secondary"
                  onClick={() => handleReprint(order)}
                  className="px-3.5 py-1.5 text-sm font-semibold"
                >
                  🧾 補印收據
                </Button>
              </div>
            </div>

            {/* 購買商品明細（字體放大） */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm font-mono text-zinc-400 mb-1 px-1 font-medium">
                <span>購買商品明細 (共 {order.items.length} 項 / {totalQty} 件)</span>
                <span>單價 × 數量 = 小計</span>
              </div>
              {order.items.map((item, idx) => (
                <div
                  key={`${item.productId}-${idx}`}
                  className="flex items-center justify-between rounded-xl bg-zinc-950/60 px-4 py-3 text-sm border border-zinc-800/50"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-3">
                    <span className="font-mono text-base font-bold text-cyan-400 shrink-0 select-text">{item.sku}</span>
                    <span className="truncate text-base font-semibold text-zinc-100 select-text">{item.name}</span>
                    {item.preOrderId && (
                      <span className="shrink-0 rounded-md bg-cyan-950 px-2 py-0.5 text-xs font-mono font-bold text-cyan-300 border border-cyan-800 select-none">
                        預購取貨
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-right shrink-0 text-base">
                    <span className="text-zinc-400 select-none">
                      {formatCurrency(item.unitPrice)} × {item.quantity} ={' '}
                    </span>
                    <span className="font-bold text-cyan-200 select-text">{formatCurrency(item.subtotal)}</span>
                  </div>
                </div>
              ))}

              {order.shippingFee > 0 && (
                <div className="flex items-center justify-between rounded-xl bg-cyan-950/30 px-4 py-3 text-sm border border-cyan-800/40">
                  <div className="flex items-center gap-2.5 min-w-0 pr-3">
                    <span className="select-none font-mono text-base font-bold text-cyan-400 shrink-0">🚚</span>
                    <span className="truncate text-base font-semibold text-cyan-200">門市運費 (超商 / 宅配)</span>
                  </div>
                  <div className="font-mono text-right shrink-0 text-base font-bold text-cyan-300">
                    +{formatCurrency(order.shippingFee)}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between text-sm font-mono text-zinc-300">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-zinc-400">商品小計: {formatCurrency(order.itemsSubtotal)}</span>
                {order.shippingFee > 0 && (
                  <span className="text-cyan-400 font-semibold">🚚 運費: +{formatCurrency(order.shippingFee)}</span>
                )}
                {order.discountAmount > 0 && (
                  <span className="text-rose-400 font-semibold">✂️ 折讓: -{formatCurrency(order.discountAmount)}</span>
                )}
              </div>
              {order.earnedPoints > 0 && (
                <span className="text-emerald-400 font-semibold">🎁 獲得點數: +{order.earnedPoints} pts</span>
              )}
            </div>
          </div>
        );
      })}
      <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}
