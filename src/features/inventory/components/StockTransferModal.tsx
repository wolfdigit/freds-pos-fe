import { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import type { Product, StockLocation } from '@/types/product';
import { useToastStore } from '@/components/feedback/toastStore';

interface StockTransferModalProps {
  product: Product | null;
  currentDrafts?: Record<StockLocation, number>;
  onClose: () => void;
  onApplyTransfer: (
    productId: string,
    fromLocation: StockLocation,
    toLocation: StockLocation,
    quantity: number
  ) => void;
}

const LOCATIONS: { value: StockLocation; label: string; icon: string }[] = [
  { value: 'store', label: '門市現貨', icon: '🏪' },
  { value: 'warehouse', label: '後方倉庫', icon: '📦' },
  { value: 'company', label: '公司總倉', icon: '🏢' },
  { value: 'other', label: '調度暫存', icon: '🚚' },
];

export function StockTransferModal({
  product,
  currentDrafts,
  onClose,
  onApplyTransfer,
}: StockTransferModalProps) {
  const showToast = useToastStore((s) => s.showToast);
  const [fromLocation, setFromLocation] = useState<StockLocation>('warehouse');
  const [toLocation, setToLocation] = useState<StockLocation>('store');
  const [quantity, setQuantity] = useState('1');

  // 每次打開或更換商品時重置欄位
  useEffect(() => {
    if (product) {
      setFromLocation('warehouse');
      setToLocation('store');
      setQuantity('1');
    }
  }, [product]);

  if (!product) return null;

  const getQty = (loc: StockLocation) => {
    if (currentDrafts && currentDrafts[loc] !== undefined) {
      return currentDrafts[loc];
    }
    return product.stocks.find((s) => s.location === loc)?.quantity ?? 0;
  };

  const handleConfirm = () => {
    const qty = Number(quantity);
    if (qty <= 0) return;
    const avail = getQty(fromLocation);
    if (avail < qty) {
      showToast(`${fromLocation} 庫存不足，無法調撥`, 'error');
      return;
    }

    onApplyTransfer(product.id, fromLocation, toLocation, qty);
    showToast('✨ 已將單項調撥暫存至編輯清單（請點擊儲存庫存變更存檔）', 'info');
    onClose();
  };

  return (
    <Modal open={!!product} onClose={onClose} title={`⇄ 單項庫存調撥：${product.name}`}>
      <div className="space-y-4 text-base">
        {/* 貨號與品名標示 */}
        <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-3">
          <div>
            <span className="font-mono text-cyan-400 font-bold mr-2">{product.sku}</span>
            <span className="text-zinc-200 font-medium">{product.name}</span>
          </div>
          <span className="text-sm font-mono text-zinc-400">總庫存: {product.totalStock} 台</span>
        </div>

        {/* 兩地選擇 (直列卡片，無須下拉選單) */}
        <div className="grid grid-cols-2 gap-4">
          {/* 來源地點直列 */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-amber-400">
              1. 選擇來源地點 (From)
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {LOCATIONS.map((l) => {
                const qty = getQty(l.value);
                const isSelected = fromLocation === l.value;

                return (
                  <div
                    key={`from-${l.value}`}
                    onClick={() => setFromLocation(l.value)}
                    className={`cursor-pointer rounded-xl border p-3 flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950/40 text-amber-300 ring-1 ring-amber-400'
                        : 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-850'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{l.icon}</span>
                      <span className="font-medium text-base">{l.label}</span>
                    </div>
                    <span
                      className={`font-mono text-base font-bold ${
                        qty > 0 ? 'text-emerald-400' : 'text-zinc-500'
                      }`}
                    >
                      {qty} 台
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 目標地點直列 */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-cyan-400">
              2. 選擇目標地點 (To)
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {LOCATIONS.map((l) => {
                const qty = getQty(l.value);
                const isSelected = toLocation === l.value;
                const isSameAsFrom = fromLocation === l.value;

                return (
                  <div
                    key={`to-${l.value}`}
                    onClick={() => !isSameAsFrom && setToLocation(l.value)}
                    className={`rounded-xl border p-3 flex items-center justify-between transition-all ${
                      isSameAsFrom
                        ? 'opacity-40 cursor-not-allowed border-zinc-800 bg-zinc-950 text-zinc-600'
                        : isSelected
                        ? 'cursor-pointer border-cyan-400 bg-cyan-950/40 text-cyan-300 ring-1 ring-cyan-400'
                        : 'cursor-pointer border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-850'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{l.icon}</span>
                      <span className="font-medium text-base">{l.label}</span>
                    </div>
                    <span className="font-mono text-base font-bold text-zinc-300">
                      {qty} 台
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 調撥數量 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">3. 調撥數量</label>
          <Input
            monospace
            type="number"
            min={1}
            max={getQty(fromLocation)}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="text-lg font-bold"
          />
          {getQty(fromLocation) < Number(quantity) && (
            <p className="mt-1 text-xs text-rose-400">⚠️ 來源地點數量不足可調撥配額</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={
              fromLocation === toLocation ||
              Number(quantity) <= 0 ||
              getQty(fromLocation) < Number(quantity)
            }
          >
            套用至編輯列表
          </Button>
        </div>
      </div>
    </Modal>
  );
}
