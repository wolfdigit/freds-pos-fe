import { useEffect, useState } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { useUiStore } from '@/store/uiStore';
import { Button } from '@/components/common/Button';
import { resetDemoData } from '@/services';
import { useToastStore } from '@/components/feedback/toastStore';

const PRESET_STORES = ['台北旗艦店', '新竹巨城店', '台中中港店', '高雄巨蛋店', '線上官方門市'];

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
  const { storeName, cashierName, setStoreName } = useSessionStore();
  const setActiveTab = useUiStore((s) => s.setActiveTab);
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

  const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__CUSTOM__') {
      const custom = window.prompt('請輸入新門市名稱：', storeName);
      if (custom && custom.trim()) {
        setStoreName(custom.trim());
        showToast(`已成功更換門市為：「${custom.trim()}」`, 'success');
      }
    } else {
      setStoreName(val);
      showToast(`已成功更換門市為：「${val}」`, 'success');
    }
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
          className="font-extrabold text-cyan-400 tracking-wider hover:text-cyan-300 transition-colors"
        >
          FRED'S POS
        </button>
        <span className="text-zinc-600">|</span>

        {/* 可更改門市選單 */}
        <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
          <span>門市:</span>
          <select
            value={PRESET_STORES.includes(storeName) ? storeName : '__CUSTOM__'}
            onChange={handleStoreChange}
            className="rounded-lg bg-zinc-800/90 border border-zinc-700/80 px-2.5 py-1 text-sm font-semibold text-cyan-300 focus:border-cyan-400 focus:outline-none cursor-pointer hover:border-zinc-500 hover:bg-zinc-800 transition-all shadow-sm"
            title="點擊更改門市"
          >
            {PRESET_STORES.map((s) => (
              <option key={s} value={s}>
                🏢 {s}
              </option>
            ))}
            {!PRESET_STORES.includes(storeName) && (
              <option value="__CUSTOM__">🏢 {storeName}</option>
            )}
            <option value="__CUSTOM__">✏️ 自訂其他門市...</option>
          </select>
        </div>

        <span className="text-zinc-600">|</span>

        {/* 使用者名稱與登出按鈕 */}
        <div className="flex items-center gap-2 text-zinc-300 font-medium">
          <span>收銀員: {cashierName}</span>
          <button
            onClick={handleLogoutClick}
            title="未開放此功能"
            className="rounded bg-zinc-800/80 hover:bg-rose-950/60 border border-zinc-700 hover:border-rose-700/80 px-2 py-0.5 text-xs text-zinc-300 hover:text-rose-300 transition-all shadow-sm"
          >
            🚪 登出
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="font-mono text-sm text-zinc-400">{formatClock(now)}</span>
        <Button size="sm" variant={confirmingReset ? 'danger' : 'ghost'} onClick={handleReset}>
          ↻ 重置示範資料
        </Button>
      </div>
    </header>
  );
}

