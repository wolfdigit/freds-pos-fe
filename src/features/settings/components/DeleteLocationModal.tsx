import { useEffect, useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { locationService } from '@/services';
import { useToastStore } from '@/components/feedback/toastStore';
import { errorMessage } from '@/auth/businessError';
import type { InventoryLocationDto, DeleteInventoryLocationResponse } from '@/types/inventory';

interface DeleteLocationModalProps {
  location: InventoryLocationDto | null;
  availableTargets: InventoryLocationDto[];
  /** 這個地點是否還有任何非 0 數量，含負數。 */
  hasQuantity: boolean;
  onClose: () => void;
  onSuccess: (res: DeleteInventoryLocationResponse) => void;
}

const BINDING_LABEL = { normal: '正常商品', returned: '退貨' } as const;

export function DeleteLocationModal({
  location,
  availableTargets,
  hasQuantity,
  onClose,
  onSuccess,
}: DeleteLocationModalProps) {
  const showToast = useToastStore((s) => s.showToast);
  const needsRebind = Boolean(location && (location.storeNames.length > 0 || location.returnedStoreNames.length > 0));
  const [rebindToLocation, setRebindToLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setRebindToLocation(availableTargets[0]?.id ?? '');
  }, [location, availableTargets]);

  if (!location) return null;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasQuantity) return;
    if (needsRebind && !rebindToLocation) {
      showToast('請選擇門市要改綁的庫存點', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await locationService.deleteLocation(location.id, {
        rebindToLocation: needsRebind ? rebindToLocation : undefined,
      });
      const targetName = availableTargets.find((item) => item.id === rebindToLocation)?.name ?? '';
      const reboundText = res.reboundStoreNames
        .map((store) => `${store.name}（${BINDING_LABEL[store.binding]}→${targetName || store.inventoryLocationId}）`)
        .join('、');
      showToast(reboundText ? `已刪除「${location.name}」。改綁：${reboundText}` : `已刪除「${location.name}」`, 'success');
      onSuccess(res);
      onClose();
    } catch (err) {
      showToast(errorMessage(err, '刪除地點失敗'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={!!location} onClose={onClose} title="刪除庫存據點" widthClassName="max-w-lg">
      <form onSubmit={handleDelete} className="space-y-4 text-base">
        <div className="rounded-xl border border-rose-900/60 bg-rose-950/20 p-4">
          <div className="font-bold text-lg text-rose-200">{location.icon || '📍'} {location.name}</div>
          <p className="mt-1 text-xs text-rose-300/80">刪除不會搬走數量。這個地點的數量必須剛好是 0。</p>
        </div>

        {hasQuantity ? (
          <div className="rounded-xl border border-amber-600/40 bg-amber-950/20 p-4 text-sm text-amber-200">
            這個地點還有數量（含負數）。請先調撥，或把數量手動改成 0，再刪除。
          </div>
        ) : needsRebind ? (
          <div className="space-y-2">
            <p className="text-sm text-zinc-300">
              正常商品門市：{location.storeNames.join('、') || '無'}。退貨門市：{location.returnedStoreNames.join('、') || '無'}。
              請指定既有的另一個地點，兩邊角色都會改綁過去，可以綁到同一個地點。
            </p>
            <label htmlFor="delete-location-target" className="block text-sm font-semibold text-zinc-200">
              改綁目標 <span className="text-rose-400">*</span>
            </label>
            <select
              id="delete-location-target"
              value={rebindToLocation}
              onChange={(e) => setRebindToLocation(e.target.value)}
              className="w-full rounded-lg border border-amber-400/60 bg-zinc-900 px-3 py-2.5 text-base font-semibold text-amber-200 focus:border-cyan-400 focus:outline-none"
              required
            >
              {availableTargets.map((target) => (
                <option key={target.id} value={target.id}>
                  {target.icon || '📍'} {target.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="text-sm text-zinc-400">沒有門市綁這個地點，也沒有剩餘數量，可以直接刪除。</p>
        )}

        <div className="flex justify-end gap-3 border-t border-zinc-800 pt-3">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
            取消
          </Button>
          <Button
            variant="danger"
            type="submit"
            disabled={isSubmitting || hasQuantity || (needsRebind && availableTargets.length === 0)}
            className="bg-rose-600 font-bold text-white hover:bg-rose-500"
          >
            {isSubmitting ? '刪除中...' : '確認刪除'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
