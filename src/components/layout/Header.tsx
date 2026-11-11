import { useEffect, useState } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { useUiStore } from '@/store/uiStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { Spinner } from '@/components/feedback/Spinner';
import { displayAccountName } from '@/auth/displayName';
import { hasPermission } from '@/auth/permissions';
import { storeSwitchNotice } from '@/auth/storeSwitch';
import { resetDemoData, isMockService, canToggleMockMode, toggleMockMode } from '@/services';
import { useToastStore } from '@/components/feedback/toastStore';
import { useThemeStore } from '@/store/themeStore';
import { switchLoginStore, useAuthStore } from '@/store/authStore';

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
    storeListStatus,
    storeListError,
    cashierName,
    userRole,
    oauthUser,
    setStoreName,
    fetchStores,
  } = useSessionStore();
  const cashierLabel = displayAccountName(oauthUser.name, oauthUser.email) || cashierName;
  const logout = useAuthStore((state) => state.logout);
  const setActiveTab = useUiStore((s) => s.setActiveTab);
  const { theme, toggleTheme } = useThemeStore();
  const now = useClock();
  const showToast = useToastStore((s) => s.showToast);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [customStoreOpen, setCustomStoreOpen] = useState(false);
  const [customStoreName, setCustomStoreName] = useState('');
  const [customStoreError, setCustomStoreError] = useState('');
  const [switchingStore, setSwitchingStore] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [retryingStores, setRetryingStores] = useState(false);

  useEffect(() => {
    void fetchStores();
  }, [fetchStores, oauthUser.id]);

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

  const listedStores = stores.filter((name) => name.trim());
  const availableStores =
    storeName && !listedStores.includes(storeName) ? [storeName, ...listedStores] : listedStores;
  const showStoreChoices = listedStores.length > 0;

  const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__CUSTOM__') {
      if (!isMockService) return;
      setCustomStoreName('');
      setCustomStoreError('');
      setCustomStoreOpen(true);
      return;
    }
    if (!val || val === storeName || switchingStore) return;
    setSwitchingStore(true);
    void (async () => {
      try {
        const result = await switchLoginStore(val);
        if (!result.ok) {
          showToast(result.message, 'error');
          return;
        }
        if (result.cartItemCount > 0) showToast(storeSwitchNotice(val), 'warning', 8000);
        else showToast(`已成功更換登入門市為：「${val}」`, 'success');
      } finally {
        setSwitchingStore(false);
      }
    })();
  };

  const handleCustomStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = customStoreName.trim();
    if (!name) {
      setCustomStoreError('請填寫門市名稱');
      return;
    }
    setStoreName(name);
    showToast(`已成功更換登入門市為：「${name}」`, 'success');
    setCustomStoreOpen(false);
  };

  const handleLogoutClick = () => {
    if (loggingOut) return;
    if (isMockService) {
      showToast('示範模式使用本機資料，沒有伺服器登入階段', 'warning');
      return;
    }
    setLoggingOut(true);
    void logout()
      .then(() => {
        const message = useAuthStore.getState().errorMessage;
        if (message) showToast(message, 'error');
      })
      .finally(() => setLoggingOut(false));
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
          {showStoreChoices ? (
            <select
              value={storeName}
              onChange={handleStoreChange}
              aria-label="登入門市"
              aria-busy={switchingStore || undefined}
              disabled={switchingStore}
              className="cursor-pointer rounded-lg border border-zinc-700/80 bg-zinc-800/90 px-2.5 py-1 text-sm font-semibold text-cyan-300 shadow-sm transition-all hover:border-zinc-500 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-wait disabled:opacity-60"
              title="點擊更改登入門市"
            >
              {availableStores.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              {isMockService && hasPermission(userRole, 'store.manage') && (
                <option value="__CUSTOM__">自訂其他門市...</option>
              )}
            </select>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300">
              {storeListStatus === 'loading' && <Spinner size="sm" />}
              {storeName || (storeListStatus === 'loading' ? '讀取門市清單中...' : '讀取門市清單')}
            </span>
          )}
          {switchingStore && <Spinner size="sm" />}
          {storeListStatus === 'error' && (
            <button
              type="button"
              disabled={retryingStores}
              aria-busy={retryingStores || undefined}
              onClick={() => {
                if (retryingStores) return;
                setRetryingStores(true);
                void fetchStores().finally(() => setRetryingStores(false));
              }}
              className="inline-flex items-center gap-1 rounded border border-rose-800 px-2 py-0.5 text-xs text-rose-300 disabled:cursor-wait disabled:opacity-60"
            >
              {retryingStores && <Spinner size="sm" />}
              {retryingStores ? '重試中...' : '重試'}
            </button>
          )}
        </div>
        {storeListError && (
          <p className="text-xs text-rose-300" role="alert">
            {storeListError}
          </p>
        )}

        <span className="text-zinc-600">|</span>

        {/* 使用者名稱、OAuth 角色與登出按鈕 */}
        <div className="flex items-center gap-2 text-zinc-300 font-medium">
          <span>{cashierLabel}</span>
          <span className="rounded bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 text-[11px] font-mono text-cyan-300 font-semibold">
            {userRole === 'admin' ? '管理員' : userRole === 'staff' ? '店員' : '未登入'}
          </span>
          <button
            type="button"
            onClick={handleLogoutClick}
            disabled={loggingOut}
            aria-busy={loggingOut || undefined}
            title={isMockService ? '示範模式沒有伺服器登入' : '登出這個裝置'}
            className="inline-flex items-center gap-1 rounded border border-zinc-700 bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-300 shadow-sm transition-all hover:border-rose-700/80 hover:bg-rose-950/60 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-wait disabled:opacity-60"
          >
            {loggingOut && <Spinner size="sm" />}
            {loggingOut ? '登出中...' : '登出'}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* 模式切換按鈕 */}
        {canToggleMockMode && (
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
        )}
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

      <Modal open={customStoreOpen} onClose={() => setCustomStoreOpen(false)} title="自訂登入門市">
        <form onSubmit={handleCustomStoreSubmit} className="space-y-4 text-sm text-zinc-200">
          <div>
            <label htmlFor="custom-store-name" className="mb-1 block text-sm font-medium text-zinc-300">門市名稱</label>
            <Input
              id="custom-store-name"
              value={customStoreName}
              onChange={(e) => setCustomStoreName(e.target.value)}
              placeholder="例如：信義概念店"
            />
            {customStoreError && <p className="mt-1 text-xs font-medium text-rose-300">{customStoreError}</p>}
          </div>
          <div className="flex justify-end gap-3 border-t border-zinc-800 pt-3">
            <Button type="button" variant="secondary" onClick={() => setCustomStoreOpen(false)}>
              取消
            </Button>
            <Button type="submit" variant="primary">
              確認更換
            </Button>
          </div>
        </form>
      </Modal>
    </header>
  );
}

