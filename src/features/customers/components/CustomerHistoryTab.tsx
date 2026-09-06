import { useEffect, useState } from 'react';
import type { CheckoutOrder, CheckoutOrderItem, CheckoutReceipt } from '@/types/checkout';
import { checkoutService } from '@/services';
import { useCartStore } from '@/store/cartStore';
import { useUiStore } from '@/store/uiStore';
import { useToastStore } from '@/components/feedback/toastStore';
import { formatCurrency } from '@/utils/currency';
import { formatDateTime } from '@/utils/date';
import { ReceiptModal } from '@/features/checkout/components/ReceiptModal';
import { Modal } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';

interface CustomerHistoryTabProps {
  customerId: string;
}

export function CustomerHistoryTab({ customerId }: CustomerHistoryTabProps) {
  const [orders, setOrders] = useState<CheckoutOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState<CheckoutReceipt | null>(null);

  // 退換貨彈窗選取狀態
  const [returnOrder, setReturnOrder] = useState<CheckoutOrder | null>(null);
  const [selectedItem, setSelectedItem] = useState<CheckoutOrderItem | null>(null);
  const [returnQty, setReturnQty] = useState(1);
  const [restock, setRestock] = useState(true);
  const [returnReason, setReturnReason] = useState('商品瑕疵/退換貨');

  const { attachedCustomer, importReturnItem } = useCartStore();
  const setActiveTab = useUiStore((s) => s.setActiveTab);
  const showToast = useToastStore((s) => s.showToast);

  const fetchHistory = () => {
    setLoading(true);
    checkoutService
      .getOrderHistory(customerId)
      .then(setOrders)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, [customerId]);

  const handleReprint = (order: CheckoutOrder) => {
    setReceipt({ order, receiptPrintHtml: '' });
  };

  const handleOpenReturnModal = (order: CheckoutOrder) => {
    if (attachedCustomer && order.customerId && order.customerId !== attachedCustomer.id) {
      showToast(
        `結帳櫃檯目前已綁定會員【${attachedCustomer.name}】，無法跨會員帶入【${order.customerName || order.customerId}】之退貨品項`,
        'error'
      );
      return;
    }
    setReturnOrder(order);
    const firstReturnable = order.items.find(
      (i) => i.quantity > 0 && i.quantity - (i.returnedQuantity ?? 0) > 0
    );
    setSelectedItem(firstReturnable || null);
    setReturnQty(1);
  };

  const handleConfirmReturnToCart = () => {
    if (!returnOrder || !selectedItem) return;
    if (attachedCustomer && returnOrder.customerId && returnOrder.customerId !== attachedCustomer.id) {
      showToast(
        `結帳櫃檯目前已綁定會員【${attachedCustomer.name}】，無法跨會員帶入【${returnOrder.customerName || returnOrder.customerId}】之退貨品項`,
        'error'
      );
      return;
    }

    const returned = selectedItem.returnedQuantity ?? 0;
    const remaining = selectedItem.quantity - returned;

    if (returnQty > remaining || returnQty <= 0) {
      showToast(`退貨數量不可超過剩餘可退數量 (${remaining} 件)`, 'warning');
      return;
    }

    try {
      importReturnItem(returnOrder, selectedItem, returnQty, returnReason, restock);
      setReturnOrder(null);
      showToast(`已將【${selectedItem.name}】(${returnQty}件) 帶入結帳櫃檯購物車！`, 'success');
      setActiveTab('checkout');
    } catch (err: any) {
      showToast(err.message || '帶入退貨失敗', 'error');
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
        const hasReturnableItems = order.items.some(
          (i) => i.quantity > 0 && i.quantity - (i.returnedQuantity ?? 0) > 0
        );

        return (
          <div
            key={order.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 transition-all hover:border-zinc-700 shadow-md"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3.5">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-bold text-zinc-100">{order.orderNumber}</span>
                  {renderStatusBadge(order.status)}
                  {renderPaymentBadge(order.payments)}
                  {order.invoice?.type === 'tax_id' && (
                    <Badge color="amber">統編: {order.invoice.taxId}</Badge>
                  )}
                </div>
                <p className="mt-1 font-mono text-sm text-zinc-400">
                  結帳時間：{formatDateTime(order.createdAt)} · 收銀員：{order.cashierName || '店長 Fred'}
                </p>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <p className="font-mono text-xs text-zinc-400">實收總計</p>
                  <p className="font-mono text-lg font-bold text-cyan-300">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>

                {hasReturnableItems && (
                  <Button
                    size="md"
                    variant="secondary"
                    onClick={() => handleOpenReturnModal(order)}
                    className="px-3.5 py-1.5 text-sm font-semibold border-rose-800/80 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 shadow-sm"
                  >
                    ↩️ 辦理退換貨
                  </Button>
                )}

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

            {/* 購買商品明細 */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm font-mono text-zinc-400 mb-1 px-1 font-medium">
                <span>購買商品明細 (共 {order.items.length} 項 / {totalQty} 件)</span>
                <span>單價 × 數量 = 小計</span>
              </div>
              {order.items.map((item, idx) => {
                const returned = item.returnedQuantity ?? 0;
                const remaining = item.quantity - returned;

                return (
                  <div
                    key={`${item.productId}-${idx}`}
                    className="flex items-center justify-between rounded-xl bg-zinc-950/60 px-4 py-3 text-sm border border-zinc-800/50"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-3">
                      <span className="font-mono text-base font-bold text-cyan-400 shrink-0 select-text">
                        {item.sku}
                      </span>
                      <span className="truncate text-base font-semibold text-zinc-100 select-text">
                        {item.name}
                      </span>
                      {item.preOrderId && (
                        <span className="shrink-0 rounded-md bg-cyan-950 px-2 py-0.5 text-xs font-mono font-bold text-cyan-300 border border-cyan-800 select-none">
                          預購取貨
                        </span>
                      )}
                      {returned > 0 && (
                        <span className="shrink-0 rounded-md bg-rose-950 px-2 py-0.5 text-xs font-mono font-bold text-rose-300 border border-rose-800 select-none">
                          已退 {returned} 件 {remaining > 0 ? `(可退: ${remaining})` : '(已退清)'}
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
                );
              })}

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

      {/* 辦理退換貨 Modal */}
      {returnOrder && (
        <Modal
          open={Boolean(returnOrder)}
          onClose={() => setReturnOrder(null)}
          title={`↩️ 辦理訂單退換貨 (${returnOrder.orderNumber})`}
          widthClassName="max-w-2xl"
        >
          <div className="space-y-4 text-base">
            <p className="text-sm text-zinc-300">
              請選擇欲退貨的品項與數量，確認後將自動帶入結帳櫃檯購物車進行純退款或換貨補差額：
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {returnOrder.items
                .filter((i) => i.quantity > 0)
                .map((item, idx) => {
                  const returned = item.returnedQuantity ?? 0;
                  const remaining = item.quantity - returned;
                  const isSelected = selectedItem?.productId === item.productId;

                  return (
                    <div
                      key={idx}
                      onClick={() => remaining > 0 && setSelectedItem(item)}
                      className={`flex items-center justify-between rounded-xl p-3 border transition-all ${
                        remaining <= 0
                          ? 'border-zinc-800 bg-zinc-950/40 opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'border-rose-500 bg-rose-950/40 ring-1 ring-rose-500/50 cursor-pointer'
                          : 'border-zinc-800 bg-zinc-900/70 hover:border-zinc-700 cursor-pointer'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-cyan-400">{item.sku}</span>
                          <span className="font-semibold text-zinc-100 truncate">{item.name}</span>
                        </div>
                        <p className="text-xs font-mono text-zinc-400 mt-0.5">
                          原成交單價：{formatCurrency(item.unitPrice)} · 購買 {item.quantity} 件 · 可退：
                          <strong className="text-rose-300 font-bold">{remaining}</strong> 件
                        </p>
                      </div>

                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-md shrink-0 ${
                          remaining <= 0
                            ? 'bg-zinc-800 text-zinc-500'
                            : isSelected
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {remaining <= 0 ? '已退清' : isSelected ? '✓ 已選取' : '點擊選取'}
                      </span>
                    </div>
                  );
                })}
            </div>

            {selectedItem && (
              <div className="rounded-xl border border-rose-800/60 bg-rose-950/30 p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <label className="text-zinc-200 font-semibold">退貨數量：</label>
                    <input
                      type="number"
                      min={1}
                      max={selectedItem.quantity - (selectedItem.returnedQuantity ?? 0)}
                      value={returnQty}
                      onChange={(e) => setReturnQty(Math.max(1, Number(e.target.value)))}
                      className="w-20 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-center font-mono text-base font-bold text-zinc-100 focus:border-rose-400 focus:outline-none"
                    />
                    <span className="text-xs text-zinc-400">
                      (最多 {selectedItem.quantity - (selectedItem.returnedQuantity ?? 0)} 件)
                    </span>
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer text-zinc-200">
                    <input
                      type="checkbox"
                      checked={restock}
                      onChange={(e) => setRestock(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-900 text-rose-500 focus:ring-rose-400"
                    />
                    <span>回補至門市現貨</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <label className="text-zinc-200 font-semibold shrink-0">退貨原因：</label>
                  <input
                    type="text"
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="輸入退換貨原因"
                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm text-zinc-100 focus:border-rose-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button size="md" variant="ghost" onClick={() => setReturnOrder(null)}>
                取消
              </Button>
              <Button
                size="md"
                variant="primary"
                disabled={!selectedItem}
                onClick={handleConfirmReturnToCart}
                className="px-6 font-bold bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-950/50"
              >
                帶入結帳櫃檯 (以 -{returnQty} 件加入購物車) ➔
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}
