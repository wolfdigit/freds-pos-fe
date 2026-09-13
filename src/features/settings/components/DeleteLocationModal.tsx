import { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { locationService } from '@/services';
import { useToastStore } from '@/components/feedback/toastStore';
import type { StockLocationDto, DeleteStockLocationResponse } from '@/types/inventory';

interface DeleteLocationModalProps {
  location: StockLocationDto | null;
  availableTargets: StockLocationDto[];
  onClose: () => void;
  onSuccess: (res: DeleteStockLocationResponse) => void;
}

export function DeleteLocationModal({
  location,
  availableTargets,
  onClose,
  onSuccess,
}: DeleteLocationModalProps) {
  const showToast = useToastStore((s) => s.showToast);

  const validTargets = location
    ? availableTargets.filter((t) => t.id !== location.id)
    : [];

  const [transferToLocation, setTransferToLocation] = useState<string>('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location && validTargets.length > 0) {
      setTransferToLocation(validTargets[0].id || '');
    } else {
      setTransferToLocation('');
    }
    setReason('');
  }, [location, availableTargets]);

  if (!location) return null;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transferToLocation) {
      showToast('請選擇庫存移轉目標地點', 'error');
      return;
    }

    if (transferToLocation === location.id) {
      showToast('轉移目標地點不能與被刪除地點相同', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await locationService.deleteLocation(location.id, {
        transferToLocation,
        reason: reason.trim() || `撤點整併至目標地點`,
      });

      showToast(
        `🎉 ${res.message || `成功刪除「${location.name}」，庫存已安全移轉`}`,
        'success'
      );
      onSuccess(res);
      onClose();
    } catch {
      showToast('刪除地點失敗，請再試一次', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={!!location}
      onClose={onClose}
      title={`🗑️ 刪除庫存據點與庫存轉移`}
      widthClassName="max-w-lg"
    >
      <form onSubmit={handleDelete} className="space-y-4 text-base">
        {/* 被刪除地點資訊 */}
        <div className="rounded-xl border border-rose-900/60 bg-rose-950/20 p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{location.icon || '📍'}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-rose-200">{location.name}</span>
              </div>
              <p className="text-xs text-rose-300/80 mt-1">
                即將自系統資料庫中永久刪除此庫存地點。
              </p>
            </div>
          </div>
        </div>

        {/* 庫存安全移轉提醒與目標選擇 */}
        <div className="rounded-xl border border-amber-600/40 bg-amber-950/20 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <span className="text-xl">⚠️</span>
            <div>
              <h5 className="font-bold text-amber-300 text-sm">強制庫存安全移轉</h5>
              <p className="text-xs text-amber-200/80 mt-0.5 leading-relaxed">
                為防止商品庫存帳目遺失，刪除此地點時，<strong>該地點下所有商品現有的庫存數量將全數自動轉移至所選之目標據點</strong>。
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-zinc-200">
              請選擇庫存移轉目標據點 (Transfer Target) <span className="text-rose-400">*</span>
            </label>
            <select
              value={transferToLocation}
              onChange={(e) => setTransferToLocation(e.target.value)}
              className="w-full rounded-lg border border-amber-400/60 bg-zinc-900 px-3 py-2.5 text-base font-semibold text-amber-200 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              required
            >
              {validTargets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.icon || '📍'} {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-400">
              撤點/刪除原因備註 (選填)
            </label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="例如: 租約到期撤點、展場結束整併"
              className="text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
            取消
          </Button>
          <Button
            variant="danger"
            type="submit"
            disabled={isSubmitting || validTargets.length === 0}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-5"
          >
            {isSubmitting ? '執行轉移刪除中...' : '確認移轉庫存並刪除地點'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
