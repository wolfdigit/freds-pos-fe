export interface StoreFilterTab {
  key: string;
  label: string;
}

interface StoreFilterTabsProps {
  tabs: readonly StoreFilterTab[];
  activeKey: string;
  onSelect: (key: string) => void;
  /** 按鈕前的標題，例如「門市篩選：」。 */
  title?: string;
  testId?: string;
  size?: 'md' | 'sm';
}

/** 一排門市按鈕（庫存頁、日報表共用）。門市多時橫向捲動，不換行。 */
export function StoreFilterTabs({ tabs, activeKey, onSelect, title = '門市篩選：', testId, size = 'md' }: StoreFilterTabsProps) {
  const sizing = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm';
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" data-testid={testId}>
      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap mr-1 shrink-0">
        {title}
      </span>
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(tab.key)}
            className={`shrink-0 rounded-lg ${sizing} font-semibold transition-all whitespace-nowrap ${
              active
                ? 'bg-cyan-500 text-zinc-950 shadow-sm font-bold scale-[1.02]'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
