import { useState, useEffect, useMemo, useCallback } from 'react';
import { hasPermission } from '@/auth/permissions';
import { storeSwitchNotice } from '@/auth/storeSwitch';
import { useSessionStore } from '@/store/sessionStore';
import { switchLoginStore } from '@/store/authStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Spinner } from '@/components/feedback/Spinner';
import { useToastStore } from '@/components/feedback/toastStore';
import { useLocations } from '@/features/inventory/hooks/useLocations';
import { CreateLocationModal } from './components/CreateLocationModal';
import { EditLocationModal } from './components/EditLocationModal';
import { DeleteLocationModal } from './components/DeleteLocationModal';
import { WhitelistAccountsPanel } from './components/WhitelistAccountsPanel';
import type { StockLocationDto } from '@/types/inventory';
import type { Product } from '@/types/product';
import { productService, isMockService } from '@/services';

type SettingsSection = 'locations' | 'store_info' | 'security';

interface SettingsTabConfig {
  id: SettingsSection;
  label: string;
  description: string;
}

const SETTINGS_TABS: SettingsTabConfig[] = [
  { id: 'locations', label: '庫存據點管理', description: '管理多門市、總倉與調度暫存據點' },
  { id: 'store_info', label: '門市清單管理', description: '維護門市清單與切換目前營業門市' },
  { id: 'security', label: '使用者管理', description: '使用者管理，僅管理員可維護' },
];

