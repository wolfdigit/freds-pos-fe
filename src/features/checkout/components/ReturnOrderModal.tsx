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

interface SelectedReturnItemEntry {
  order: CheckoutOrder;
  item: CheckoutOrderItem;
  returnQty: number;
  returnReason: string;
  restock: boolean;
}

export function ReturnOrderModal({
  open,
  onClose,
  prefillProductId,
  prefillKeyword,
}: ReturnOrderModalProps) {
  // 搜尋條件欄位
  const [productKeyword, setProductKeyword] = useState(prefillKeyword || '');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [customerKeyword, setCustomerKeyword] = useState('');

  const [orders, setOrders] = useState<CheckoutOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 複選品項狀態：key 為 `${order.id}_${item.productId || (item as any).id}_${item.sku}`
  const [selectedItems, setSelectedItems] = useState<Record<string, SelectedReturnItemEntry>>({});

  const { importReturnItem, attachedCustomer } = useCartStore();
  const showToast = useToastStore((s) => s.showToast);

  const getItemKey = (order: CheckoutOrder, item: CheckoutOrderItem) => {
    return `${order.id}_${item.productId || (item as any).id}_${item.sku}`;
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const parsedAmount = Number(amountInput);
      const minAmount = !isNaN(parsedAmount) && parsedAmount > 0 ? parsedAmount : undefined;
      const maxAmount = !isNaN(parsedAmount) && parsedAmount > 0 ? parsedAmount : undefined;

      const results = await checkoutService.getOrderHistory({
        productKeyword: productKeyword.trim() || undefined,
        productId: prefillProductId || undefined,
        startDate: startDateTime ? new Date(startDateTime).toISOString() : undefined,
        endDate: endDateTime ? new Date(endDateTime).toISOString() : undefined,
        orderNumber: orderNumber.trim() || undefined,
        keyword: customerKeyword.trim() || undefined,
        minAmount,
        maxAmount,
      });

      // 依時間倒序
      setOrders(
        results.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (err) {
      console.error(err);
      showToast('查詢歷史訂單失敗', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setProductKeyword(prefillKeyword || '');
      setSelectedItems({});
      fetchOrders();
    }
  }, [open, prefillProductId, prefillKeyword]);

  // 單獨品項勾選 / 取消勾選 (支援複選)
  const handleToggleItem = (order: CheckoutOrder, item: CheckoutOrderItem) => {
    const key = getItemKey(order, item);
    if (selectedItems[key]) {
      // 取消選取
      const updated = { ...selectedItems };
      delete updated[key];
      setSelectedItems(updated);
      return;
    }

    // 檢查會員歸屬限制
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

    // 加入選取
    setSelectedItems({
      ...selectedItems,
      [key]: {
        order,
        item,
        returnQty: 1,
        returnReason: '門市退換貨',
        restock: true,
      },
    });
  };

  // 修改單一已選品項的數量
  const handleQtyChange = (key: string, qty: number, maxQty: number) => {
    if (!selectedItems[key]) return;
    const validQty = Math.max(1, Math.min(maxQty, qty));
    setSelectedItems({
      ...selectedItems,
      [key]: {
        ...selectedItems[key],
        returnQty: validQty,
      },
    });
  };

  // 修改單一已選品項的退貨原因
  const handleReasonChange = (key: string, reason: string) => {
    if (!selectedItems[key]) return;
    setSelectedItems({
      ...selectedItems,
      [key]: {
        ...selectedItems[key],
        returnReason: reason,
      },
    });
  };

  // 修改單一已選品項的是否回庫
  const handleRestockToggle = (key: string, restock: boolean) => {
    if (!selectedItems[key]) return;
    setSelectedItems({
      ...selectedItems,
      [key]: {
        ...selectedItems[key],
        restock,
      },
    });
  };

  // 移除單一已選項目
  const handleRemoveSelectedItem = (key: string) => {
    const updated = { ...selectedItems };
    delete updated[key];
    setSelectedItems(updated);
  };

  // 批量確認帶入退貨
  const handleConfirmReturn = () => {
    const selectedList = Object.values(selectedItems);
    if (selectedList.length === 0) return;

    let successCount = 0;
    for (const entry of selectedList) {
      try {
        importReturnItem(
          entry.order,
          entry.item,
          entry.returnQty,
          entry.returnReason,
          entry.restock
        );
        successCount++;
      } catch (err: any) {
        showToast(err.message || `品項【${entry.item.name}】帶入退貨失敗`, 'error');
      }
    }

    if (successCount > 0) {
      showToast(`已成功將 ${successCount} 個退貨品項帶入結帳清單`, 'success');
      onClose();
    }
  };

  const handleResetFilters = () => {
    setProductKeyword('');
    setStartDateTime('');
    setEndDateTime('');
    setAmountInput('');
    setOrderNumber('');
    setCustomerKeyword('');
  };

  const selectedEntries = Object.entries(selectedItems);
  const totalSelectedCount = selectedEntries.length;
  const totalSelectedQty = selectedEntries.reduce((sum, [, e]) => sum + e.returnQty, 0);
  const totalRefundAmount = selectedEntries.reduce(
    (sum, [, e]) => sum + e.item.unitPrice * e.returnQty,
    0
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="🔄 辦理退換貨（選擇原始售出單據商品）"
      widthClassName="max-w-5xl"
    >
      <div className="space-y-3.5 text-base">
        {/* 搜尋條件過濾列 (排版寬敞不重疊，時間區間與金額欄位分立) */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-3">
          {/* 第一排：商品品名/貨號/條碼、原單總金額、銷售單號 */}
          <div className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-12 md:col-span-6">
              <label className="mb-1 block text-xs font-semibold text-zinc-300">
                商品品名 / 貨號 (SKU) / 條碼
              </label>
              <Input
                placeholder="輸入品名、貨號或條碼..."
                value={productKeyword}
                onChange={(e) => setProductKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
              />
            </div>

            <div className="col-span-12 sm:col-span-6 md:col-span-3">
              <label className="mb-1 block text-xs font-semibold text-zinc-300">
                原單總金額 ($)
              </label>
              <Input
                monospace
                placeholder="例如: 7450"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
              />
            </div>

            <div className="col-span-12 sm:col-span-6 md:col-span-3">
              <label className="mb-1 block text-xs font-semibold text-zinc-400">銷售單號</label>
              <Input
                monospace
                placeholder="例如: SO-20260825-0076"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
              />
            </div>
          </div>

          {/* 第二排：原單時間區間 (獨立足夠空間)、會員姓名/電話、操作按鈕 */}
          <div className="grid grid-cols-12 gap-3 items-end pt-2 border-t border-zinc-900">
            <div className="col-span-12 lg:col-span-6">
              <label className="mb-1 block text-xs font-semibold text-zinc-300">
                原單時間區間 (年月日時分)
              </label>
              <div className="grid grid-cols-2 gap-2 items-center">
                <input
                  type="datetime-local"
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  className="w-full min-w-0 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-100 font-mono focus:border-cyan-400 focus:outline-none"
                  title="起始時間"
                />
                <input
                  type="datetime-local"
                  value={endDateTime}
                  onChange={(e) => setEndDateTime(e.target.value)}
                  className="w-full min-w-0 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-100 font-mono focus:border-cyan-400 focus:outline-none"
                  title="結束時間"
                />
              </div>
            </div>

            <div className="col-span-12 sm:col-span-8 lg:col-span-4">
              <label className="mb-1 block text-xs font-semibold text-zinc-400">會員姓名 / 手機電話</label>
              <Input
                placeholder="例如: 陳冠宇 或 0912..."
                value={customerKeyword}
                onChange={(e) => setCustomerKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
              />
            </div>

            <div className="col-span-12 sm:col-span-4 lg:col-span-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors shrink-0"
              >
                重置
              </button>
              <Button size="md" variant="primary" onClick={fetchOrders} disabled={isLoading} className="font-bold flex-1">
                {isLoading ? '查詢中...' : '🔍 查詢'}
              </Button>
            </div>
          </div>
        </div>

        {/* 歷史訂單列表與品項分項勾選 */}
        <div className="max-h-[360px] overflow-y-auto space-y-3 pr-1">
          {orders.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 rounded-xl border border-dashed border-zinc-800">
              <p className="text-2xl mb-1">🔍</p>
              <p className="text-sm">查無符合條件之歷史訂單，請調整搜尋條件</p>
            </div>
          ) : (
            orders.map((order) => {
              const orderHasSelected = order.items.some((item) => !!selectedItems[getItemKey(order, item)]);

              return (
                <div
                  key={order.id}
                  className={`rounded-xl border transition-all ${
                    orderHasSelected
                      ? 'border-rose-800/80 bg-rose-950/10 shadow-md ring-1 ring-rose-500/30'
                      : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                  }`}
                >
                  {/* 訂單頂部資訊 */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 p-3 bg-zinc-900/60 rounded-t-xl text-xs">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-bold text-cyan-300 text-sm">{order.orderNumber}</span>
                      <span className="font-mono text-zinc-400">{formatDateTime(order.createdAt)}</span>
                      {order.customerName && (
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-200">
                          👤 {order.customerName} ({order.customerPhone})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-zinc-200 text-sm">
                        原單總額 {formatCurrency(order.totalAmount)}
                      </span>
                      {order.status === 'refunded' ? (
                        <Badge color="rose">已全額退款</Badge>
                      ) : order.status === 'partially_refunded' ? (
                        <Badge color="amber">部分已退款</Badge>
                      ) : (
                        <Badge color="emerald">正常完成</Badge>
                      )}
                    </div>
                  </div>

                  {/* 訂單內商品列表 (每個品項獨立選取與設定) */}
                  <div className="divide-y divide-zinc-800/40 p-1.5">
                    {order.items.map((item, idx) => {
                      const key = getItemKey(order, item);
                      const isSelected = !!selectedItems[key];
                      const returned = item.returnedQuantity ?? 0;
                      const remaining = item.quantity - returned;
                      const isSelectable = remaining > 0;

                      return (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-lg transition-all ${
                            !isSelectable
                              ? 'opacity-40 bg-zinc-950/20'
                              : isSelected
                              ? 'bg-rose-950/30 border border-rose-600/50'
                              : 'hover:bg-zinc-800/40'
                          }`}
                        >
                          {/* 品項基本列 */}
                          <div className="flex items-center justify-between gap-3">
                            {/* Checkbox 與 品名貨號 */}
                            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                              <input
                                type="checkbox"
                                disabled={!isSelectable}
                                checked={isSelected}
                                onChange={() => handleToggleItem(order, item)}
                                className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-rose-500 focus:ring-rose-400 cursor-pointer disabled:cursor-not-allowed"
                              />
                              <div
                                className="cursor-pointer flex-1 min-w-0"
                                onClick={() => isSelectable && handleToggleItem(order, item)}
                              >
                                <p className="font-semibold text-zinc-100 text-sm truncate">{item.name}</p>
                                <p className="text-xs text-zinc-400 font-mono">
                                  貨號: <span className="text-zinc-300 font-bold">{item.sku}</span> · 原售單價:{' '}
                                  <span className="text-zinc-200">{formatCurrency(item.unitPrice)}</span>
                                  {item.isManualPrice && <span className="text-amber-400 ml-1 font-sans">(改價)</span>}
                                </p>
                              </div>
                            </div>

                            {/* 數量與操作按鈕 */}
                            <div className="flex items-center gap-4 shrink-0">
                              <div className="text-xs font-mono text-right">
                                <span className="text-zinc-400 block">原購: {item.quantity} 件</span>
                                <span className={remaining > 0 ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                                  可退: {remaining} 件
                                </span>
                              </div>

                              <button
                                type="button"
                                disabled={!isSelectable}
                                onClick={() => handleToggleItem(order, item)}
                                className={`rounded px-3 py-1.5 text-xs font-bold transition-all ${
                                  !isSelectable
                                    ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                                    : isSelected
                                    ? 'bg-rose-900 text-rose-100 border border-rose-500 hover:bg-rose-800'
                                    : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                                }`}
                              >
                                {isSelected ? '✓ 已選取' : '+ 選取品項'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 底部已勾選退貨品項清單列表 (依需求 3：改為完整清單呈現) */}
        {totalSelectedCount > 0 && (
          <div className="rounded-xl border border-rose-600/80 bg-rose-950/40 p-3.5 space-y-3 shadow-lg">
            {/* 列表標題與總計統計 */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-900/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-rose-200 text-sm">
                  📋 已勾選退貨品項清單 ({totalSelectedCount} 項，共 {totalSelectedQty} 件商品)
                </span>
                <Badge color="rose">退貨折抵</Badge>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-rose-300">總退款折抵金額：</span>
                <span className="font-mono text-xl font-extrabold text-rose-300">
                  -{formatCurrency(totalRefundAmount)}
                </span>
              </div>
            </div>

            {/* 已選品項詳細列表 */}
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 divide-y divide-rose-900/30">
              {selectedEntries.map(([key, entry], idx) => {
                const returned = entry.item.returnedQuantity ?? 0;
                const remaining = entry.item.quantity - returned;
                const subtotal = entry.item.unitPrice * entry.returnQty;

                return (
                  <div key={key} className="pt-2 first:pt-0 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {/* 品名、貨號與原單號 */}
                    <div className="flex-1 min-w-[240px]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-rose-400 font-bold">{idx + 1}.</span>
                        <span className="rounded bg-zinc-800 px-1.5 py-0.2 font-mono text-[11px] text-zinc-300">
                          原單: {entry.order.orderNumber}
                        </span>
                        <span className="font-semibold text-rose-100 text-sm">{entry.item.name}</span>
                      </div>
                      <p className="text-[11px] text-rose-300/70 font-mono mt-0.5">
                        貨號: {entry.item.sku} · 原售單價: {formatCurrency(entry.item.unitPrice)} · 上限: {remaining} 件
                      </p>
                    </div>

                    {/* 退貨參數設定：數量、原因、回庫 */}
                    <div className="flex items-center gap-3 flex-wrap shrink-0">
                      {/* 數量控制 */}
                      <div className="flex items-center gap-1">
                        <span className="text-zinc-400 font-medium">退貨數量:</span>
                        <div className="flex items-center">
                          <button
                            type="button"
                            disabled={entry.returnQty <= 1}
                            onClick={() => handleQtyChange(key, entry.returnQty - 1, remaining)}
                            className="h-6 w-6 rounded-l bg-zinc-800 text-zinc-200 hover:bg-zinc-700 disabled:opacity-40 font-bold"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={remaining}
                            value={entry.returnQty}
                            onChange={(e) => handleQtyChange(key, Number(e.target.value) || 1, remaining)}
                            className="h-6 w-12 border-y border-zinc-700 bg-zinc-900 text-center font-mono font-bold text-rose-100 focus:outline-none"
                          />
                          <button
                            type="button"
                            disabled={entry.returnQty >= remaining}
                            onClick={() => handleQtyChange(key, entry.returnQty + 1, remaining)}
                            className="h-6 w-6 rounded-r bg-zinc-800 text-zinc-200 hover:bg-zinc-700 disabled:opacity-40 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* 退貨原因 */}
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={entry.returnReason}
                          onChange={(e) => handleReasonChange(key, e.target.value)}
                          placeholder="退貨原因..."
                          className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-100 w-28 focus:border-rose-400 focus:outline-none"
                        />
                      </div>

                      {/* 回庫勾選 */}
                      <label className="flex items-center gap-1 text-zinc-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={entry.restock}
                          onChange={(e) => handleRestockToggle(key, e.target.checked)}
                          className="rounded border-zinc-700 bg-zinc-900 text-rose-500 focus:ring-rose-400 h-3.5 w-3.5"
                        />
                        <span>回庫</span>
                      </label>

                      {/* 小計折抵金額 */}
                      <div className="w-20 text-right font-mono font-bold text-rose-300 text-sm">
                        -{formatCurrency(subtotal)}
                      </div>

                      {/* 移除單項按鈕 */}
                      <button
                        type="button"
                        onClick={() => handleRemoveSelectedItem(key)}
                        className="text-zinc-400 hover:text-rose-400 p-1 text-sm transition-colors"
                        title="取消此品項退貨"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 底部操作按鈕 */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-rose-900/60">
              <button
                type="button"
                onClick={() => setSelectedItems({})}
                className="text-xs text-zinc-400 hover:text-zinc-200 underline"
              >
                ✕ 清空全部已選 ({totalSelectedCount} 項)
              </button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={onClose}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  取消
                </Button>

                <Button
                  size="md"
                  variant="danger"
                  onClick={handleConfirmReturn}
                  className="font-bold px-5 text-sm"
                >
                  ↩️ 確認帶入退貨清單 ({totalSelectedCount} 項，折抵 -{formatCurrency(totalRefundAmount)})
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
