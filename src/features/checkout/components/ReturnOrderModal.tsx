import { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { checkoutService } from '@/services';
import { useCartStore } from '@/store/cartStore';
import { useToastStore } from '@/components/feedback/toastStore';
import { formatCurrency } from '@/utils/currency';
import { formatDateTime } from '@/utils/date';
import type { CheckoutOrder, CheckoutOrderItem } from '@/types/checkout';

interface ReturnOrderModalProps {
  open: boolean;
  onClose: () => void;
  prefillProductId?: string;
  prefillKeyword?: string;
}

export function ReturnOrderModal({
  open,
  onClose,
  prefillProductId,
  prefillKeyword,
}: ReturnOrderModalProps) {
  const [keyword, setKeyword] = useState(prefillKeyword || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [orders, setOrders] = useState<CheckoutOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CheckoutOrder | null>(null);
  const [selectedItem, setSelectedItem] = useState<CheckoutOrderItem | null>(null);
  const [returnQty, setReturnQty] = useState(1);
  const [restock, setRestock] = useState(true);
  const [returnReason, setReturnReason] = useState('商品外觀微瑕疵退貨');

  const { importReturnItem, attachedCustomer } = useCartStore();
  const showToast = useToastStore((s) => s.showToast);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const results = await checkoutService.getOrderHistory({
        keyword: keyword.trim() || undefined,
        productId: prefillProductId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      // 依時間倒序
      setOrders(results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error(err);
      showToast('查詢歷史訂單失敗', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setKeyword(prefillKeyword || '');
      setSelectedOrder(null);
      setSelectedItem(null);
      fetchOrders();
    }
  }, [open, prefillProductId, prefillKeyword]);

  const handleSelectItem = (order: CheckoutOrder, item: CheckoutOrderItem) => {
    if (attachedCustomer && order.customerId && order.customerId !== attachedCustomer.id) {
      showToast(
        `原單屬於會員【${order.customerName || order.customerId}】，不可在當前會員【${attachedCustomer.name}】之結帳中退貨`,
        'error'
      );
      return;
    }

    const returned = item.returnedQuantity ?? 0;
    const remaining = item.quantity - returned;
    if (remaining <= 0) {
      showToast('此商品於該訂單已無可退數量', 'warning');
      return;
    }
    setSelectedOrder(order);
    setSelectedItem(item);
    setReturnQty(1);
  };

  const handleConfirmReturn = () => {
    if (!selectedOrder || !selectedItem) return;
    if (attachedCustomer && selectedOrder.customerId && selectedOrder.customerId !== attachedCustomer.id) {
      showToast(
        `原單屬於會員【${selectedOrder.customerName || selectedOrder.customerId}】，不可在當前會員【${attachedCustomer.name}】之結帳中退貨`,
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
      importReturnItem(selectedOrder, selectedItem, returnQty, returnReason, restock);
      showToast(
        `已將【${selectedItem.name}】(${returnQty}件) 帶入退換貨購物車 (原單號: ${selectedOrder.orderNumber})`,
        'success'
      );
      onClose();
    } catch (err: any) {
      showToast(err.message || '帶入退貨失敗', 'error');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="🔄 辦理退換貨（選擇原始售出單據）" widthClassName="max-w-4xl">
      <div className="space-y-4 text-base">
        {/* 搜尋條件過濾列 */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[240px]">
              <Input
                placeholder="搜尋單號 / 商品品名 / 條碼 / 會員電話 / 統編"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400">日期:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:border-cyan-400 focus:outline-none"
              />
              <span className="text-zinc-500">~</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <Button size="md" variant="primary" onClick={fetchOrders} disabled={isLoading}>
              {isLoading ? '查詢中...' : '🔍 查詢單據'}
            </Button>
          </div>
          <p className="text-xs text-zinc-400">
            {attachedCustomer ? (
              <span>
                💡 目前結帳已綁定會員【<strong className="text-cyan-300 font-bold">{attachedCustomer.name}</strong>】。可辦理退貨之原單包括：<strong>該會員之歷史訂單</strong> 或 <strong>現場散客（未綁定會員）訂單</strong>。
              </span>
            ) : (
              <span>
                💡 支援會員與未連結會員之散客訂單。若選取會員訂單，系統將自動於購物車綁定該會員。
              </span>
            )}
          </p>
        </div>

        {/* 訂單與品項列表 */}
        <div className="max-h-[360px] overflow-y-auto space-y-3 pr-1">
          {orders.length === 0 && !isLoading && (
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-8 text-center text-zinc-400">
              <p className="text-3xl mb-1">🔍</p>
              <p className="font-medium">找不到符合條件的歷史銷售單據</p>
            </div>
          )}

          {orders.map((order) => {
            const isForbidden = Boolean(
              attachedCustomer && order.customerId && order.customerId !== attachedCustomer.id
            );

            return (
              <div
                key={order.id}
                className={`rounded-xl border p-4 transition-all ${
                  isForbidden
                    ? 'border-zinc-800/60 bg-zinc-950/40 opacity-75'
                    : selectedOrder?.id === order.id
                    ? 'border-cyan-500 bg-cyan-950/20 shadow-md ring-1 ring-cyan-500/40'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                {/* 訂單頭資訊 */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-bold text-zinc-100">{order.orderNumber}</span>
                    {isForbidden ? (
                      <Badge color="rose">⛔ 會員【{order.customerName}】(非當前會員)</Badge>
                    ) : order.customerId ? (
                      <Badge color="cyan">👤 {order.customerName} ({order.customerPhone})</Badge>
                    ) : (
                      <Badge color="zinc">現場散客 (非會員)</Badge>
                    )}
                    {order.status === 'refunded' ? (
                      <Badge color="rose">已全額退款</Badge>
                    ) : order.status === 'partially_refunded' ? (
                      <Badge color="amber">部分已退款</Badge>
                    ) : (
                      <Badge color="emerald">正常完成</Badge>
                    )}
                  </div>
                  <div className="font-mono text-xs text-zinc-400">
                    售出時間：{formatDateTime(order.createdAt)} · 實收：{formatCurrency(order.totalAmount)}
                  </div>
                </div>

                {/* 品項清單 */}
                <div className="mt-3 space-y-2">
                  {order.items
                    .filter((item) => item.quantity > 0)
                    .map((item, idx) => {
                      const returned = item.returnedQuantity ?? 0;
                      const remaining = item.quantity - returned;
                      const isSelected = selectedOrder?.id === order.id && selectedItem?.productId === item.productId;
                      const isDisabled = isForbidden || remaining <= 0;

                      return (
                        <div
                          key={`${item.productId}-${idx}`}
                          className={`flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm border transition-all ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-900/30'
                              : isDisabled
                              ? 'border-zinc-800/40 bg-zinc-950/30 opacity-60'
                              : 'border-zinc-800/60 bg-zinc-950/60 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span className="font-mono text-sm font-bold text-cyan-400 shrink-0">{item.sku}</span>
                            <span className="truncate font-medium text-zinc-200">{item.name}</span>
                            {returned > 0 && (
                              <span className="shrink-0 rounded bg-amber-950 px-1.5 py-0.5 text-xs font-mono font-bold text-amber-300 border border-amber-800">
                                已退 {returned} 件
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 shrink-0 font-mono text-sm">
                            <span className="text-zinc-400">
                              原售價 {formatCurrency(item.unitPrice)} · 購買 {item.quantity} 件 (剩餘可退:{' '}
                              <strong className="text-cyan-300 font-bold">{remaining}</strong>)
                            </span>

                            <Button
                              size="sm"
                              variant={isSelected ? 'primary' : 'secondary'}
                              disabled={isDisabled}
                              onClick={() => handleSelectItem(order, item)}
                              className="px-2.5 py-1 text-xs font-bold"
                            >
                              {isForbidden
                                ? '不可跨會員退貨'
                                : remaining <= 0
                                ? '已退清'
                                : isSelected
                                ? '✓ 已選中'
                                : '選取退貨'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部操作與退貨設定區 */}
        {selectedOrder && selectedItem && (
          <div className="rounded-xl border border-cyan-700/60 bg-cyan-950/30 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-800/60 pb-2">
              <span className="font-bold text-cyan-300">
                📦 已選退貨品項：【{selectedItem.name}】
              </span>
              <span className="font-mono text-xs text-zinc-300">
                原單號：{selectedOrder.orderNumber} · 原售價：{formatCurrency(selectedItem.unitPrice)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-sm font-medium">
              {/* 退貨數量 */}
              <div className="flex items-center gap-2">
                <label className="text-zinc-300 shrink-0">退貨數量：</label>
                <input
                  type="number"
                  min={1}
                  max={selectedItem.quantity - (selectedItem.returnedQuantity ?? 0)}
                  value={returnQty}
                  onChange={(e) => setReturnQty(Math.max(1, Number(e.target.value)))}
                  className="w-20 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-center font-mono text-base font-bold text-zinc-100 focus:border-cyan-400 focus:outline-none"
                />
                <span className="text-xs text-zinc-400">
                  (最多 {selectedItem.quantity - (selectedItem.returnedQuantity ?? 0)} 件)
                </span>
              </div>

              {/* 庫存回補 */}
              <div className="flex items-center gap-2">
                <label className="text-zinc-300 shrink-0">庫存處理：</label>
                <label className="flex items-center gap-1.5 cursor-pointer text-zinc-200">
                  <input
                    type="checkbox"
                    checked={restock}
                    onChange={(e) => setRestock(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-cyan-400"
                  />
                  <span>回補至門市現貨</span>
                </label>
              </div>

              {/* 退貨原因 */}
              <div className="flex items-center gap-2">
                <label className="text-zinc-300 shrink-0">原因：</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-200 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="商品外觀微瑕疵退貨">商品外觀微瑕疵退貨</option>
                  <option value="零件脫落或缺件">零件脫落或缺件</option>
                  <option value="水貼/漆面溢色不良">水貼/漆面溢色不良</option>
                  <option value="門市七天更換/猶豫期">門市七天更換/猶豫期</option>
                  <option value="其他原因特批">其他原因特批</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button size="md" variant="ghost" onClick={() => setSelectedItem(null)}>
                取消選取
              </Button>
              <Button size="md" variant="primary" onClick={handleConfirmReturn} className="px-6 font-bold">
                ↩️ 帶入退換貨 (以 -{returnQty} 件加入購物車)
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
