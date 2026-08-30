import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { useToastStore } from '@/components/feedback/toastStore';
import type { Customer } from '@/types/customer';
import { cn } from '@/utils/cn';

interface CustomerListPanelProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  customers: Customer[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddClick: () => void;
}

export function CustomerListPanel({
  keyword,
  onKeywordChange,
  customers,
  selectedId,
  onSelect,
  onAddClick,
}: CustomerListPanelProps) {
  const showToast = useToastStore((s) => s.showToast);

  const getBadgeColor = (tier: string) => {
    if (tier === 'platinum') return 'purple';
    if (tier === 'gold') return 'amber';
    if (tier === 'silver') return 'cyan';
    return 'zinc';
  };

  return (
    <div className="flex h-full w-80 flex-col border-r border-zinc-800 pr-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
          <span>👥 會員列表</span>
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-mono text-xs font-semibold text-cyan-400">
            {customers.length}
          </span>
        </h3>
        <Button size="md" variant="primary" onClick={onAddClick} className="px-3.5 py-1.5 text-sm font-bold shadow-sm">
          ➕ 新增會員
        </Button>
      </div>

      <div className="relative">
        <Input
          monospace
          placeholder="🔍 電話或姓名..."
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          className="pr-8 text-sm"
        />
        {keyword && (
          <button
            onClick={() => onKeywordChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 text-xs rounded-full w-4 h-4 flex items-center justify-center bg-zinc-800"
            title="清空搜尋"
          >
            ✕
          </button>
        )}
      </div>

      <div className="mt-3 flex-1 space-y-1.5 overflow-y-auto pr-1">
        {customers.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">
            <p className="text-2xl mb-1">🔍</p>
            <p>未找到符合「{keyword}」的會員</p>
          </div>
        ) : (
          customers.map((c) => {
            const isSelected = selectedId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={cn(
                  'w-full rounded-xl border p-3 text-left transition-all duration-150',
                  isSelected
                    ? 'border-cyan-500/80 bg-cyan-950/30 shadow-md shadow-cyan-950/30'
                    : 'border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-800/50'
                )}
              >
                <div className="flex items-center justify-between">
                  <p className={cn('text-base font-semibold', isSelected ? 'text-cyan-300' : 'text-zinc-100')}>
                    {c.name}
                  </p>
                  <Badge color={getBadgeColor(c.vipTier)}>{c.vipTierName}</Badge>
                </div>
                <div className="mt-1.5 flex items-center justify-between font-mono text-xs">
                  <span className="text-zinc-400 flex items-center">
                    <span className="select-none mr-1">📞</span>
                    <span className="select-text">{c.phone}</span>
                  </span>
                  <span className="text-emerald-400 font-semibold select-text">點數 {c.rewardPoints}</span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* 獨立全域工具區：匯入預購單 */}
      <div className="mt-3 pt-3 border-t border-zinc-800/80 shrink-0">
        <Button
          size="md"
          variant="secondary"
          onClick={() => showToast('尚未支援此功能', 'info')}
          className="w-full justify-center py-2.5 text-sm font-bold flex items-center gap-2 shadow-sm"
          title="全域匯入線上預購單"
        >
          <span>📥 匯入線上預購單</span>
        </Button>
      </div>
    </div>
  );
}