export function SettingsPage() {
  const {
    userRole,
    setUserRole,
    storeName,
    stores,
    fetchStores,
    addStore,
    removeStore,
    oauthUser,
  } = useSessionStore();

  const showToast = useToastStore((s) => s.showToast);

  const canManageWhitelist = hasPermission(userRole, 'whitelist.manage');
  const { locations, isLoading, reloadLocations } = useLocations();

  const [products, setProducts] = useState<Product[]>([]);
  const [activeSection, setActiveSection] = useState<SettingsSection>('locations');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<StockLocationDto | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<StockLocationDto | null>(null);

  // 新增門市輸入欄位
  const [newStoreInput, setNewStoreInput] = useState('');

  const loadProducts = useCallback(async () => {
    try {
      const data = await productService.searchProducts({});
      setProducts(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    reloadLocations();
    loadProducts();
  }, [reloadLocations, loadProducts]);

  useEffect(() => {
    if (!canManageWhitelist && activeSection === 'security') {
      setActiveSection('locations');
    }
  }, [canManageWhitelist, activeSection]);

  // 各據點現有庫存統計
  const locationStockStats = useMemo(() => {
    const map: Record<string, { totalQty: number; productCount: number }> = {};
    products.forEach((p) => {
      p.stocks?.forEach((s) => {
        if (!map[s.location]) {
          map[s.location] = { totalQty: 0, productCount: 0 };
        }
        map[s.location].totalQty += s.quantity;
        if (s.quantity > 0) {
          map[s.location].productCount += 1;
        }
      });
    });
    return map;
  }, [products]);

  // 各據點依排序權重 (displayOrder) 遞增排序
  const sortedLocations = useMemo(() => {
    return [...locations].sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
  }, [locations]);

  const handleDataRefresh = () => {
    reloadLocations();
    loadProducts();
    fetchStores();
  };

  // 門市新增處理
  const handleAddStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newStoreInput.trim();
    if (!clean) {
      showToast('請輸入門市名稱', 'error');
      return;
    }
    const success = await addStore(clean);
    if (success) {
      showToast(`成功新增門市：「${clean}」`, 'success');
      setNewStoreInput('');
    } else {
      showToast(`門市「${clean}」已存在於清單中`, 'warning');
    }
  };

  // 門市刪除處理
  const handleRemoveStore = async (name: string) => {
    if (stores.length <= 1) {
      showToast('系統至少需保留一間門市，無法全數刪除', 'error');
      return;
    }
    const success = await removeStore(name);
    if (success) {
      showToast(`已刪除門市：「${name}」`, 'info');
      if (!isMockService && storeName === name) {
        showToast('已刪除目前登入門市。請再選擇一間登入門市，訂單才會歸到新的門市。', 'warning', 8000);
      }
    }
  };

  const visibleTabs = SETTINGS_TABS.filter((tab) => tab.id !== 'security' || canManageWhitelist);
  const activeLocationsCount = locations.filter((l) => l.isActive !== false).length;
  const totalStockAllLocations = Object.values(locationStockStats).reduce((acc, curr) => acc + curr.totalQty, 0);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-zinc-950 select-none p-6 space-y-5">
      {/* 頂部功能與管理員狀態列 */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <span>系統設定</span>
            </h1>
            <span className="rounded-full bg-emerald-950 border border-emerald-700/60 px-3 py-0.5 text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              {canManageWhitelist ? '管理員' : '店員'}
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            全域系統參數維護 • 庫存據點管理、門市清單與使用者管理
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isMockService && (
            <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-400">
              <span>測試角色:</span>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="bg-transparent font-bold text-cyan-300 focus:outline-none cursor-pointer"
              >
                <option value="admin">admin (管理員)</option>
                <option value="staff">staff (一般店員)</option>
              </select>
            </div>
          )}

          <span className="text-xs text-zinc-400 font-mono">
            登入帳號: <strong className="text-cyan-300">{oauthUser?.email || '未設定'}</strong>
          </span>
        </div>
      </div>

      {/* 系統設定多模組分頁選單 (Sub-navigation Tabs) */}
      <div className="flex border-b border-zinc-800 gap-2">
        {visibleTabs.map((tab) => {
          const isCurrent = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl border-t border-x transition-all ${
                isCurrent
                  ? 'border-zinc-700 bg-zinc-900 text-cyan-300 border-b-2 border-b-cyan-400 shadow-sm'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 模組內容區域 */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* 1. 庫存據點管理模組 (表格呈現) */}
        {activeSection === 'locations' && (
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            {/* 據點統計概況列 */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <span>據點總數: <strong className="text-cyan-400 font-mono text-base font-bold">{locations.length}</strong> 個</span>
                <span>•</span>
                <span>啟用中: <strong className="text-emerald-400 font-mono text-base font-bold">{activeLocationsCount}</strong> 個</span>
                <span>•</span>
                <span>全據點在庫總量: <strong className="text-amber-400 font-mono text-base font-bold">{totalStockAllLocations}</strong> 台</span>
              </div>

              <Button
                variant="primary"
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold px-4 py-1.5 flex items-center gap-2 shadow-sm text-sm"
              >
                <span>新增庫存據點</span>
              </Button>
            </div>

            {/* 庫存據點表格 (Table View) */}
            <div className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden flex flex-col shadow-xl">
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Spinner />
                </div>
              ) : locations.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-zinc-500">
                  <span>目前尚未建立任何庫存據點</span>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-3 bg-cyan-500 text-zinc-950 font-bold"
                  >
                    + 建立第一個據點
                  </Button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full table-fixed text-left text-sm border-collapse">
                    <thead className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950 text-zinc-400 font-semibold select-none">
                      <tr>
                        <th className="py-3 pl-4 pr-2 w-16 text-center">排序</th>
                        <th className="py-3 px-3">據點名稱</th>
                        <th className="py-3 px-3 w-48 text-right">現有庫存數量</th>
                        <th className="py-3 px-3 w-32 text-center">啟用狀態</th>
                        <th className="py-3 pl-3 pr-4 w-60 text-right whitespace-nowrap">管理操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-medium">
                      {sortedLocations.map((loc) => {
                        const isActive = loc.isActive !== false;
                        const stats = locationStockStats[loc.id] || { totalQty: 0, productCount: 0 };

                        return (
                          <tr
                            key={loc.id}
                            className="hover:bg-zinc-800/40 transition-colors group"
                          >
                            {/* 排序 */}
                            <td className="py-3.5 pl-4 pr-2 text-center font-mono text-xs text-zinc-500 font-bold">
                              #{loc.displayOrder ?? 1}
                            </td>

                            {/* 據點名稱與圖示 */}
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl p-1 bg-zinc-800 rounded-lg border border-zinc-700/80 min-w-[40px] text-center">
                                  {loc.icon || '📍'}
                                </span>
                                <div>
                                  <span className="font-bold text-base text-zinc-100 group-hover:text-cyan-300 transition-colors">
                                    {loc.name}
                                  </span>
                                  {loc.isDefault && (
                                    <span className="ml-2 inline-block text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.2 rounded">
                                      預設
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* 現有庫存數量 */}
                            <td className="py-3.5 px-3 text-right">
                              <div className="flex flex-col items-end">
                                <span
                                  className={`font-mono text-base font-bold ${
                                    stats.totalQty > 0 ? 'text-emerald-400' : 'text-zinc-500'
                                  }`}
                                >
                                  {stats.totalQty} 台
                                </span>
                                <span className="text-xs text-zinc-500 font-mono">
                                  {stats.productCount} 項現貨商品
                                </span>
                              </div>
                            </td>

                            {/* 啟用狀態 */}
                            <td className="py-3.5 px-3 text-center">
                              <span
                                className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                                  isActive
                                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                                    : 'bg-zinc-800/80 text-zinc-500 border-zinc-700'
                                }`}
                              >
                                {isActive ? '🟢 啟用中' : '⚪ 已停用'}
                              </span>
                            </td>

                            {/* 管理操作 */}
                            <td className="py-3.5 pl-3 pr-4 text-right">
                              <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => setEditingLocation(loc)}
                                  className="text-xs px-2.5 py-1 border-zinc-700 hover:border-cyan-500 hover:text-cyan-300 whitespace-nowrap"
                                >
                                  編輯
                                </Button>

                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => setDeletingLocation(loc)}
                                  className="text-xs px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 whitespace-nowrap"
                                  title="刪除此地點並將庫存全數轉移至目標據點"
                                >
                                  刪除 (轉移庫存)
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. 門市基本設定模組 (僅增刪門市清單) */}
        {activeSection === 'store_info' && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-6 max-w-2xl">
            <div>
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <span>門市清單管理</span>
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                維護所有營業分店門市名稱，並可指定系統目前使用的登入門市。
              </p>
            </div>

            {/* 新增門市表單 */}
            <form onSubmit={handleAddStoreSubmit} className="flex gap-2">
              <Input
                value={newStoreInput}
                onChange={(e) => setNewStoreInput(e.target.value)}
                placeholder="輸入新門市名稱 (例如: 台中公益店, 台南西門店)"
                className="flex-1 font-semibold"
              />
              <Button
                type="submit"
                variant="primary"
                className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold px-4 whitespace-nowrap"
              >
                新增門市
              </Button>
            </form>

            {/* 門市清單列表 */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden divide-y divide-zinc-800/80">
              {stores.map((store) => {
                const isCurrent = storeName === store;
                return (
                  <div
                    key={store}
                    className="flex items-center justify-between p-3.5 hover:bg-zinc-900/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="font-bold text-zinc-100 text-base">{store}</span>
                        {isCurrent && (
                          <span className="ml-2 inline-block text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full">
                            ● 目前登入門市
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isCurrent && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            void (async () => {
                              const result = await switchLoginStore(store);
                              if (!result.ok) {
                                showToast(result.message, 'error');
                                return;
                              }
                              if (result.cartItemCount > 0) showToast(storeSwitchNotice(store), 'warning', 8000);
                              else showToast(`已切換目前登入門市為「${store}」`, 'info');
                            })();
                          }}
                          className="text-xs px-2.5 py-1 border-zinc-700 hover:border-emerald-500 hover:text-emerald-300"
                        >
                          設為登入門市
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleRemoveStore(store)}
                        disabled={stores.length <= 1}
                        className="text-xs px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60"
                        title={stores.length <= 1 ? '至少需保留一間門市' : `刪除門市「${store}」`}
                      >
                        刪除
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeSection === 'security' && canManageWhitelist && (
          <WhitelistAccountsPanel actorEmail={oauthUser.email || ''} actorRole={userRole} />
        )}
      </div>

      {/* 新增地點彈窗 */}
      <CreateLocationModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleDataRefresh}
        existingLocations={locations}
      />

      {/* 編輯地點彈窗 */}
      <EditLocationModal
        location={editingLocation}
        onClose={() => setEditingLocation(null)}
        onSuccess={handleDataRefresh}
      />

      {/* 刪除地點與庫存轉移彈窗 */}
      <DeleteLocationModal
        location={deletingLocation}
        availableTargets={locations.filter((l) => l.id !== deletingLocation?.id)}
        onClose={() => setDeletingLocation(null)}
        onSuccess={handleDataRefresh}
      />
    </div>
  );
}
