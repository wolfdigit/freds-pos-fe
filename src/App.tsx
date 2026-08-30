import { useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useUiStore } from '@/store/uiStore';
import { CheckoutPage } from '@/features/checkout/CheckoutPage';
import { InventoryPage } from '@/features/inventory/InventoryPage';
import { CustomersPage } from '@/features/customers/CustomersPage';
import { getStateFromHash, getHashFromState } from '@/utils/hashRouter';

export function App() {
  const { activeTab, setActiveTab, syncStateFromHash } = useUiStore();

  useEffect(() => {
    // 初始開啟頁面時解析 URL Hash 並同步 Zustand Store
    const initialRoute = getStateFromHash(window.location.hash);
    syncStateFromHash(initialRoute.activeTab, initialRoute.selectedCustomerId);

    if (!window.location.hash) {
      window.location.hash = getHashFromState(initialRoute.activeTab, initialRoute.selectedCustomerId);
    }

    // 監聽瀏覽器上一頁 / 下一頁 (hashchange)
    const handleHashChange = () => {
      const route = getStateFromHash(window.location.hash);
      syncStateFromHash(route.activeTab, route.selectedCustomerId);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [syncStateFromHash]);


  return (
    <MainLayout>
      {activeTab === null && (
        <div className="flex h-full flex-col items-center justify-center text-center select-none px-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 max-w-lg shadow-2xl backdrop-blur-sm">
            <div className="text-5xl mb-4">🏎️</div>
            <h2 className="text-2xl font-bold text-zinc-100 tracking-wide">
              歡迎使用 FRED'S POS 系統
            </h2>
            <p className="mt-3 text-base text-zinc-400 leading-relaxed">
              請點擊左側導覽列選擇要進行的操作功能，或直接點選下方快捷入口：
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => setActiveTab('checkout')}
                className="flex items-center justify-between rounded-xl border border-zinc-700 bg-zinc-800/80 px-5 py-3.5 text-base font-semibold text-zinc-100 hover:border-cyan-500 hover:bg-cyan-950/30 hover:text-cyan-300 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🧾</span>
                  <span>出單 / 結帳櫃檯</span>
                </div>
                <span className="text-zinc-500 text-sm font-mono">前往 →</span>
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className="flex items-center justify-between rounded-xl border border-zinc-700 bg-zinc-800/80 px-5 py-3.5 text-base font-semibold text-zinc-100 hover:border-cyan-500 hover:bg-cyan-950/30 hover:text-cyan-300 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📦</span>
                  <span>商品及庫存管理</span>
                </div>
                <span className="text-zinc-500 text-sm font-mono">前往 →</span>
              </button>
              <button
                onClick={() => setActiveTab('customers')}
                className="flex items-center justify-between rounded-xl border border-zinc-700 bg-zinc-800/80 px-5 py-3.5 text-base font-semibold text-zinc-100 hover:border-cyan-500 hover:bg-cyan-950/30 hover:text-cyan-300 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👤</span>
                  <span>客戶會員管理</span>
                </div>
                <span className="text-zinc-500 text-sm font-mono">前往 →</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'checkout' && <CheckoutPage />}
      {activeTab === 'inventory' && <InventoryPage />}
      {activeTab === 'customers' && <CustomersPage />}
    </MainLayout>
  );
}
