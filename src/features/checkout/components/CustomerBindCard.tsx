import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/common/Badge';
import { useCartStore } from '@/store/cartStore';
import { useUiStore } from '@/store/uiStore';
import { customerService, preOrderService } from '@/services';
import { useToastStore } from '@/components/feedback/toastStore';
import type { Customer } from '@/types/customer';
import type { PreOrder } from '@/types/preorder';

export function CustomerBindCard() {
  const { attachedCustomer, attachCustomer, importPreOrderItem, items } = useCartStore();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Customer[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pendingPreOrders, setPendingPreOrders] = useState<PreOrder[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const showToast = useToastStore((s) => s.showToast);

  // 自動依輸入內容即時搜尋會員下拉選單
  useEffect(() => {
    let cancelled = false;
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      customerService.searchCustomers(trimmed).then((results) => {
        if (!cancelled) {
          setSuggestions(results);
          setIsDropdownOpen(results.length > 0);
        }
      });
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 當綁定客戶變更時，自動查詢其待取貨預購單
  useEffect(() => {
    let cancelled = false;
    if (!attachedCustomer) {
      setPendingPreOrders([]);
      return;
    }

    preOrderService.getPreOrdersByCustomerId(attachedCustomer.id).then((orders) => {
      if (!cancelled) {
        const withAvailableItems = orders
          .map((po) => ({
            ...po,
            items: po.items.filter((i) => i.qtyArrived - i.qtyDelivered > 0),
          }))
          .filter((po) => po.items.length > 0);
        setPendingPreOrders(withAvailableItems);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [attachedCustomer, items]);

  const handleSelectCustomer = (customer: Customer) => {
    attachCustomer(customer);
    setQuery('');
    setIsDropdownOpen(false);
    showToast(`已綁定會員：${customer.name} (已套用 VIP 特價)`, 'success');
  };

  const navigateToCustomer = useUiStore((s) => s.navigateToCustomer);

  const handleImportItem = (po: PreOrder, itemId: string) => {
    const item = po.items.find((i) => i.id === itemId);
    if (!item) return;
    const available = item.qtyArrived - item.qtyDelivered;
    if (available <= 0) return;

    const alreadyInCart = items.some((ci) => ci.preOrderId === po.id && ci.preOrderItemId === item.id);
    if (alreadyInCart) {
      showToast(`預購品項「${item.productName}」已在結帳單中`, 'info');
      return;
    }

    importPreOrderItem(po, item, available);
    showToast(`已帶入預購品項：${item.productName} (${available}台)`, 'success');
  };

  if (attachedCustomer) {
    return (
      <div className="space-y-3 rounded-lg border border-cyan-800/80 bg-cyan-950/30 p-3.5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigateToCustomer(attachedCustomer.id)}
                className="text-lg font-bold text-cyan-200 hover:text-cyan-400 hover:underline flex items-center gap-1.5 transition-colors text-left"
                title="點擊前往客戶會員頁面"
              >
                <span>{attachedCustomer.name}</span>
                <span className="text-xs font-normal text-cyan-400/80">👤 查看會員 →</span>
              </button>
              <Badge color="cyan">{attachedCustomer.vipTierName}</Badge>
            </div>
            <p className="font-mono text-base text-zinc-300 mt-0.5">
              {attachedCustomer.phone} · 點數 <span className="font-bold text-cyan-300">{attachedCustomer.rewardPoints}</span>
            </p>
          </div>
          <button
            onClick={() => attachCustomer(null)}
            className="text-sm font-medium text-zinc-400 hover:text-rose-400 transition-colors px-2 py-1 rounded hover:bg-zinc-900"
          >
            解除綁定
          </button>
        </div>

        {/* 預購未取貨提醒與一鍵帶入 */}
        {pendingPreOrders.length > 0 && (
          <div className="rounded border border-amber-800/60 bg-amber-950/40 p-3 text-base">
            <div className="mb-2 flex items-center justify-between font-semibold text-amber-300">
              <button
                onClick={() => navigateToCustomer(attachedCustomer.id)}
                className="text-base hover:text-amber-200 hover:underline flex items-center gap-1 text-left"
                title="點擊前往預購單明細頁面"
              >
                <span>★ 偵測到可提貨預購品項 (查看單據 →)</span>
              </button>
              <span className="font-mono text-sm text-amber-400">
                {pendingPreOrders.reduce((sum, po) => sum + po.items.length, 0)} 項待取
              </span>
            </div>
            <div className="space-y-2">
              {pendingPreOrders.map((po) =>
                po.items.map((item) => {
                  const available = item.qtyArrived - item.qtyDelivered;
                  const isItemInCart = items.some(
                    (ci) => ci.preOrderId === po.id && ci.preOrderItemId === item.id
                  );
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded bg-zinc-950/80 p-2.5"
                    >
                      <div className="min-w-0 flex-1 truncate">
                        <span className="text-zinc-100 font-medium text-base">{item.productName}</span>
                        <span className="ml-2 font-mono text-amber-400 text-sm">
                          (可取: {available}台 / 預購價 ${item.quotedPrice})
                        </span>
                      </div>
                      <button
                        onClick={() => handleImportItem(po, item.id)}
                        disabled={isItemInCart}
                        className={`rounded px-3 py-1 text-sm font-bold transition-colors whitespace-nowrap ${
                          isItemInCart
                            ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                            : 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
                        }`}
                      >
                        {isItemInCart ? '✓ 已在結帳單' : '+ 帶入結帳'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && suggestions.length > 0 && setIsDropdownOpen(true)}
          placeholder="🔍 輸入電話或姓名查詢會員 (即時自動展開清單)"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 pr-10 font-mono text-base text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsDropdownOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 text-base"
            title="清空會員搜尋"
          >
            ✕
          </button>
        )}
      </div>

      {/* 自動彈出會員下拉列表 */}
      {isDropdownOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl backdrop-blur-md">
          {suggestions.map((cust) => (
            <div
              key={cust.id}
              onClick={() => handleSelectCustomer(cust)}
              className="flex cursor-pointer items-center justify-between border-b border-zinc-800 px-4 py-3 text-base hover:bg-cyan-950/40 hover:text-cyan-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-zinc-100">{cust.name}</span>
                <span className="font-mono text-sm text-zinc-400">{cust.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge color="cyan">{cust.vipTierName}</Badge>
                <span className="font-mono text-xs text-zinc-500">點數 {cust.rewardPoints}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

