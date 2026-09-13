import { useState, useRef, useEffect, useMemo } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import type { Product, StockLocation } from '@/types/product';
import type { StockItemAdjustment } from '@/types/inventory';
import { productService } from '@/services';
import { useToastStore } from '@/components/feedback/toastStore';
import { useLocations } from '../hooks/useLocations';

interface RestockModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (adjustments: StockItemAdjustment[]) => void;
}

interface RestockItem {
  product: Product;
  targetLocation: StockLocation;
  restockQty: number;
}

interface ProductGroup {
  groupKey: string;
  barcode: string;
  brand: string;
  name: string;
  items: Product[];
}

export function RestockModal({ open, onClose, onSuccess }: RestockModalProps) {
  const showToast = useToastStore((s) => s.showToast);
  const { locations: apiLocations } = useLocations();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [matchedProducts, setMatchedProducts] = useState<Product[]>([]);
  const [selectedGroupKey, setSelectedGroupKey] = useState<string>('');
  const [selectedProductMap, setSelectedProductMap] = useState<Record<string, string>>({});

  const [targetLocation, setTargetLocation] = useState<StockLocation>('warehouse');
  const [quantity, setQuantity] = useState('1');

  const [restockBatch, setRestockBatch] = useState<RestockItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchReqIdRef = useRef(0);

  // 1. 將搜尋結果依照 barcode 分組 (完整條碼相同才併入同一組)
  const productGroups = useMemo(() => {
    const groups: ProductGroup[] = [];
    const map = new Map<string, ProductGroup>();

    for (const p of matchedProducts) {
      const key = p.barcode ? `barcode-${p.barcode}` : `id-${p.id}`;
      if (!map.has(key)) {
        const newGroup: ProductGroup = {
          groupKey: key,
          barcode: p.barcode,
          brand: p.brand,
          name: p.name,
          items: [p],
        };
        map.set(key, newGroup);
        groups.push(newGroup);
      } else {
        map.get(key)!.items.push(p);
      }
    }
    return groups;
  }, [matchedProducts]);

  // 當分組變化時，同步設定目前選取的 groupKey
  useEffect(() => {
    if (productGroups.length > 0) {
      const exists = productGroups.some((g) => g.groupKey === selectedGroupKey);
      if (!exists) {
        setSelectedGroupKey(productGroups[0].groupKey);
      }
    } else {
      setSelectedGroupKey('');
    }
  }, [productGroups, selectedGroupKey]);

  // 當前選中的群組與該群組下選中的商品
  const activeGroup = productGroups.find((g) => g.groupKey === selectedGroupKey) || productGroups[0] || null;
  const activeProductId = activeGroup
    ? selectedProductMap[activeGroup.groupKey] || activeGroup.items[0]?.id
    : '';
  const selectedProduct = activeGroup
    ? activeGroup.items.find((p) => p.id === activeProductId) || activeGroup.items[0] || null
    : null;

  // 動態獲取可用進貨地點（API 優先 + 商品 stocks 聚合）
  const dynamicLocationOptions = useMemo(() => {
    const map = new Map<string, string>();
    if (apiLocations && apiLocations.length > 0) {
      apiLocations.forEach((l) => {
        if (l.isActive !== false) {
          const locKey = l.id;
          map.set(locKey, l.name);
        }
      });
    }
    if (selectedProduct?.stocks) {
      selectedProduct.stocks.forEach((s) => {
        if (s.location && !map.has(s.location)) {
          map.set(s.location, s.locationName || s.location);
        }
      });
    }
    if (map.size === 0) {
      map.set('warehouse', '後方倉庫');
      map.set('store', '門市現貨');
      map.set('company', '公司總倉');
      map.set('other', '調度暫存');
    }
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [apiLocations, selectedProduct]);

  useEffect(() => {
    if (open) {
      setBarcodeInput('');
      setMatchedProducts([]);
      setSelectedGroupKey('');
      setSelectedProductMap({});
      setRestockBatch([]);
      setTimeout(() => inputRef.current?.focus(), 100);

      // 載入全域商品以供待入庫清單比對同條碼其他貨號
      productService
        .searchProducts({})
        .then(setAllProducts)
        .catch(() => {});
    }
  }, [open]);

  // 當切換商品時，若當前 targetLocation 不在該商品據點中，自動設為第一個據點
  useEffect(() => {
    if (dynamicLocationOptions.length > 0) {
      const exists = dynamicLocationOptions.some((l) => l.value === targetLocation);
      if (!exists) {
        setTargetLocation(dynamicLocationOptions[0].value);
      }
    }
  }, [dynamicLocationOptions, targetLocation]);

  // 搜尋條碼或關鍵字匹配之商品
  const handleBarcodeSearch = async (val: string) => {
    setBarcodeInput(val);
    const query = val.trim();
    if (!query) {
      setMatchedProducts([]);
      return;
    }

    const reqId = ++searchReqIdRef.current;
    try {
      const results = await productService.searchProducts({ keyword: query });
      if (reqId === searchReqIdRef.current) {
        setMatchedProducts(results);
      }
    } catch {
      // ignore
    }
  };

  const handleProcessBarcode = async (directQuery?: string) => {
    const query = (directQuery !== undefined ? directQuery : barcodeInput).trim();
    if (!query && !selectedProduct) {
      showToast('請先掃描或輸入條碼/貨號', 'error');
      return;
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      showToast('請輸入正確的進貨數量', 'error');
      return;
    }

    let targetProduct: Product | undefined = selectedProduct ?? undefined;

    // 若尚未匹配到商品（例如條碼槍瞬間送出 Enter），立即執行即時搜尋
    if (!targetProduct && query) {
      try {
        const results = await productService.searchProducts({ keyword: query });
        if (results.length === 0) {
          showToast(`❌ 找不到條碼/貨號「${query}」對應的商品`, 'error');
          return;
        }
        setMatchedProducts(results);
        targetProduct = results[0];
      } catch {
        showToast('搜尋商品失敗，請重試', 'error');
        return;
      }
    }

    if (!targetProduct) {
      showToast('請先掃描或選擇進貨商品', 'error');
      return;
    }

    // 加入進貨批次清單
    setRestockBatch((prev) => {
      const idx = prev.findIndex(
        (item) => item.product.id === targetProduct!.id && item.targetLocation === targetLocation
      );
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], restockQty: next[idx].restockQty + qty };
        return next;
      }
      return [...prev, { product: targetProduct!, targetLocation, restockQty: qty }];
    });

    showToast(`➕ 已加入進貨: ${targetProduct.sku} (${qty}台)`, 'success');
    setBarcodeInput('');
    setMatchedProducts([]);
    setQuantity('1');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const currentQty = Number(quantity) || 1;
      setQuantity(String(currentQty + 1));
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const currentQty = Number(quantity) || 1;
      setQuantity(String(Math.max(1, currentQty - 1)));
      return;
    }

    // 如果目前選取的群組有多個同條碼 SKU，支援 ArrowUp / ArrowDown 切換
    if (activeGroup && activeGroup.items.length > 1) {
      const currentIndex = activeGroup.items.findIndex((p) => p.id === activeProductId);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = currentIndex < 0 ? 0 : Math.min(activeGroup.items.length - 1, currentIndex + 1);
        setSelectedProductMap((prev) => ({
          ...prev,
          [activeGroup.groupKey]: activeGroup.items[nextIndex].id,
        }));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = currentIndex < 0 ? 0 : Math.max(0, currentIndex - 1);
        setSelectedProductMap((prev) => ({
          ...prev,
          [activeGroup.groupKey]: activeGroup.items[prevIndex].id,
        }));
        return;
      }
    } else if (productGroups.length > 1) {
      const currentGroupIdx = productGroups.findIndex((g) => g.groupKey === selectedGroupKey);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIdx = Math.min(productGroups.length - 1, currentGroupIdx + 1);
        setSelectedGroupKey(productGroups[nextIdx].groupKey);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIdx = Math.max(0, currentGroupIdx - 1);
        setSelectedGroupKey(productGroups[prevIdx].groupKey);
        return;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      handleProcessBarcode();
    }
  };

  const handleRemoveBatchItem = (index: number) => {
    setRestockBatch((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBatchQtyChange = (index: number, newQty: number) => {
    setRestockBatch((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], restockQty: Math.max(1, newQty) };
      return next;
    });
  };

  const handleSwitchBatchProduct = (index: number, newProduct: Product) => {
    setRestockBatch((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], product: newProduct };
      return next;
    });
    showToast(`🔄 已將進貨項目切換為: ${newProduct.sku}`, 'info');
  };

  const handleConfirmRestock = async () => {
    if (restockBatch.length === 0) {
      showToast('進貨批次清單為空', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const adjustments: StockItemAdjustment[] = restockBatch.map((item) => {
        const origQty = item.product.stocks.find((s) => s.location === item.targetLocation)?.quantity ?? 0;
        const newQty = origQty + item.restockQty;
        const locName =
          item.product.stocks.find((s) => s.location === item.targetLocation)?.locationName ||
          item.targetLocation;

        return {
          productId: item.product.id,
          sku: item.product.sku,
          barcode: item.product.barcode,
          name: item.product.name,
          brand: item.product.brand,
          changes: [
            {
              location: item.targetLocation,
              locationName: locName,
              oldQty: origQty,
              newQty,
              diff: item.restockQty,
            },
          ],
          summaryText: `${locName}進貨 +${item.restockQty} 台`,
        };
      });

      await productService.batchAdjustStock({
        adjustments,
        operatorName: 'Fred',
        timestamp: new Date().toISOString(),
        note: '快速條碼進貨入庫',
      });

      showToast(`🎉 成功完成 ${restockBatch.length} 項商品進貨入庫！`, 'success');
      onSuccess(adjustments);
      onClose();
    } catch {
      showToast('進貨處理失敗，請再試一次', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="📥 快速條碼進貨模式" widthClassName="max-w-3xl">
      <div className="space-y-4 text-base">
        {/* 條碼掃描與 SKU 選擇區 */}
        <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-1 relative">
              <label className="mb-1 block text-xs font-semibold text-cyan-300">
                1. 掃描或輸入國際條碼 / 貨號 (Enter 自動加入) *
              </label>
              <Input
                ref={inputRef}
                monospace
                value={barcodeInput}
                onChange={(e) => handleBarcodeSearch(e.target.value)}
                onKeyDown={handleBarcodeKeyDown}
                placeholder="🔍 掃碼槍掃描條碼 (掃完自動 Enter 加入)..."
                className="text-lg font-bold border-cyan-500/50"
              />
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-mono text-zinc-400">
                <span className="whitespace-nowrap">💡 <strong className="text-amber-300">⬆️/⬇️</strong> 切換品項</span>
                <span className="text-zinc-600 font-bold font-sans">•</span>
                <span className="whitespace-nowrap"><strong className="text-emerald-300">⬅️/➡️</strong> 增減數量</span>
                <span className="text-zinc-600 font-bold font-sans">•</span>
                <span className="whitespace-nowrap"><strong className="text-cyan-300">Enter</strong> 加入進貨</span>
              </div>
            </div>
            <div className="w-44">
              <label className="mb-1 block text-xs font-semibold text-zinc-300">2. 進貨目標地點</label>
              <select
                value={targetLocation}
                onChange={(e) => setTargetLocation(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-base text-zinc-100 focus:border-cyan-400 focus:outline-none"
              >
                {dynamicLocationOptions.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-28">
              <label className="mb-1 block text-xs font-semibold text-zinc-300">3. 數量</label>
              <Input
                monospace
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="text-lg font-bold text-center"
              />
            </div>
          </div>

          {/* 條碼匹配結果與選擇區 */}
          <div className="min-h-[140px] rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 flex flex-col justify-center">
            {productGroups.length === 0 ? (
              <div className="flex h-24 flex-col items-center justify-center text-zinc-500 font-mono text-sm">
                <span className="text-2xl mb-1">🔍</span>
                <span>請於上方掃描條碼或輸入貨號 SKU</span>
                <span className="text-xs text-zinc-600 mt-0.5">條碼機掃描完成後按 Enter 會自動加入進貨批次清單</span>
              </div>
            ) : productGroups.length === 1 ? (
              /* 單一條碼/商品匹配 */
              <div className="space-y-3">
                {activeGroup && activeGroup.items.length > 1 && (
                  <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 space-y-1.5 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-amber-300 flex items-center gap-1">
                        <span>⚠️ 此條碼對應到 {activeGroup.items.length} 項不同貨號 (SKU)，請下拉選擇：</span>
                      </label>
                      <span className="text-[11px] font-mono text-amber-400 font-semibold bg-zinc-900 px-2 py-0.5 rounded border border-amber-600/40">
                        共 {activeGroup.items.length} 個貨號
                      </span>
                    </div>
                    <select
                      value={activeProductId}
                      onChange={(e) =>
                        setSelectedProductMap((prev) => ({
                          ...prev,
                          [activeGroup.groupKey]: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-amber-400/60 bg-zinc-900 px-3 py-2 text-sm font-mono font-bold text-amber-200 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 truncate"
                    >
                      {activeGroup.items.map((p) => (
                        <option key={p.id} value={p.id}>
                          [{p.sku}] {p.spec || p.name} {p.scale ? `(${p.scale})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 選定商品的資訊卡片 */}
                {selectedProduct && (
                  <div className="rounded-lg border border-zinc-700/80 bg-zinc-900/90 p-3 space-y-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-bold text-zinc-300">
                          {selectedProduct.brand}
                        </span>
                        <p className="font-mono text-lg font-bold text-cyan-400">{selectedProduct.sku}</p>
                      </div>
                      <p className="text-base font-bold text-zinc-100 mt-1">{selectedProduct.name}</p>
                      <p className="text-xs text-zinc-400 mt-0.5 flex flex-wrap items-center gap-2">
                        {selectedProduct.scale && (
                          <span>比例: <strong className="text-zinc-200">{selectedProduct.scale}</strong></span>
                        )}
                        {selectedProduct.spec && (
                          <span>規格: <strong className="text-zinc-200">{selectedProduct.spec}</strong></span>
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-zinc-400 pt-1.5 border-t border-zinc-800/80">
                      <span className="text-zinc-500 font-sans">現有庫存：</span>
                      {selectedProduct.stocks.map((s) => (
                        <span key={s.location} className="inline-flex items-center gap-1 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                          <span className="text-zinc-400">{s.locationName}:</span>
                          <strong className={s.quantity > 0 ? 'text-emerald-400 font-bold' : 'text-zinc-400'}>
                            {s.quantity}
                          </strong>
                          <span className="text-zinc-500">台</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* 搜尋關鍵字匹配多筆不同條碼/商品：用卷軸列出所有選項 */
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>🔍 找到 {productGroups.length} 組符合搜尋的品項（點擊選取或按 Enter 加入）：</span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-zinc-900 [&::-webkit-scrollbar-thumb]:bg-zinc-700">
                  {productGroups.map((group) => {
                    const isSelectedGroup = group.groupKey === selectedGroupKey;
                    const groupSelectedId = selectedProductMap[group.groupKey] || group.items[0].id;
                    const groupProduct = group.items.find((i) => i.id === groupSelectedId) || group.items[0];
                    const hasMultipleSkus = group.items.length > 1;

                    return (
                      <div
                        key={group.groupKey}
                        onClick={() => setSelectedGroupKey(group.groupKey)}
                        className={`cursor-pointer rounded-lg border p-2.5 transition-all ${
                          isSelectedGroup
                            ? 'border-cyan-400 bg-cyan-950/40 text-zinc-100 ring-1 ring-cyan-400'
                            : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-850'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[11px] font-bold text-zinc-300 shrink-0">
                              {group.brand}
                            </span>
                            <span className="font-mono text-cyan-300 font-bold text-sm shrink-0">
                              {groupProduct.sku}
                            </span>
                            <span className="text-sm font-medium text-zinc-200 truncate">
                              {groupProduct.name}
                            </span>
                          </div>
                          {group.barcode && (
                            <span className="font-mono text-[11px] text-amber-300/80 shrink-0">
                              🏷️ {group.barcode}
                            </span>
                          )}
                        </div>

                        {/* 若該組為同條碼多貨號，提供下拉選單切換 */}
                        {hasMultipleSkus && (
                          <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={groupSelectedId}
                              onChange={(e) => {
                                setSelectedProductMap((prev) => ({
                                  ...prev,
                                  [group.groupKey]: e.target.value,
                                }));
                              }}
                              className="w-full rounded border border-amber-500/60 bg-zinc-900 px-2 py-1 text-xs font-mono font-bold text-amber-200 focus:border-cyan-400 focus:outline-none truncate"
                            >
                              {group.items.map((item) => (
                                <option key={item.id} value={item.id}>
                                  [{item.sku}] {item.spec || item.name} {item.scale ? `(${item.scale})` : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <Button
              variant="primary"
              onClick={() => handleProcessBarcode()}
              disabled={!barcodeInput.trim() && !selectedProduct}
              className="bg-cyan-500 text-zinc-950 font-bold px-4 py-2"
            >
              ➕ 加入進貨批次清單 (Enter)
            </Button>
          </div>
        </div>

        {/* 待入庫進貨批次清單 (同條碼多貨號支援下拉切換) */}
        <div>
          <h4 className="text-sm font-semibold text-zinc-300 mb-2 flex items-center justify-between">
            <span>📦 待入庫進貨批次清單 ({restockBatch.length} 項)</span>
            {restockBatch.length > 0 && (
              <button
                onClick={() => setRestockBatch([])}
                className="text-xs text-zinc-400 hover:text-rose-400 underline"
              >
                清空批次
              </button>
            )}
          </h4>

          {restockBatch.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-zinc-800 text-zinc-500">
              請在上方掃描條碼或輸入貨號加入進貨項目 (支援掃碼槍連續 Enter 掃描)
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 divide-y divide-zinc-800/80 pr-1 [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-zinc-900 [&::-webkit-scrollbar-track]:rounded-lg [&::-webkit-scrollbar-thumb]:bg-cyan-500/80 [&::-webkit-scrollbar-thumb]:rounded-lg hover:[&::-webkit-scrollbar-thumb]:bg-cyan-400">
              {restockBatch.map((item, idx) => {
                // 比對全域商品中具有相同條碼的兄弟 SKU
                const siblingProducts = item.product.barcode
                  ? allProducts.filter((p) => p.barcode === item.product.barcode)
                  : [];
                const hasMultipleSkus = siblingProducts.length > 1;

                return (
                  <div
                    key={`${item.product.id}-${item.targetLocation}`}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-zinc-900/50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-xs text-amber-300 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded font-medium whitespace-nowrap">
                        🏷️ {item.product.barcode || '無條碼'}
                      </span>

                      {/* 若有同條碼多貨號，提供下拉選單隨時切換 */}
                      {hasMultipleSkus ? (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={item.product.id}
                            onChange={(e) => {
                              const newProduct = siblingProducts.find((p) => p.id === e.target.value);
                              if (newProduct) {
                                handleSwitchBatchProduct(idx, newProduct);
                              }
                            }}
                            className="rounded-lg border border-cyan-500/60 bg-zinc-900 px-2 py-1 text-xs font-mono font-bold text-cyan-200 focus:border-cyan-400 focus:outline-none max-w-[220px] truncate"
                            title="同條碼切換不同貨號"
                          >
                            {siblingProducts.map((p) => (
                              <option key={p.id} value={p.id}>
                                [{p.sku}] {p.spec || p.name} {p.scale ? `(${p.scale})` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span className="font-mono text-cyan-400 font-bold text-base whitespace-nowrap">
                          {item.product.sku}
                        </span>
                      )}

                      <span className="text-zinc-200 text-sm truncate max-w-xs">{item.product.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-emerald-400 bg-emerald-950 border border-emerald-800/60 px-2 py-0.5 rounded font-medium whitespace-nowrap">
                        ➔ {item.product.stocks.find((s) => s.location === item.targetLocation)?.locationName || item.targetLocation}
                      </span>

                      <div className="flex items-center gap-1">
                        <span className="text-xs text-zinc-400">進貨:</span>
                        <input
                          type="number"
                          min={1}
                          value={item.restockQty}
                          onChange={(e) => handleBatchQtyChange(idx, Number(e.target.value))}
                          className="w-16 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-center font-mono font-bold text-emerald-300"
                        />
                        <span className="text-xs text-zinc-400">台</span>
                      </div>

                      <button
                        onClick={() => handleRemoveBatchItem(idx)}
                        className="text-zinc-500 hover:text-rose-400 p-1"
                        title="移除此項"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmRestock}
            disabled={isSubmitting || restockBatch.length === 0}
            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-5"
          >
            {isSubmitting ? '寫入進貨庫存中...' : '✅ 確認完成進貨 (產生理貨單)'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
