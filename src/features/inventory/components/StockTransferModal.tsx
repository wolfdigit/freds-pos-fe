import { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import type { Product } from '@/types/product';
import { inventoryQuantity } from '@/types/product';
import { productService } from '@/services';
import { useToastStore } from '@/components/feedback/toastStore';
import { useLocations } from '../hooks/useLocations';
import { errorMessage } from '@/auth/businessError';

interface StockTransferModalProps {
  product: Product | null;
  onClose: () => void;
  onTransferred: () => void;
}

export function StockTransferModal({ product, onClose, onTransferred }: StockTransferModalProps) {
  const showToast = useToastStore((s) => s.showToast);
  const { locations: apiLocations } = useLocations();
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [submitting, setSubmitting] = useState(false);

  const locations = useMemo(() => {
    const map = new Map<string, { value: string; label: string; icon: string }>();
    apiLocations.forEach((location) => {
      map.set(location.id, {
        value: location.id,
        label: location.name,
        icon: location.icon || '📍',
      });
    });
    product?.inventories.forEach((row) => {
      if (row.location && !map.has(row.location)) {
        map.set(row.location, { value: row.location, label: row.locationName || row.location, icon: '📍' });
      }
    });
    return Array.from(map.values());
  }, [apiLocations, product]);

  useEffect(() => {
    if (!product || locations.length === 0) return;
    setFromLocation(locations[0]?.value ?? '');
    setToLocation(locations[1]?.value ?? locations[0]?.value ?? '');
    setQuantity('1');
  }, [product, locations]);

  if (!product) return null;

  const getQty = (locationId: string) => inventoryQuantity(product, locationId);

  const handleConfirm = async () => {
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) return;
    if (fromLocation === toLocation) {
      showToast('調出與調入地點不可相同', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await productService.transferStock({
        productId: product.id,
        fromLocation,
        toLocation,
        quantity: qty,
      });
      showToast('已完成單項調撥', 'success');
      onTransferred();
    } catch (err) {
      showToast(errorMessage(err, '調撥失敗，兩邊數量都沒有改變'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMoveAll = async () => {
    if (fromLocation === toLocation) {
      showToast('調出與調入地點不可相同', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await productService.moveAllStock({ fromLocation, toLocation });
      showToast('已移動來源地點全部非零數量（含負數）。門市綁定沒有改變。', 'success');
      onTransferred();
    } catch (err) {
      showToast(errorMessage(err, '整批移動失敗'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={!!product} onClose={onClose} title={`⇄ 庫存調撥：${product.name}`}>
      <div className="space-y-4 text-base">
        <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-3">
          <div>
            <span className="font-mono text-cyan-400 font-bold mr-2">{product.sku}</span>
            <span className="text-zinc-200 font-medium">{product.name}</span>
          </div>
          <span className="text-sm font-mono text-zinc-400">全據點合計: {product.totalInventory} 台</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-amber-400">1. 來源地點</label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {locations.map((location) => {
                const qty = getQty(location.value);
                const isSelected = fromLocation === location.value;
                return (
                  <button
                    type="button"
                    key={`from-${location.value}`}
                    onClick={() => setFromLocation(location.value)}
                    className={`w-full cursor-pointer rounded-xl border p-3 flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950/40 text-amber-300 ring-1 ring-amber-400'
                        : 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <span className="font-medium">{location.icon} {location.label}</span>
                    <span className={`font-mono font-bold ${qty > 0 ? 'text-emerald-400' : qty < 0 ? 'text-rose-400' : 'text-zinc-500'}`}>
                      {qty} 台
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-cyan-400">2. 目標地點</label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {locations.map((location) => {
                const qty = getQty(location.value);
                const isSelected = toLocation === location.value;
                const isSame = fromLocation === location.value;
                return (
                  <button
                    type="button"
                    key={`to-${location.value}`}
                    disabled={isSame}
                    onClick={() => setToLocation(location.value)}
                    className={`w-full rounded-xl border p-3 flex items-center justify-between transition-all ${
                      isSame
                        ? 'cursor-not-allowed border-zinc-800 bg-zinc-950 text-zinc-600 opacity-40'
                        : isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 ring-1 ring-cyan-400'
                        : 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <span className="font-medium">{location.icon} {location.label}</span>
                    <span className="font-mono font-bold text-zinc-300">{qty} 台</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">3. 這個商品的調撥數量</label>
          <Input
            monospace
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="text-lg font-bold"
          />
          <p className="mt-1 text-xs text-zinc-500">來源不夠時不會調撥，兩個地點都維持原數量。</p>
        </div>

        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            取消
          </Button>
          <Button variant="secondary" onClick={() => void handleMoveAll()} disabled={submitting || fromLocation === toLocation}>
            移動來源地點全部非零數量
          </Button>
          <Button
            variant="primary"
            onClick={() => void handleConfirm()}
            disabled={submitting || fromLocation === toLocation || Number(quantity) < 1}
          >
            {submitting ? '調撥中...' : '調撥這個商品'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
