import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import type { StockItemAdjustment } from '@/types/inventory';
import { formatDateTime, nowIso } from '@/utils/date';
import { useToastStore } from '@/components/feedback/toastStore';

interface StockAdjustmentReceiptModalProps {
  open: boolean;
  adjustments: StockItemAdjustment[];
  operatorName?: string;
  onClose: () => void;
}

export function StockAdjustmentReceiptModal({
  open,
  adjustments,
  operatorName = 'Fred',
  onClose,
}: StockAdjustmentReceiptModalProps) {
  const showToast = useToastStore((s) => s.showToast);

  if (!open || adjustments.length === 0) return null;

  const manifestNo = `MAN-${formatDateTime(nowIso()).replace(/[- :]/g, '').slice(0, 12)}`;
  const currentTimestamp = formatDateTime(nowIso());

  const handlePrint = () => {
    showToast('🖨️ 已發送至理貨單印表機列印', 'success');
  };

  return (
    <Modal open={open} onClose={onClose} title="📄 庫存異動與理貨明細單" widthClassName="max-w-3xl">
      <div className="space-y-4 text-base">
        {/* 明細單抬頭與資訊卡片 */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
            <div>
              <h2 className="text-xl font-bold text-cyan-400">FRED'S POS - 庫存異動理貨單</h2>
              <p className="text-xs text-zinc-500 mt-0.5">實體門市 / 倉庫異動理貨憑證</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-400 block">理貨單號 (Manifest No)</span>
              <span className="text-base font-bold text-amber-400">{manifestNo}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs text-zinc-300">
            <div>
              <span className="text-zinc-500 block">理貨人員:</span>
              <span className="font-bold text-zinc-200">{operatorName}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">產生時間:</span>
              <span className="font-bold text-zinc-200">{currentTimestamp}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">異動商品總數:</span>
              <span className="font-bold text-cyan-300">{adjustments.length} 項</span>
            </div>
          </div>
        </div>

        {/* 理貨指示表格 */}
        <div className="max-h-80 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900/60">
          <table className="w-full text-left text-sm font-mono">
            <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 uppercase text-xs">
              <tr>
                <th className="px-3 py-2.5">廠牌 / 貨號</th>
                <th className="px-3 py-2.5">車型品名</th>
                <th className="px-3 py-2.5">理貨指示 (動作)</th>
                <th className="px-3 py-2.5 text-right">數量</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {adjustments.map((item) => (
                <tr key={item.productId} className="hover:bg-zinc-900/80">
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="text-xs text-zinc-400 block">{item.brand}</span>
                    <span className="font-bold text-cyan-400">{item.sku}</span>
                  </td>
                  <td className="px-3 py-2.5 max-w-xs font-sans">
                    <span className="text-zinc-200 truncate block">{item.name}</span>
                  </td>
                  <td className="px-3 py-2.5 font-sans">
                    <span className="rounded bg-cyan-950/80 border border-cyan-800/80 px-2 py-0.5 text-xs text-cyan-300 font-semibold block w-fit">
                      {item.summaryText}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {item.changes.map((c) => (
                      <div key={c.location} className="text-xs">
                        <span className="text-zinc-400">{c.locationName}:</span>{' '}
                        <span className={c.diff > 0 ? 'text-emerald-400 font-bold' : c.diff < 0 ? 'text-rose-400 font-bold' : 'text-zinc-300'}>
                          {c.diff > 0 ? `+${c.diff}` : c.diff}
                        </span>
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-zinc-500 font-mono">
            理貨提醒：請依照本單標示之地點指示移動與備貨，完成後蓋章歸檔。
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose}>
              關閉
            </Button>
            <Button variant="primary" onClick={handlePrint} className="bg-cyan-500 text-zinc-950 font-bold">
              🖨️ 列印理貨明細單
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
