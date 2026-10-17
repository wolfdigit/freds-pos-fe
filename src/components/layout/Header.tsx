import { useEffect, useState } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { useUiStore } from '@/store/uiStore';
import { Button } from '@/components/common/Button';
import { resetDemoData, isMockService, toggleMockMode } from '@/services';
import { useToastStore } from '@/components/feedback/toastStore';
import { useThemeStore } from '@/store/themeStore';

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

function formatClock(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}:${pad(date.getSeconds())}`;
}

export function Header() {
  const {
    storeName,
    stores,
    cashierName,
    setStoreName,
    userRole,
    oauthUser,
    adminAccounts,
    staffAccounts,
    isSystemAdmin,
  } = useSessionStore();
  const setActiveTab = useUiStore((s) => s.setActiveTab);
  const { theme, toggleTheme } = useThemeStore();
  const now = useClock();
  const showToast = useToastStore((s) => s.showToast);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const handleReset = () => {
    if (!confirmingReset) {
      setConfirmingReset(true);
      showToast('再次點擊「重置示範資料」以確認清除並還原', 'warning');
      setTimeout(() => setConfirmingReset(false), 4000);
      return;
    }
    resetDemoData();
    showToast('示範資料已還原，請重新整理頁面', 'success');
    setConfirmingReset(false);
    setTimeout(() => window.location.reload(), 800);
  };

  const currentAccount = userRole === 'admin'
    ? adminAccounts.find((a) => a.email.toLowerCase() === (oauthUser?.email || '').toLowerCase())
    : staffAccounts.find((a) => a.email.toLowerCase() === (oauthUser?.email || '').toLowerCase());

  const assignedStores = currentAccount?.assignedStores;
  const isStoreRestricted = !isSystemAdmin() && Boolean(assignedStores && assignedStores.length > 0);
  const availableStores = isStoreRestricted && assignedStores && assignedStores.length > 0
    ? (stores || []).filter((s) => assignedStores.includes(s))
    : stores && stores.length > 0
    ? stores
    : [storeName];

  // 避免 availableStores 為空的情況
  const safeStores = availableStores.length > 0 ? availableStores : [storeName];

  const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setStoreName(val);
    showToast(`已成功更換登入門市為：「${val}」`, 'success');
  };

  const handleLogoutClick = () => {
    showToast('未開放此功能', 'warning');
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-6 select-none">
      <div className="flex items-center gap-3 text-base">
        <button
          onClick={() => setActiveTab(null)}
          title="回主選單"
          className="rounded-sm font-extrabold text-cyan-400 tracking-wider hover:text-cyan-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          FRED'S POS
        </button>
        <span className="text-zinc-600">|</span>

        {/* 可更改登入門市選單 */}
        <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
          <span className="text-zinc-400 text-xs">登入門市:</span>
          {isStoreRestricted && safeStores.length === 1 ? (
            <div
              className="flex items-center gap-1.5 rounded-lg border border-emerald-700/60 bg-zinc-800/90 px-2.5 py-1 text-sm font-semibold text-emerald-300 shadow-sm cursor-not-allowed"
              title={`此帳號已綁定專屬門市「${safeStores[0]}」，無法跨店切換`}
            >
              <span>🏢 {safeStores[0]}</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1 py-0.2 rounded font-mono">
                專屬門市
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <select
                value={storeName}
                onChange={handleStoreChange}
                className="cursor-pointer rounded-lg border border-zinc-700/80 bg-zinc-800/90 px-2.5 py-1 text-sm font-semibold text-cyan-300 shadow-sm transition-all hover:border-zinc-500 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                title={isStoreRestricted ? '切換您被授權的門市' : '點擊更改登入門市'}
              >
                {safeStores.map((s) => (
                  <option key={s} value={s}>
                    🏢 {s}
                  </option>
                ))}
              </select>
              {isStoreRestricted && (
                <span className="text-[10px] bg-cyan-950/80 text-cyan-400 border border-cyan-800/80 px-1.5 py-0.5 rounded font-mono" title={`授權門市：${safeStores.join('、')}`}>
                  授權 {safeStores.length} 店
                </span>
              )}
            </div>
          )}
        </div>

        <span className="text-zinc-600">|</span>

        {/* 使用者名稱、OAuth 角色與登出按鈕 */}
        <div className="flex items-center gap-2 text-zinc-300 font-medium">
          <span>{cashierName}</span>
          <span className="rounded bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 text-[11px] font-mono text-cyan-300 font-semibold">
            {useSessionStore((s) => s.userRole === 'admin' ? '管理員' : '店員')}
          </span>
          <button
            onClick={handleLogoutClick}
            title="未開放此功能"
            className="rounded border border-zinc-700 bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-300 shadow-sm transition-all hover:border-rose-700/80 hover:bg-rose-950/60 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            登出
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* 模式切換按鈕 */}
        <button
          type="button"
          onClick={toggleMockMode}
          title={isMockService ? '目前為：Mock 模式，點擊切換為真實 API 模式' : '目前為：真實 API 連線模式，點擊切換為 Mock 模式'}
          className="cursor-pointer rounded-md transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
        >
          {isMockService ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400 ring-1 ring-inset ring-amber-500/20 hover:ring-amber-500/40 transition-all">
              <span>Mock 模式</span>
              <span className="text-[10px] text-amber-500/80 font-mono">⇄ 切換</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20 hover:ring-emerald-500/40 transition-all">
              <span>API 連線模式</span>
              <span className="text-[10px] text-emerald-500/80 font-mono">⇄ 切換</span>
            </span>
          )}
        </button>
        <span className="font-mono text-sm text-zinc-400">{formatClock(now)}</span>
        
        {/* 主題切換按鈕 */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? '切換為淺色主題' : '切換為暗色主題'}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-700/80 bg-zinc-800/80 px-2.5 py-1 text-xs font-semibold text-zinc-200 shadow-sm transition-all hover:border-zinc-500 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
          <span>{theme === 'dark' ? '暗色' : '淺色'}</span>
        </button>

        {isMockService && (
          <Button size="sm" variant={confirmingReset ? 'danger' : 'ghost'} onClick={handleReset}>
            ↻ 重置示範資料
          </Button>
        )}
      </div>
    </header>
  );
}

