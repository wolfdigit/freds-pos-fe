import { useState, useMemo } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import type { StockItemAdjustment } from '@/types/inventory';
import { formatDateTime, nowIso } from '@/utils/date';

interface StockAdjustmentReceiptModalProps {
  open: boolean;
  adjustments: StockItemAdjustment[];
  operatorName?: string;
  onClose: () => void;
}

type TallyFilter = 'ALL' | 'PENDING' | 'DONE';

export function StockAdjustmentReceiptModal({
  open,
  adjustments,
  operatorName = 'Fred',
  onClose,
}: StockAdjustmentReceiptModalProps) {
  // 記錄已理貨勾選的商品 productId
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<TallyFilter>('ALL');

  const manifestNo = useMemo(
    () => `MAN-${formatDateTime(nowIso()).replace(/[- :]/g, '').slice(0, 12)}`,
    [open]
  );
  const currentTimestamp = useMemo(() => formatDateTime(nowIso()), [open]);

  const totalCount = adjustments.length;
  const doneCount = adjustments.filter((item) => checkedIds.has(item.productId)).length;
  const pendingCount = totalCount - doneCount;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const toggleCheck = (productId: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleToggleAll = () => {
    if (doneCount === totalCount) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(adjustments.map((a) => a.productId)));
    }
  };

  const filteredAdjustments = useMemo(() => {
    if (filter === 'PENDING') {
      return adjustments.filter((item) => !checkedIds.has(item.productId));
    }
    if (filter === 'DONE') {
      return adjustments.filter((item) => checkedIds.has(item.productId));
    }
    return adjustments;
  }, [adjustments, checkedIds, filter]);

  if (!open || adjustments.length === 0) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="📦 倉庫理貨清單"
      widthClassName="max-w-2xl"
    >
      <div className="space-y-4 text-base">
        {/* 1. 頂部摘要與理貨進度卡片 */}
        <div className="rounded-xl border border-cyan-800/50 bg-gradient-to-br from-cyan-950/30 to-zinc-950 p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
            <div>
              <span className="text-xs text-zinc-400 font-mono">理貨單號</span>
              <p className="font-mono text-base font-bold text-amber-400 tracking-wide">
                {manifestNo}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-400">操作人員 / 時間</span>
              <p className="text-xs font-mono text-zinc-300">
                <strong className="text-zinc-100">{operatorName}</strong> • {currentTimestamp}
              </p>
            </div>
          </div>

          {/* 理貨進度條 */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-zinc-300">
                📦 理貨進度: <strong className="text-emerald-400 text-sm font-mono">{doneCount}</strong> / {totalCount} 品項
              </span>
              <span className="font-mono font-bold text-cyan-300 text-sm">
                {progressPercent}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. 狀態篩選頁籤與一鍵全選按鈕 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 text-xs font-medium">
            <button
              onClick={() => setFilter('ALL')}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                filter === 'ALL'
                  ? 'bg-cyan-500 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              全部 ({totalCount})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                filter === 'PENDING'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              待理貨 ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('DONE')}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                filter === 'DONE'
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                  : 'text-emerald-400/80 hover:text-emerald-300'
              }`}
            >
              已完成 ({doneCount})
            </button>
          </div>

          <button
            onClick={handleToggleAll}
            className="text-xs font-mono font-medium text-zinc-400 hover:text-cyan-300 underline px-1 py-1"
          >
            {doneCount === totalCount ? '重設全選' : '一鍵全標完成'}
          </button>
        </div>

        {/* 3. 理貨卡片清單 (支援觸控點擊與快速核對) */}
        <div className="max-h-[50vh] min-h-[220px] overflow-y-auto space-y-2.5 pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
          {filteredAdjustments.length === 0 ? (
            <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 text-zinc-500 text-sm">
              <span className="text-2xl mb-1">✨</span>
              <span>
                {filter === 'PENDING' ? '太棒了！所有品項皆已理貨完成 🎉' : '無符合此條件的理貨項目'}
              </span>
            </div>
          ) : (
            filteredAdjustments.map((item) => {
              const isChecked = checkedIds.has(item.productId);

              return (
                <div
                  key={item.productId}
                  onClick={() => toggleCheck(item.productId)}
                  className={`cursor-pointer rounded-xl border p-3.5 transition-all select-none ${
                    isChecked
                      ? 'border-emerald-500/50 bg-emerald-950/20 opacity-75 ring-1 ring-emerald-500/30'
                      : 'border-zinc-800 bg-zinc-900/90 hover:border-zinc-700 hover:bg-zinc-850 active:scale-[0.99]'
                  }`}
                >
                  {/* 第一層：廠牌 + 貨號 (大字體) + 勾選按鈕 */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-xs font-bold text-zinc-300 whitespace-nowrap">
                        {item.brand}
                      </span>
                      <span
                        className={`font-mono text-lg sm:text-xl font-bold tracking-wide whitespace-nowrap ${
                          isChecked ? 'text-emerald-400 line-through' : 'text-cyan-400'
                        }`}
                      >
                        {item.sku}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCheck(item.productId);
                      }}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                        isChecked
                          ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                          : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'
                      }`}
                    >
                      {isChecked ? '✓ 已理貨' : '◻️ 點擊完成'}
                    </button>
                  </div>

                  {/* 第二層：高對比國際條碼 (條碼機/肉眼在貨架極易核對) */}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs sm:text-sm font-bold text-amber-300 bg-zinc-950 border border-zinc-800 px-2.5 py-0.5 rounded-md">
                      🏷️ {item.barcode || '無條碼'}
                    </span>
                    <span className="rounded bg-cyan-950 border border-cyan-800/80 px-2 py-0.5 text-xs font-semibold text-cyan-300">
                      {item.summaryText}
                    </span>
                  </div>

                  {/* 第三層：商品品名 */}
                  <p
                    className={`mt-1.5 text-sm font-medium leading-snug line-clamp-2 ${
                      isChecked ? 'text-zinc-400' : 'text-zinc-100'
                    }`}
                  >
                    {item.name}
                  </p>

                  {/* 第四層：庫存異動地點數量明細 */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-zinc-800/60 pt-2 text-xs font-mono">
                    <span className="text-zinc-500">據點異動：</span>
                    {item.changes.map((c) => (
                      <span
                        key={c.location}
                        className="inline-flex items-center gap-1 rounded bg-zinc-950 px-2 py-0.5 text-zinc-300 border border-zinc-800/80"
                      >
                        <span className="text-zinc-400">{c.locationName}:</span>
                        <span>{c.oldQty}➔{c.newQty}</span>
                        <strong
                          className={
                            c.diff > 0
                              ? 'text-emerald-400 font-bold'
                              : c.diff < 0
                              ? 'text-rose-400 font-bold'
                              : 'text-zinc-300'
                          }
                        >
                          ({c.diff > 0 ? `+${c.diff}` : c.diff})
                        </strong>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 4. 底部動作列 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-2 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 font-mono text-center sm:text-left">
            💡 理貨提示：點擊卡片即可勾選完成理貨，核對貨架與實物無誤後點擊關閉。
          </p>
          <Button
            variant="primary"
            onClick={onClose}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-base px-6 py-2.5 shadow-md"
          >
            ✅ 完成理貨 (關閉)
          </Button>
        </div>
      </div>
    </Modal>
  );
}
