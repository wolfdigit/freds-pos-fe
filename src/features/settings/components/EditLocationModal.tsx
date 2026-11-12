import { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { locationService } from '@/services';
import { useToastStore } from '@/components/feedback/toastStore';
import type { InventoryLocationDto } from '@/types/inventory';
import { errorDetail } from '@/auth/businessError';
import { LOCATION_NAME_MAX_LENGTH, validateLocationName } from '@/utils/locationName';

interface EditLocationModalProps {
  location: InventoryLocationDto | null;
  onClose: () => void;
  onSuccess: (updatedLoc: InventoryLocationDto) => void;
}

const PRESET_ICONS = ['🏪', '📦', '🏢', '🚚', '🏬', '🏠', '📍', '🌐', '🏷️', '✈️'];

export function EditLocationModal({
  location,
  onClose,
  onSuccess,
}: EditLocationModalProps) {
  const showToast = useToastStore((s) => s.showToast);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📍');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (location) {
      setName(location.name || '');
      setIcon(location.icon || '📍');
      setDisplayOrder(String(location.displayOrder ?? 1));
      setFormError(null);
    }
  }, [location]);

  if (!location) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const nameError = validateLocationName(name);
    if (nameError) {
      setFormError(nameError);
      showToast(nameError, 'error');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      const updated = await locationService.updateLocation(location.id, {
        name: cleanName,
        icon: icon || '📍',
        displayOrder: Number(displayOrder) || 1,
      });

      showToast(`成功修改庫存地點：「${updated.name}」`, 'success');
      onSuccess(updated);
      onClose();
    } catch (err) {
      const text = errorDetail(err, '更新地點失敗，請重試');
      setFormError(text);
      showToast(text, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={!!location} onClose={onClose} title={`編輯庫存據點：${location.name}`} widthClassName="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4 text-base">
        <div>
          <label htmlFor="edit-location-name" className="mb-1 block text-sm font-semibold text-zinc-300">
            據點名稱 <span className="text-rose-400">*</span>
          </label>
          <Input
            id="edit-location-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setFormError(null);
            }}
            placeholder="例如: 高雄巨蛋門市"
            required
            autoFocus
            maxLength={LOCATION_NAME_MAX_LENGTH}
            className="font-bold text-lg"
          />
          <span className="mt-1 block text-xs text-zinc-500">最多 {LOCATION_NAME_MAX_LENGTH} 個字</span>
          {formError && (
            <p role="alert" className="mt-2 text-sm text-rose-300">{formError}</p>
          )}
        </div>

        <div>
          <label htmlFor="edit-location-icon" className="mb-1 block text-sm font-semibold text-zinc-300">
            據點圖示 (Icon)
          </label>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl p-1 bg-zinc-800 rounded border border-zinc-700 min-w-[40px] text-center">
              {icon}
            </span>
            <Input
              id="edit-location-icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="輸入 Emoji 或文字"
              className="w-32 text-center"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {PRESET_ICONS.map((emoji) => (
              <button
                type="button"
                key={emoji}
                onClick={() => setIcon(emoji)}
                className={`px-2.5 py-1 text-lg rounded-lg border transition-all ${
                  icon === emoji
                    ? 'border-cyan-400 bg-cyan-950/60 ring-1 ring-cyan-400'
                    : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-1">
          <label className="mb-1 block text-sm font-semibold text-zinc-300">排序權重</label>
          <Input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            min={1}
            className="text-center font-mono font-bold"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
            取消
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={isSubmitting}
            className="bg-cyan-500 text-zinc-950 font-bold px-5"
          >
            {isSubmitting ? '儲存中...' : '儲存變更'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
