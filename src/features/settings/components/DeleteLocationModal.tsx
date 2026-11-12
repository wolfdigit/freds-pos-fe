import { useEffect, useRef, useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { locationService } from '@/services';
import { useToastStore } from '@/components/feedback/toastStore';
import { errorDetail } from '@/auth/businessError';
import type { InventoryLocationDto, DeleteInventoryLocationResponse } from '@/types/inventory';
import { loadLocationDeleteSnapshot, type LocationDeleteSnapshot } from '../locationDeleteSnapshot';

interface DeleteLocationModalProps {
  location: InventoryLocationDto | null;
  onClose: () => void;
  onSuccess: (res: DeleteInventoryLocationResponse) => void;
  /** Reload the location list after a fresh snapshot or a failed delete. */
  onRefresh?: () => void;
}

const BINDING_LABEL = { normal: '正常商品', returned: '退貨' } as const;

function isBound(location: InventoryLocationDto | null | undefined): boolean {
  return Boolean(location && (location.storeNames.length > 0 || location.returnedStoreNames.length > 0));
}

export function DeleteLocationModal({
  location,
  onClose,
  onSuccess,
  onRefresh,
}: DeleteLocationModalProps) {
  const showToast = useToastStore((s) => s.showToast);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;
  const [snapshot, setSnapshot] = useState<LocationDeleteSnapshot | null>(null);
  const [phase, setPhase] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [rebindToLocation, setRebindToLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const locationId = location?.id ?? null;

  useEffect(() => {
    if (!locationId) {
      setSnapshot(null);
      setFormError(null);
      setPhase('idle');
      return;
    }
    let cancelled = false;
    setPhase('loading');
    setFormError(null);
    setSnapshot(null);
    void loadLocationDeleteSnapshot(locationId)
      .then((fresh) => {
        if (cancelled) return;
        if (!fresh.location) {
          setFormError('找不到這個庫存點，請重新整理後再試。');
          setPhase('error');
          onRefreshRef.current?.();
          return;
        }
        setSnapshot(fresh);
        setPhase('ready');
        onRefreshRef.current?.();
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setFormError(errorDetail(err, '無法確認這個地點能不能刪除'));
        setPhase('error');
      });
    return () => {
      cancelled = true;
    };
  }, [locationId]);

  useEffect(() => {
    setRebindToLocation((current) => {
      if (snapshot?.targets.some((item) => item.id === current)) return current;
      return snapshot?.targets[0]?.id ?? '';
    });
  }, [snapshot]);

  if (!location) return null;

  const shown = snapshot?.location ?? location;
  const needsRebind = Boolean(snapshot && isBound(snapshot.location));
  const blocked =
    phase !== 'ready' ||
    !snapshot ||
    snapshot.hasQuantity ||
    (needsRebind && (snapshot.targets.length === 0 || !rebindToLocation));

  const handleDelete = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!locationId || phase !== 'ready' || !snapshot || snapshot.hasQuantity) return;
    setIsSubmitting(true);
    setFormError(null);
    let fresh: LocationDeleteSnapshot;
    try {
      fresh = await loadLocationDeleteSnapshot(locationId);
    } catch (err) {
      const text = errorDetail(err, '無法確認這個地點能不能刪除');
      setFormError(text);
      showToast(text, 'error');
      setIsSubmitting(false);
      return;
    }
    if (!fresh.location) {
      setSnapshot(null);
      setPhase('error');
      setFormError('找不到這個庫存點，請重新整理後再試。');
      onRefreshRef.current?.();
      setIsSubmitting(false);
      return;
    }
    const wasBound = isBound(snapshot.location);
    setSnapshot(fresh);
    if (fresh.hasQuantity) {
      setIsSubmitting(false);
      return;
    }
    const nowBound = isBound(fresh.location);
    const selected = fresh.targets.some((item) => item.id === rebindToLocation) ? rebindToLocation : '';
    if (nowBound && (!wasBound || !selected)) {
      if (!selected) setRebindToLocation(fresh.targets[0]?.id ?? '');
      setIsSubmitting(false);
      return;
    }
    try {
      const res = await locationService.deleteLocation(fresh.location.id, {
        rebindToLocation: nowBound ? selected : undefined,
      });
      const targetName = fresh.targets.find((item) => item.id === selected)?.name ?? '';
      const reboundText = res.reboundStoreNames
        .map((store) => `${store.name}（${BINDING_LABEL[store.binding]}→${targetName || store.inventoryLocationId}）`)
        .join('、');
      showToast(
        reboundText ? `已刪除「${fresh.location.name}」。改綁：${reboundText}` : `已刪除「${fresh.location.name}」`,
        'success'
      );
      onSuccess(res);
      onClose();
    } catch (err) {
      const text = errorDetail(err, '刪除地點失敗');
      setFormError(text);
      showToast(text, 'error');
      onRefreshRef.current?.();
      try {
        const again = await loadLocationDeleteSnapshot(locationId);
        if (again.location) setSnapshot(again);
      } catch (refreshErr) {
        console.error('Failed to refresh location after delete error', refreshErr);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={!!location} onClose={onClose} title="刪除庫存據點" widthClassName="max-w-lg">
      <form onSubmit={handleDelete} className="space-y-4 text-base">
        <div className="rounded-xl border border-rose-900/60 bg-rose-950/20 p-4">
          <div className="font-bold text-lg text-rose-200">{shown.icon || '📍'} {shown.name}</div>
          <p className="mt-1 text-xs text-rose-300/80">刪除不會搬走數量。這個地點的數量必須剛好是 0。</p>
        </div>

        {formError && (
          <div role="alert" className="rounded-xl border border-rose-700/70 bg-rose-950/50 p-4 text-sm text-rose-100">
            {formError}
          </div>
        )}

        {phase === 'loading' ? (
          <p className="text-sm text-zinc-300">正在確認門市綁定與剩餘數量…</p>
        ) : phase === 'ready' && snapshot?.hasQuantity ? (
          <div className="rounded-xl border border-amber-600/40 bg-amber-950/20 p-4 text-sm text-amber-200">
            這個地點還有數量（含負數）。請先調撥，或把數量手動改成 0，再刪除。
          </div>
        ) : phase === 'ready' && snapshot?.location && isBound(snapshot.location) ? (
          <div className="space-y-2">
            <p className="text-sm text-zinc-300">
              正常商品門市：{snapshot.location.storeNames.join('、') || '無'}。退貨門市：{snapshot.location.returnedStoreNames.join('、') || '無'}。
              請指定既有的另一個地點，兩邊角色都會改綁過去，可以綁到同一個地點。
            </p>
            {snapshot.targets.length === 0 ? (
              <p className="text-sm text-amber-200">沒有其他庫存點可以改綁，請先建立另一個地點。</p>
            ) : (
              <>
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
                  {snapshot.targets.map((target) => (
                    <option key={target.id} value={target.id}>
                      {target.icon || '📍'} {target.name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        ) : phase === 'ready' ? (
          <p className="text-sm text-zinc-400">沒有門市綁這個地點，也沒有剩餘數量，可以直接刪除。</p>
        ) : null}

        <div className="flex justify-end gap-3 border-t border-zinc-800 pt-3">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
            取消
          </Button>
          <Button
            variant="danger"
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting || blocked}
            className="bg-rose-600 font-bold text-white hover:bg-rose-500"
          >
            {isSubmitting ? '確認中...' : '確認刪除'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
