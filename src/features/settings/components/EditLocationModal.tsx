import { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { locationService } from '@/services';
import { useToastStore } from '@/components/feedback/toastStore';
import type { StockLocationDto } from '@/types/inventory';

interface EditLocationModalProps {
  location: StockLocationDto | null;
  onClose: () => void;
  onSuccess: (updatedLoc: StockLocationDto) => void;
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
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location) {
      setName(location.name || '');
      setIcon(location.icon || '📍');
      setDisplayOrder(String(location.displayOrder ?? 1));
      setIsActive(location.isActive !== false);
    }
  }, [location]);

  if (!location) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();

    if (!cleanName) {
      showToast('請輸入地點名稱', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await locationService.updateLocation(location.id, {
        name: cleanName,
        icon: icon || '📍',
        displayOrder: Number(displayOrder) || 1,
        isActive,
      });

      showToast(`✨ 成功修改庫存地點：「${updated.name}」`, 'success');
      onSuccess(updated);
      onClose();
    } catch {
      showToast('更新地點失敗，請重試', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={!!location} onClose={onClose} title={`✏️ 編輯庫存據點：${location.name}`} widthClassName="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4 text-base">
        <div>
          <label className="mb-1 block text-sm font-semibold text-zinc-300">
            據點名稱 <span className="text-rose-400">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如: 高雄巨蛋門市"
            required
            autoFocus
            className="font-bold text-lg"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-zinc-300">
            據點圖示 (Icon)
          </label>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl p-1 bg-zinc-800 rounded border border-zinc-700 min-w-[40px] text-center">
              {icon}
            </span>
            <Input
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

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="mb-1 block text-sm font-semibold text-zinc-300">
              排序權重 (Display Order)
            </label>
            <Input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              min={1}
              className="text-center font-mono font-bold"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-zinc-300">
              啟用狀態
            </label>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`w-full py-2.5 px-3 rounded-lg border text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                isActive
                  ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-500'
              }`}
            >
              <span>{isActive ? '🟢 啟用中' : '⚪ 停用中'}</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
            取消
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isSubmitting}
            className="bg-cyan-500 text-zinc-950 font-bold px-5"
          >
            {isSubmitting ? '儲存中...' : '儲存變更'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
