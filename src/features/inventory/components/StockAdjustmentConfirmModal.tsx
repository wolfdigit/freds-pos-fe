import { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import type { StockItemAdjustment } from '@/types/inventory';
import { productService } from '@/services';
import { useToastStore } from '@/components/feedback/toastStore';
import { formatDateTime, nowIso } from '@/utils/date';

interface StockAdjustmentConfirmModalProps {
  open: boolean;
  adjustments: StockItemAdjustment[];
  onClose: () => void;
  onSuccess: (adjustments: StockItemAdjustment[]) => void;
}

export function StockAdjustmentConfirmModal({
  open,
  adjustments,
  onClose,
  onSuccess,
}: StockAdjustmentConfirmModalProps) {
  const showToast = useToastStore((s) => s.showToast);

  const operatorName = 'Fred';
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open || adjustments.length === 0) return null;

  const currentTimestamp = formatDateTime(nowIso());

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await productService.batchAdjustStock({
        adjustments,
        operatorName,
        timestamp: new Date().toISOString(),
        note: note.trim() || undefined,
      });

      showToast(`✅ 已成功更新 ${adjustments.length} 項商品庫存並紀錄操作日誌`, 'success');
      onSuccess(adjustments);
      onClose();
    } catch (err) {
      showToast('庫存調整儲存失敗，請重試', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="📋 庫存變更確認與操作紀錄" widthClassName="max-w-2xl">
      <div className="space-y-4 text-base">
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-300">
          ⚠️ 請核對以下庫存數量修改明細。點擊「確認存檔」後，系統將寫入資料庫並記錄操作人員與時間。
        </div>

        {/* 異動商品列表 (精緻雙層卡片版面) */}
        <div className="max-h-72 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950/80 divide-y divide-zinc-800/80 p-1">
          {adjustments.map((item) => {
            const netDiff = item.changes.reduce((sum, c) => sum + c.diff, 0);

            // 紅綠黃色彩標籤
            let badgeStyle = 'bg-amber-950/80 text-amber-300 border-amber-800/80';
            if (netDiff > 0) {
              badgeStyle = 'bg-emerald-950/90 text-emerald-300 border-emerald-800/90';
            } else if (netDiff < 0) {
              badgeStyle = 'bg-rose-950/90 text-rose-300 border-rose-800/90';
            }

            return (
              <div
                key={item.productId}
                className="p-3 text-sm flex flex-col gap-2 hover:bg-zinc-900/60 transition-colors rounded-lg"
              >
                {/* 上層：品牌徽章 + 貨號 (青色大字) + 品名 ... 異動摘要標籤 */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-xs font-semibold text-zinc-300 whitespace-nowrap">
                      {item.brand}
                    </span>
                    <span className="font-mono text-base font-bold text-cyan-400 whitespace-nowrap">
                      {item.sku}
                    </span>
                    <span className="text-zinc-100 font-medium truncate">{item.name}</span>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold whitespace-nowrap shadow-sm ${badgeStyle}`}
                  >
                    {item.summaryText}
                  </span>
                </div>

                {/* 下層：各地點異動細節 */}
                <div className="flex flex-wrap items-center gap-3 text-xs pt-1.5 border-t border-zinc-800/60 text-zinc-400 font-mono">
                  <span className="text-zinc-500 font-sans">異動明細：</span>
                  {item.changes.map((c) => (
                    <div
                      key={c.location}
                      className="flex items-center gap-1.5 bg-zinc-900/90 px-2.5 py-1 rounded-md border border-zinc-800"
                    >
                      <span className="text-zinc-400 font-sans">{c.locationName}:</span>
                      <span className="text-zinc-400">{c.oldQty}</span>
                      <span className="text-zinc-600">➔</span>
                      <span className="font-bold text-zinc-100">{c.newQty}</span>
                      <span
                        className={`font-bold ml-1 px-1.5 py-0.5 rounded text-[11px] ${
                          c.diff > 0
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : c.diff < 0
                            ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {c.diff > 0 ? `+${c.diff}` : c.diff}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* 操作人員與時間紀錄 (純粹簡潔標籤) */}
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-400">操作人員</label>
            <Input
              value={operatorName}
              disabled
              readOnly
              className="bg-zinc-950/90 border-zinc-800 text-zinc-300 font-medium select-none cursor-not-allowed"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-400">操作時間</label>
            <Input
              monospace
              value={currentTimestamp}
              disabled
              readOnly
              className="bg-zinc-950/90 border-zinc-800 text-cyan-300 font-bold select-none cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-zinc-400">異動原因 / 備註說明 (選填)</label>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例如: 門市補貨進貨、季度盤點調整..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            取消修訂
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? '寫入資料庫中...' : '確認存檔 (寫入紀錄)'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
