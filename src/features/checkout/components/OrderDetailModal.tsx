import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import type { CheckoutOrder } from '@/types/checkout';
import type { CartItem } from '@/store/cartStore';
import { useUiStore } from '@/store/uiStore';
import { formatCurrency } from '@/utils/currency';
import { formatDateTime } from '@/utils/date';

interface OrderDetailModalProps {
  open: boolean;
  order: CheckoutOrder | null;
  onClose: () => void;
  currentReturnItem?: CartItem | null;
  onSelectAnotherOrder?: () => void;
  onViewReceipt?: (order: CheckoutOrder) => void;
}

export function OrderDetailModal({
  open,
  order,
  onClose,
  currentReturnItem,
  onSelectAnotherOrder,
  onViewReceipt,
}: OrderDetailModalProps) {
  const navigateToCustomer = useUiStore((s) => s.navigateToCustomer);

  if (!order) return null;

  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const renderStatusBadge = (status: CheckoutOrder['status']) => {
    switch (status) {
      case 'refunded':
        return <Badge color="rose">已全額退款</Badge>;
      case 'partially_refunded':
        return <Badge color="amber">部分已退款</Badge>;
      case 'completed':
      default:
        return <Badge color="emerald">正常完成</Badge>;
    }
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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="🧾 原始銷售單據完整明細"
      widthClassName="max-w-3xl"
    >
      <div className="space-y-4 text-sm max-h-[75vh] overflow-y-auto pr-1">
        {/* 單據頂部總覽區塊 */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xl font-bold text-cyan-300 select-text">
                  {order.orderNumber}
                </span>
                {renderStatusBadge(order.status)}
                {renderPaymentBadge(order.payments)}
              </div>
              <p className="mt-1 font-mono text-xs text-zinc-400">
                銷售時間：{formatDateTime(order.createdAt)} · 收銀員：
                <span className="text-zinc-200 font-medium">{order.cashierName || '店長 Fred'}</span>
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-zinc-400 block font-mono">實收總金額</span>
              <span className="font-mono text-xl font-bold text-cyan-300">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>

          {/* 會員資訊與點數紀錄 */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-zinc-900/60 rounded-lg p-2.5 border border-zinc-800/60">
            <div className="flex items-center gap-3">
              <span className="text-zinc-400">購買會員：</span>
              {order.customerId ? (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-100 text-sm">{order.customerName}</span>
                  <span className="font-mono text-zinc-400">({order.customerPhone || order.customerId})</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigateToCustomer(order.customerId!);
                    }}
                    className="ml-2 rounded bg-zinc-800 hover:bg-zinc-700 text-cyan-300 px-2 py-0.5 font-bold transition-colors text-[11px]"
                  >
                    👤 前往會員專頁 ➔
                  </button>
                </div>
              ) : (
                <span className="text-zinc-400 font-medium">現場非會員 (散客)</span>
              )}
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              {order.usedPoints > 0 && (
                <span className="text-amber-300">💎 折抵點數: -{order.usedPoints} pts</span>
              )}
              {order.earnedPoints > 0 && (
                <span className="text-emerald-400 font-bold">🎁 獲得點數: +{order.earnedPoints} pts</span>
              )}
            </div>
          </div>
        </div>

        {/* 當前退貨品項提示橫幅 (若從退貨列表點入) */}
        {currentReturnItem && (
          <div className="rounded-xl border border-rose-500/60 bg-rose-950/40 p-3.5 space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white text-xs font-bold">
                  ↩️
                </span>
                <span className="font-bold text-rose-200 text-sm">
                  正在購物車中辦理退貨：【{currentReturnItem.name}】
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-rose-300">
                折抵金額 {formatCurrency(Math.abs(currentReturnItem.unitPrice * currentReturnItem.quantity))}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-rose-200/80 font-mono pl-7">
              <span>退貨數量：{Math.abs(currentReturnItem.quantity)} 件</span>
              <span>退貨成交單價：{formatCurrency(currentReturnItem.unitPrice)}</span>
              <span>退貨原因：{currentReturnItem.returnReason || '未填寫'}</span>
              <span>
                庫存處理：
                {currentReturnItem.restock ? (
                  <span className="text-emerald-400 font-bold">✓ 回補至門市現貨</span>
                ) : (
                  <span className="text-amber-400 font-bold">✕ 不回補 (報廢/瑕疵處理)</span>
                )}
              </span>
            </div>
          </div>
        )}

        {/* 原始銷售商品清單 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1 font-medium">
            <span>原單銷售品項 (共 {order.items.length} 項 / {totalQty} 件)</span>
            <span>單價 × 數量 = 小計</span>
          </div>

          <div className="space-y-2">
            {order.items.map((item, idx) => {
              const isCurrentReturn = currentReturnItem?.productId === item.productId;
              const returned = item.returnedQuantity ?? 0;
              const remaining = item.quantity - returned;

              return (
                <div
                  key={`${item.productId}-${idx}`}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm border transition-all ${
                    isCurrentReturn
                      ? 'border-rose-500 bg-rose-950/30 ring-1 ring-rose-500/50 shadow-md'
                      : 'border-zinc-800 bg-zinc-950/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-3">
                    <span className="font-mono text-xs font-bold text-cyan-400 shrink-0 select-text">
                      {item.sku}
                    </span>
                    <span className="truncate font-semibold text-zinc-100 text-sm select-text">
                      {item.name}
                    </span>
                    {item.scale && (
                      <span className="shrink-0 font-mono text-xs text-zinc-500">
                        ({item.scale})
                      </span>
                    )}
                    {item.preOrderId && (
                      <span className="shrink-0 rounded bg-cyan-950 px-1.5 py-0.5 text-[11px] font-mono font-bold text-cyan-300 border border-cyan-800 select-none">
                        預購提貨
                      </span>
                    )}
                    {isCurrentReturn && (
                      <span className="shrink-0 rounded bg-rose-500 text-white px-2 py-0.5 text-xs font-bold shadow-sm select-none">
                        ⭐ 本次退貨品項
                      </span>
                    )}
                    {returned > 0 && (
                      <span className="shrink-0 rounded bg-rose-950 px-1.5 py-0.5 text-[11px] font-mono font-bold text-rose-300 border border-rose-800 select-none">
                        已退 {returned} 件 {remaining > 0 ? `(可退: ${remaining})` : '(已退清)'}
                      </span>
                    )}
                  </div>

                  <div className="font-mono text-right shrink-0 text-sm">
                    <span className="text-zinc-400 select-none">
                      {formatCurrency(item.unitPrice)} × {item.quantity} ={' '}
                    </span>
                    <span className="font-bold text-cyan-200 select-text">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 金流、折讓與發票明細 */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* 左欄：發票與支付方式明細 */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 space-y-2 text-xs font-mono">
            <p className="text-zinc-400 font-bold border-b border-zinc-800/80 pb-1">💳 支付與發票明細</p>
            <div className="space-y-1 text-zinc-300">
              {order.payments.map((p, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span>{p.name || p.type}：</span>
                  <span className="font-bold text-zinc-100">{formatCurrency(p.amount)}</span>
                </div>
              ))}
              {order.payments[0]?.changeAmount !== undefined && (
                <div className="flex justify-between items-center text-emerald-400 font-bold">
                  <span>找零金額：</span>
                  <span>{formatCurrency(order.payments[0].changeAmount)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-zinc-800/80 pt-2 text-zinc-400 space-y-1">
              <p>
                發票模式：
                <span className="text-zinc-200">
                  {order.invoice?.type === 'carrier'
                    ? `手機載具 (${order.invoice.carrierCode})`
                    : order.invoice?.type === 'tax_id'
                    ? `統一編號 (${order.invoice.taxId} / ${order.invoice.buyerTitle || '買受人'})`
                    : order.invoice?.type === 'paper'
                    ? '紙本電子發票'
                    : '未開立/不索取'}
                </span>
              </p>
              {order.note && (
                <p>
                  訂單備註：<span className="text-amber-300">{order.note}</span>
                </p>
              )}
            </div>
          </div>

          {/* 右欄：金額結算彙整 */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 space-y-2 text-xs font-mono">
            <p className="text-zinc-400 font-bold border-b border-zinc-800/80 pb-1">💰 金額結算彙整</p>
            <div className="space-y-1.5 text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-400">商品原價小計</span>
                <span>{formatCurrency(order.itemsSubtotal)}</span>
              </div>
              {order.shippingFee > 0 && (
                <div className="flex justify-between text-cyan-300">
                  <span>門市運費</span>
                  <span>+{formatCurrency(order.shippingFee)}</span>
                </div>
              )}
              {order.discountAmount !== 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>現場優惠折讓</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-cyan-300 pt-2 border-t border-zinc-800">
                <span>實收總金額</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作按鈕 */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            {onSelectAnotherOrder && (
              <Button
                variant="secondary"
                size="md"
                onClick={onSelectAnotherOrder}
                className="text-xs font-semibold border-rose-800 bg-rose-950/40 text-rose-300 hover:bg-rose-900"
              >
                🔄 重新挑選其他原單
              </Button>
            )}
            {onViewReceipt && (
              <Button
                variant="secondary"
                size="md"
                onClick={() => onViewReceipt(order)}
                className="text-xs font-semibold"
              >
                🧾 預覽電子收據憑證
              </Button>
            )}
          </div>

          <Button variant="primary" size="md" onClick={onClose}>
            關閉明細
          </Button>
        </div>
      </div>
    </Modal>
  );
}
