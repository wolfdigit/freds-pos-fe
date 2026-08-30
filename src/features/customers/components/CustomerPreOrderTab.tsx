import { useCallback, useEffect, useState } from 'react';
import type { PreOrder } from '@/types/preorder';
import { preOrderService } from '@/services';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { useCartStore } from '@/store/cartStore';
import { useUiStore } from '@/store/uiStore';
import { useToastStore } from '@/components/feedback/toastStore';
import type { Customer } from '@/types/customer';
import { formatCurrency } from '@/utils/currency';
import { formatDateTime } from '@/utils/date';
import { PreOrderModal } from './PreOrderModal';

interface CustomerPreOrderTabProps {
  customer: Customer;
}

export function CustomerPreOrderTab({ customer }: CustomerPreOrderTabProps) {
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPreOrder, setEditingPreOrder] = useState<PreOrder | null>(null);

  const { importPreOrderItem, attachCustomer, items: cartItems } = useCartStore();
  const { setActiveTab } = useUiStore();
  const showToast = useToastStore((s) => s.showToast);

  const loadPreOrders = useCallback(() => {
    setLoading(true);
    preOrderService
      .getPreOrdersByCustomerId(customer.id)
      .then((all) => {
        setPreOrders(all.filter((po) => po.status !== 'completed' && po.status !== 'cancelled'));
      })
      .finally(() => setLoading(false));
  }, [customer.id]);

  useEffect(() => {
    loadPreOrders();
  }, [loadPreOrders]);

  const handleNavigateToCheckoutForNewPreOrder = () => {
    attachCustomer(customer);
    setActiveTab('checkout');
    showToast(`已帶入會員「${customer.name}」，請挑選欲預購商品後點選「轉成預購單」`, 'info');
  };

  const handleOpenEditModal = (po: PreOrder) => {
    setEditingPreOrder(po);
    setModalOpen(true);
  };

  const handleSaved = () => {
    loadPreOrders();
  };

  const handleBringToCheckout = (po: PreOrder) => {
    attachCustomer(customer);

    const itemsToImport = po.items.filter((item) => {
      const available = item.qtyArrived - item.qtyDelivered;
      if (available <= 0) return false;
      const alreadyInCart = cartItems.some(
        (ci) => ci.preOrderId === po.id && ci.preOrderItemId === item.id
      );
      return !alreadyInCart;
    });

    if (itemsToImport.length === 0) {
      const hasAnyAlreadyInCart = po.items.some((i) =>
        cartItems.some((ci) => ci.preOrderId === po.id && ci.preOrderItemId === i.id)
      );
      if (hasAnyAlreadyInCart) {
        setActiveTab('checkout');
        showToast(`此預購單品項已在結帳櫃檯購物車中，無需重複帶入`, 'info');
      } else {
        showToast(`該預購單尚無可提貨之品項`, 'warning');
      }
      return;
    }

    let importedCount = 0;
    for (const item of itemsToImport) {
      const available = item.qtyArrived - item.qtyDelivered;
      importPreOrderItem(po, item, available);
      importedCount += available;
    }

    setActiveTab('checkout');
    showToast(`已成功帶入 ${po.orderNumber} (共 ${importedCount} 台品項) 至結帳櫃檯`, 'success');
  };

  const getStatusBadge = (status: PreOrder['status']) => {
    switch (status) {
      case 'partially_arrived':
        return <Badge color="cyan">★ 部分到貨 (可領取)</Badge>;
      case 'partially_completed':
        return <Badge color="emerald">部分已領取</Badge>;
      case 'pending':
      default:
        return <Badge color="amber">⏳ 等待原廠到貨</Badge>;
    }
  };

  if (loading) {
    return <p className="py-8 text-center text-base text-zinc-500">載入預訂單資料中...</p>;
  }

  return (
    <div className="space-y-4">
      {/* 頁籤頂部操作列 */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
        <h4 className="text-base font-bold text-zinc-200 flex items-center gap-2">
          <span>📋 未結預訂單據</span>
          <span className="font-mono text-xs rounded-full bg-zinc-800 px-2.5 py-0.5 text-cyan-400 font-semibold">
            {preOrders.length}
          </span>
        </h4>
        <Button
          size="md"
          variant="primary"
          onClick={handleNavigateToCheckoutForNewPreOrder}
          className="px-4 py-2 text-sm font-extrabold shadow-md hover:scale-[1.02] transition-transform"
        >
          ➕ 新增預購單
        </Button>
      </div>

      {preOrders.length === 0 ? (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-8 text-center">
          <p className="text-4xl mb-2">📋</p>
          <p className="text-base font-medium text-zinc-400">此會員目前無未結預訂單</p>
          <div className="mt-4">
            <Button size="md" variant="secondary" onClick={handleNavigateToCheckoutForNewPreOrder} className="px-4 py-2 text-sm font-bold">
              + 立即新增此會員的第一筆預購單
            </Button>
          </div>
        </div>
      ) : (
        preOrders.map((po) => {
          const totalOrdered = po.items.reduce((sum, i) => sum + i.qtyOrdered, 0);
          const totalArrived = po.items.reduce((sum, i) => sum + i.qtyArrived, 0);
          const totalDelivered = po.items.reduce((sum, i) => sum + i.qtyDelivered, 0);
          const totalDeliverable = po.items.reduce(
            (sum, i) => sum + Math.max(0, i.qtyArrived - i.qtyDelivered),
            0
          );

          const isFullyImportedToCart =
            totalDeliverable > 0 &&
            po.items
              .filter((i) => i.qtyArrived - i.qtyDelivered > 0)
              .every((i) => cartItems.some((ci) => ci.preOrderId === po.id && ci.preOrderItemId === i.id));

          const progressPercent = totalOrdered > 0 ? Math.round((totalArrived / totalOrdered) * 100) : 0;
          const hasDeliverable = totalDeliverable > 0;

          return (
            <div
              key={po.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 transition-all hover:border-zinc-700 shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3.5">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-bold text-zinc-100">{po.orderNumber}</span>
                    {getStatusBadge(po.status)}
                  </div>
                  <p className="mt-1 font-mono text-sm text-zinc-400">
                    訂單日期：{po.orderDate} {po.expectedArrivalDate && `· 預計到貨：${po.expectedArrivalDate}`}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <Button
                    size="md"
                    variant="secondary"
                    onClick={() => handleOpenEditModal(po)}
                    className="px-4 py-2 text-sm font-bold shadow-sm"
                  >
                    ✏️ 編輯預購單
                  </Button>
                  <Button
                    size="md"
                    variant={hasDeliverable && !isFullyImportedToCart ? 'primary' : 'secondary'}
                    disabled={!hasDeliverable}
                    onClick={() => handleBringToCheckout(po)}
                    className="px-4 py-2 text-sm font-extrabold shadow-md"
                  >
                    {isFullyImportedToCart
                      ? '✓ 已帶入結帳櫃檯'
                      : hasDeliverable
                      ? `📥 帶入結帳櫃檯取貨 (${totalDeliverable} 台可領)`
                      : '尚無到貨品項可提'}
                  </Button>
                </div>
              </div>

              {/* 到貨進度條 */}
              <div className="mt-4 rounded-xl bg-zinc-950/60 p-3 border border-zinc-800/60">
                <div className="flex items-center justify-between text-sm font-mono mb-2">
                  <span className="text-zinc-400 font-medium">總到貨進度</span>
                  <span className={hasDeliverable ? 'text-cyan-400 font-bold' : 'text-zinc-400'}>
                    已到貨 {totalArrived} / 預訂 {totalOrdered} 台 ({progressPercent}%)
                    {totalDelivered > 0 && ` (已領取 ${totalDelivered} 台)`}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, progressPercent)}%` }}
                  />
                </div>
              </div>

              {/* 品項詳細列表 */}
              <div className="mt-4 space-y-2.5">
                {po.items.map((item) => {
                  const itemDeliverable = Math.max(0, item.qtyArrived - item.qtyDelivered);
                  const isItemInCart = cartItems.some(
                    (ci) => ci.preOrderId === po.id && ci.preOrderItemId === item.id
                  );

                  return (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/90 p-3.5 text-sm gap-3"
                    >
                      <div className="flex-1 min-w-[240px]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-bold text-cyan-400">{item.sku}</span>
                          <span className="text-sm text-zinc-400">· {item.brand} ({item.scale})</span>
                        </div>
                        <p className="font-semibold text-base text-zinc-100 mt-1">{item.productName}</p>
                      </div>

                      <div className="flex items-center gap-5 font-mono text-right shrink-0">
                        <div>
                          <p className="text-xs text-zinc-400">預訂報價</p>
                          <p className="font-bold text-base text-zinc-100">{formatCurrency(item.quotedPrice)}</p>
                        </div>
                        <div className="pl-4 border-l border-zinc-800">
                          <p className="text-xs text-zinc-400">數量進度</p>
                          <p className="text-sm text-zinc-200">
                            已到 <span className="font-bold text-base text-cyan-300">{item.qtyArrived}</span> / 預訂 {item.qtyOrdered}
                            {item.qtyDelivered > 0 && <span className="text-zinc-500"> (領 {item.qtyDelivered})</span>}
                          </p>
                        </div>
                        {itemDeliverable > 0 && (
                          <div className="flex items-center gap-1.5">
                            {isItemInCart ? (
                              <span className="rounded-lg bg-cyan-950 px-2.5 py-1 text-xs font-bold text-cyan-300 border border-cyan-700">
                                ✓ 已在結帳單
                              </span>
                            ) : (
                              <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/40">
                                可領 {itemDeliverable} 台
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 備註與唯讀稽核欄位 */}
              <div className="mt-3.5 pt-2.5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between text-xs font-mono text-zinc-400 gap-2">
                <div>
                  {po.note && (
                    <span className="text-amber-300 bg-amber-950/30 rounded px-2 py-1 border border-amber-900/40 font-sans mr-2">
                      💬 備註：{po.note}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-zinc-500 select-none">
                  <span>👤 經手人：<span className="text-zinc-300 font-medium">{po.operatorName || '店長 Fred'}</span></span>
                  <span>·</span>
                  <span>🕒 編輯時間：<span className="text-zinc-300 font-medium">{formatDateTime(po.updatedAt)}</span></span>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* 預購單新增/編輯 Modal */}
      <PreOrderModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        customer={customer}
        preOrder={editingPreOrder}
        onSaved={handleSaved}
      />
    </div>
  );
}
