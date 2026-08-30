import { useUiStore, type ActiveTab } from '@/store/uiStore';
import { cn } from '@/utils/cn';

const NAV_ITEMS: { id: ActiveTab; label: string; icon: string; description: string }[] = [
  { id: 'checkout', label: '出單 / 結帳櫃檯', icon: '🧾', description: '出單及商品結帳櫃檯' },
  { id: 'inventory', label: '商品及庫存', icon: '📦', description: '商品與庫存管理' },
  { id: 'customers', label: '客戶會員', icon: '👤', description: '客戶與會員管理' },
];

export function Sidebar() {
  const { activeTab, setActiveTab, isSidebarCollapsed, toggleSidebar } = useUiStore();

  return (
    <aside
      className={cn(
        'flex flex-col justify-between border-r border-zinc-800 bg-zinc-950 p-2.5 transition-all duration-200 ease-in-out select-none',
        isSidebarCollapsed ? 'w-16' : 'w-56'
      )}
    >
      <nav className="flex flex-col gap-1.5">
        {NAV_ITEMS.map((item) => (
          <div key={item.id} className="relative group">
            <button
              onClick={() => {
                setActiveTab(item.id);
                if (!isSidebarCollapsed) {
                  toggleSidebar();
                }
              }}
              title={item.label}
              className={cn(
                'flex w-full items-center rounded-lg py-2.5 text-left text-base font-medium transition-all duration-150',
                isSidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3',
                activeTab === item.id
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-950'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 border border-transparent'
              )}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              {!isSidebarCollapsed && <span className="truncate text-base">{item.label}</span>}
            </button>

            {/* Hover 浮動提示文字 Bubble */}
            <div
              className={cn(
                'pointer-events-none absolute z-50 hidden group-hover:flex items-center rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-100 shadow-xl border border-zinc-700 whitespace-nowrap transition-opacity duration-150',
                isSidebarCollapsed
                  ? 'left-full top-1/2 -translate-y-1/2 ml-2'
                  : 'left-full top-1/2 -translate-y-1/2 ml-2 hidden'
              )}
            >
              <span>{item.description}</span>
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-zinc-800/80 pt-2">
        <button
          onClick={toggleSidebar}
          title={isSidebarCollapsed ? '展開導覽列' : '收折導覽列'}
          className={cn(
            'flex w-full items-center rounded-lg py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors',
            isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3'
          )}
        >
          {!isSidebarCollapsed && <span>收折選單</span>}
          <span className="text-sm">{isSidebarCollapsed ? '▶' : '◀'}</span>
        </button>
      </div>
    </aside>
  );
}

