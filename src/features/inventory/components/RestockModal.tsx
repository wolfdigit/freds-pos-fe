import { useState, useRef, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import type { Product, StockLocation } from '@/types/product';
import type { StockItemAdjustment } from '@/types/inventory';
import { productService } from '@/services';
import { useToastStore } from '@/components/feedback/toastStore';

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

const LOCATION_OPTIONS: { value: StockLocation; label: string }[] = [
  { value: 'store', label: '門市現貨' },
  { value: 'warehouse', label: '後方倉庫' },
  { value: 'company', label: '公司總倉' },
];

export function RestockModal({ open, onClose, onSuccess }: RestockModalProps) {
  const showToast = useToastStore((s) => s.showToast);

  const [barcodeInput, setBarcodeInput] = useState('');
  const [matchedProducts, setMatchedProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  const [targetLocation, setTargetLocation] = useState<StockLocation>('warehouse');
  const [quantity, setQuantity] = useState('1');

  const [restockBatch, setRestockBatch] = useState<RestockItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setBarcodeInput('');
      setMatchedProducts([]);
      setSelectedProductId('');
      setRestockBatch([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  if (!open) return null;

  // 搜尋條碼匹配之商品
  const handleBarcodeSearch = async (val: string) => {
    setBarcodeInput(val);
    const query = val.trim();
    if (!query) {
      setMatchedProducts([]);
      setSelectedProductId('');
      return;
    }

    const results = await productService.searchProducts({ keyword: query });
    setMatchedProducts(results);
    if (results.length > 0) {
      setSelectedProductId(results[0].id);
    } else {
      setSelectedProductId('');
    }
  };

  const handleAddRestockItem = () => {
    if (!selectedProductId) {
      showToast('請先掃描或選擇進貨商品', 'error');
      return;
    }
    const targetProduct = matchedProducts.find((p) => p.id === selectedProductId);
    if (!targetProduct) return;

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      showToast('請輸入正確的進貨數量', 'error');
      return;
    }

    // 檢查是否已在批次清單中
    setRestockBatch((prev) => {
      const idx = prev.findIndex(
        (item) => item.product.id === targetProduct.id && item.targetLocation === targetLocation
      );
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], restockQty: next[idx].restockQty + qty };
        return next;
      }
      return [...prev, { product: targetProduct, targetLocation, restockQty: qty }];
    });

    showToast(`➕ 已加入進貨: ${targetProduct.sku} (${qty}台)`, 'success');
    setBarcodeInput('');
    setMatchedProducts([]);
    setSelectedProductId('');
    setQuantity('1');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const selectedCardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selectedCardRef.current) {
      selectedCardRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedProductId]);

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

    if (matchedProducts.length > 1) {
      const currentIndex = matchedProducts.findIndex((p) => p.id === selectedProductId);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = currentIndex < 0 ? 0 : Math.min(matchedProducts.length - 1, currentIndex + 1);
        setSelectedProductId(matchedProducts[nextIndex].id);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = currentIndex < 0 ? 0 : Math.max(0, currentIndex - 1);
        setSelectedProductId(matchedProducts[prevIndex].id);
        return;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedProductId) {
        handleAddRestockItem();
      }
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
        const locName = LOCATION_OPTIONS.find((l) => l.value === item.targetLocation)?.label || item.targetLocation;

        return {
          productId: item.product.id,
          sku: item.product.sku,
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
    } catch (err) {
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
                onChange={(e) => setTargetLocation(e.target.value as StockLocation)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-base text-zinc-100 focus:border-cyan-400 focus:outline-none"
              >
                {LOCATION_OPTIONS.map((l) => (
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

        {/* 條碼匹配結果與選擇區 (固定高度 h-[240px]，4.5 列可見，顯眼青色卷軸) */}
        <div className="h-[240px] rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 flex flex-col justify-center">
          {matchedProducts.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-zinc-500 font-mono text-sm">
              <span className="text-2xl mb-1">🔍</span>
              <span>請於上方掃描條碼或輸入貨號 SKU</span>
              <span className="text-xs text-zinc-600 mt-1">條碼機掃描完成後按 Enter 會自動加入進貨批次清單</span>
            </div>
          ) : matchedProducts.length === 1 ? (
            <div className="flex flex-col justify-between h-full rounded-lg border border-cyan-500/40 bg-cyan-950/20 p-3.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-amber-300 bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-md font-bold">
                  🏷️ {matchedProducts[0].barcode || '無條碼'}
                </span>
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-950 border border-emerald-800 px-2.5 py-1 rounded-md">
                  ✓ 已鎖定匹配商品
                </span>
              </div>
              <div>
                <p className="font-mono text-xl font-bold text-cyan-400">{matchedProducts[0].sku}</p>
                <p className="text-base font-bold text-zinc-100 mt-0.5">{matchedProducts[0].name}</p>
                <p className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
                  <span>廠牌: <strong className="text-zinc-200">{matchedProducts[0].brand}</strong></span>
                  <span>|</span>
                  <span>比例: <strong className="text-zinc-200">{matchedProducts[0].scale}</strong></span>
                  {matchedProducts[0].material && (
                    <>
                      <span>|</span>
                      <span>材質: <strong className="text-zinc-200">{matchedProducts[0].material}</strong></span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pt-2 border-t border-zinc-800/80">
                <span>現有門市: <strong className="text-emerald-400">{matchedProducts[0].stocks.find((s) => s.location === 'store')?.quantity ?? 0}</strong> 台</span>
                <span>後方倉庫: <strong className="text-zinc-200">{matchedProducts[0].stocks.find((s) => s.location === 'warehouse')?.quantity ?? 0}</strong> 台</span>
                <span>公司總倉: <strong className="text-zinc-200">{matchedProducts[0].stocks.find((s) => s.location === 'company')?.quantity ?? 0}</strong> 台</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full space-y-2 min-h-0">
              <label className="block text-xs font-bold text-amber-300 flex-shrink-0">
                ⚠️ 此條碼對應到 {matchedProducts.length} 項不同貨號 (SKU)，請點選正確進貨品項：
              </label>
              {/* 高度剛好可見 4.5 列卡片，且具備高對比顯眼青色卷軸 */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 h-[190px] [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-zinc-900 [&::-webkit-scrollbar-track]:rounded-lg [&::-webkit-scrollbar-thumb]:bg-cyan-500/80 [&::-webkit-scrollbar-thumb]:rounded-lg hover:[&::-webkit-scrollbar-thumb]:bg-cyan-400">
                {matchedProducts.map((p) => {
                  const isSelected = selectedProductId === p.id;
                  return (
                    <div
                      key={p.id}
                      ref={(el) => {
                        if (isSelected) selectedCardRef.current = el;
                      }}
                      onClick={() => setSelectedProductId(p.id)}
                      className={`cursor-pointer rounded-xl border p-2.5 flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300 ring-1 ring-cyan-400'
                          : 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-850'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-xs text-amber-300 bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded font-medium whitespace-nowrap">
                          🏷️ {p.barcode || '無條碼'}
                        </span>
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-bold text-zinc-300 whitespace-nowrap">
                          {p.brand}
                        </span>
                        <span className="font-mono text-base font-bold text-cyan-400 whitespace-nowrap">
                          {p.sku}
                        </span>
                        <span className="text-sm text-zinc-200 truncate">{p.name} ({p.scale})</span>
                      </div>
                      <span className="text-base ml-2">
                        {isSelected ? '🟢' : '🔘'}
                      </span>
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
              onClick={handleAddRestockItem}
              disabled={!selectedProductId}
              className="bg-cyan-500 text-zinc-950 font-bold px-4 py-2"
            >
              ➕ 加入進貨批次清單 (Enter)
            </Button>
          </div>
        </div>

        {/* 進貨批次清單 (顯式呈現完整條碼) */}
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
              {restockBatch.map((item, idx) => (
                <div key={`${item.product.id}-${item.targetLocation}`} className="p-3 flex items-center justify-between gap-3 hover:bg-zinc-900/50">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs text-amber-300 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded font-medium whitespace-nowrap">
                      🏷️ {item.product.barcode || '無條碼'}
                    </span>
                    <span className="font-mono text-cyan-400 font-bold text-base whitespace-nowrap">{item.product.sku}</span>
                    <span className="text-zinc-200 text-sm truncate max-w-xs">{item.product.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-emerald-400 bg-emerald-950 border border-emerald-800/60 px-2 py-0.5 rounded font-medium whitespace-nowrap">
                      ➔ {LOCATION_OPTIONS.find((l) => l.value === item.targetLocation)?.label}
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
              ))}
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
