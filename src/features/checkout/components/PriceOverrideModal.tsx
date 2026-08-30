import { useEffect, useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import type { CartItem } from '@/store/cartStore';
import { formatCurrency } from '@/utils/currency';

interface PriceOverrideModalProps {
  open: boolean;
  item: CartItem | null;
  onClose: () => void;
  onConfirm: (newPrice: number, reason: string) => void;
}

const REASON_PRESETS = ['老闆特批', '車身微瑕盒損', '熟客折扣'];

export function PriceOverrideModal({ open, item, onClose, onConfirm }: PriceOverrideModalProps) {
  const [price, setPrice] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (item) {
      setPrice(String(item.unitPrice));
      setReason(item.priceChangeReason ?? '');
    }
  }, [item]);

  if (!item) return null;

  const handleConfirm = () => {
    const parsed = Number(price);
    if (isNaN(parsed) || parsed < 0) return;
    onConfirm(parsed, reason);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="手動改價">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-zinc-400">{item.name}</p>
          <p className="font-mono text-sm text-zinc-500">原牌價：{formatCurrency(item.originalPrice)}</p>
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-400">新單價</label>
          <Input
            monospace
            type="text"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ''))}
            autoFocus
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-400">改價原因（選填）</label>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="例如：老闆特批" />
          <div className="mt-1.5 flex gap-1.5">
            {REASON_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => setReason(preset)}
                className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-700"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            確認改價
          </Button>
        </div>
      </div>
    </Modal>
  );
}
