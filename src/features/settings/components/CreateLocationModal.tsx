import { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { locationService } from '@/services';
import { useToastStore } from '@/components/feedback/toastStore';
import type { StockLocationDto } from '@/types/inventory';

interface CreateLocationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newLoc: StockLocationDto) => void;
  existingLocations: StockLocationDto[];
}

const PRESET_ICONS = ['🏪', '📦', '🏢', '🚚', '🏬', '🏠', '📍', '🌐', '🏷️', '✈️'];

export function CreateLocationModal({
  open,
  onClose,
  onSuccess,
  existingLocations,
}: CreateLocationModalProps) {
  const showToast = useToastStore((s) => s.showToast);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📍');
  const [displayOrder, setDisplayOrder] = useState(String(existingLocations.length + 1));
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();

    if (!cleanName) {
      showToast('請輸入地點名稱', 'error');
      return;
    }

    if (existingLocations.some((l) => l.name === cleanName)) {
      showToast(`地點名稱「${cleanName}」已存在，請使用不同名稱`, 'warning');
    }

    setIsSubmitting(true);
    try {
      const created = await locationService.createLocation({
        name: cleanName,
        icon: icon || '📍',
        displayOrder: Number(displayOrder) || existingLocations.length + 1,
        isActive,
      });

      showToast(`✨ 成功新增庫存地點：「${created.name}」`, 'success');
      onSuccess(created);
      onClose();
      setName('');
      setIcon('📍');
      setDisplayOrder(String(existingLocations.length + 2));
      setIsActive(true);
    } catch {
      showToast('新增地點失敗，請重試', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="➕ 新增庫存據點" widthClassName="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4 text-base">
        <div>
          <label className="mb-1 block text-sm font-semibold text-zinc-300">
            據點名稱 <span className="text-rose-400">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如: 高雄巨蛋門市, 桃園發貨倉, B1特賣展場"
            required
            autoFocus
            className="text-lg font-bold"
          />
          <span className="text-xs text-zinc-500 mt-1 block">
            💡 系統將自動為此據點指派 UUID 唯一識別碼
          </span>
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
            className="bg-cyan-500 text-zinc-950 font-bold px-5 shadow-sm"
          >
            {isSubmitting ? '儲存中...' : '確認新增'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
