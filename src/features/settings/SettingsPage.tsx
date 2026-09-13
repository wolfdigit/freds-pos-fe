import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { useUiStore } from '@/store/uiStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Spinner } from '@/components/feedback/Spinner';
import { useToastStore } from '@/components/feedback/toastStore';
import { useLocations } from '@/features/inventory/hooks/useLocations';
import { CreateLocationModal } from './components/CreateLocationModal';
import { EditLocationModal } from './components/EditLocationModal';
import { DeleteLocationModal } from './components/DeleteLocationModal';
import type { StockLocationDto } from '@/types/inventory';
import type { Product } from '@/types/product';
import { productService, isMockService } from '@/services';

type SettingsSection = 'locations' | 'store_info' | 'security';

interface SettingsTabConfig {
  id: SettingsSection;
  label: string;
  icon: string;
  description: string;
}

const SETTINGS_TABS: SettingsTabConfig[] = [
  { id: 'locations', label: '庫存據點管理', icon: '📍', description: '管理多門市、總倉與調度暫存據點' },
  { id: 'store_info', label: '門市清單管理', icon: '🏪', description: '維護門市清單與切換目前營業門市' },
  { id: 'security', label: 'OAuth 帳號權限', icon: '🛡️', description: 'Google 登入之管理員與店員 Gmail 名單維護' },
];

export function SettingsPage() {
  const {
    userRole,
    cashierName,
    isSystemAdmin,
    setUserRole,
    storeName,
    stores,
    setStoreName,
    addStore,
    removeStore,
    adminAccounts,
    staffAccounts,
    addAdminAccount,
    updateAdminAccount,
    removeAdminAccount,
    addStaffAccount,
    updateStaffAccount,
    removeStaffAccount,
    oauthUser,
  } = useSessionStore();

  const setActiveTab = useUiStore((s) => s.setActiveTab);
  const showToast = useToastStore((s) => s.showToast);

  const isAdmin = isSystemAdmin();
  const { locations, isLoading, reloadLocations } = useLocations();

  const [products, setProducts] = useState<Product[]>([]);
  const [activeSection, setActiveSection] = useState<SettingsSection>('locations');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<StockLocationDto | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<StockLocationDto | null>(null);

  // 新增門市輸入欄位
  const [newStoreInput, setNewStoreInput] = useState('');

  // 新增管理員/店員 名稱、Gmail 與附註輸入欄位
  const [newAdminNameInput, setNewAdminNameInput] = useState('');
  const [newAdminEmailInput, setNewAdminEmailInput] = useState('');
  const [newAdminNoteInput, setNewAdminNoteInput] = useState('');

  const [newStaffNameInput, setNewStaffNameInput] = useState('');
  const [newStaffEmailInput, setNewStaffEmailInput] = useState('');
  const [newStaffNoteInput, setNewStaffNoteInput] = useState('');

  // 帳號編輯狀態 (名稱 + 附註)
  const [editingAccountEmail, setEditingAccountEmail] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState('');
  const [editingNoteValue, setEditingNoteValue] = useState('');

  const loadProducts = useCallback(async () => {
    try {
      const data = await productService.searchProducts({});
      setProducts(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      reloadLocations();
      loadProducts();
    }
  }, [isAdmin, reloadLocations, loadProducts]);

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
  };

  // 門市新增處理
  const handleAddStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newStoreInput.trim();
    if (!clean) {
      showToast('請輸入門市名稱', 'error');
      return;
    }
    const success = addStore(clean);
    if (success) {
      showToast(`✨ 成功新增門市：「${clean}」`, 'success');
      setNewStoreInput('');
    } else {
      showToast(`門市「${clean}」已存在於清單中`, 'warning');
    }
  };

  // 門市刪除處理
  const handleRemoveStore = (name: string) => {
    if (stores.length <= 1) {
      showToast('系統至少需保留一間門市，無法全數刪除', 'error');
      return;
    }
    const success = removeStore(name);
    if (success) {
      showToast(`🗑️ 已刪除門市：「${name}」`, 'info');
    }
  };

  // 新增管理員 Gmail 處理
  const handleAddAdminEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newAdminEmailInput.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      showToast('請輸入有效的 Gmail / 電子信箱格式', 'error');
      return;
    }
    const success = addAdminAccount(clean, newAdminNameInput.trim(), newAdminNoteInput.trim());
    if (success) {
      showToast(`👑 成功新增管理員：「${newAdminNameInput.trim() || clean}」`, 'success');
      setNewAdminNameInput('');
      setNewAdminEmailInput('');
      setNewAdminNoteInput('');
    } else {
      showToast(`該帳號「${clean}」已在管理員名單中`, 'warning');
    }
  };

  // 刪除管理員 Gmail 處理
  const handleRemoveAdminEmail = (email: string) => {
    if (adminAccounts.length <= 1) {
      showToast('系統至少需保留一位系統管理員，無法全部刪除', 'error');
      return;
    }
    const success = removeAdminAccount(email);
    if (success) {
      showToast(`🗑️ 已移除管理員 Gmail：「${email}」`, 'info');
    }
  };

  // 新增店員 Gmail 處理
  const handleAddStaffEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newStaffEmailInput.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      showToast('請輸入有效的 Gmail / 電子信箱格式', 'error');
      return;
    }
    const success = addStaffAccount(clean, newStaffNameInput.trim(), newStaffNoteInput.trim());
    if (success) {
      showToast(`👤 成功新增店員：「${newStaffNameInput.trim() || clean}」`, 'success');
      setNewStaffNameInput('');
      setNewStaffEmailInput('');
      setNewStaffNoteInput('');
    } else {
      showToast(`該帳號「${clean}」已在店員名單中`, 'warning');
    }
  };

  // 刪除店員 Gmail 處理
  const handleRemoveStaffEmail = (email: string) => {
    const success = removeStaffAccount(email);
    if (success) {
      showToast(`🗑️ 已移除店員 Gmail：「${email}」`, 'info');
    }
  };

  // 儲存帳號編輯 (名稱 + 附註)
  const handleSaveAccountEdit = (email: string, isStaff: boolean) => {
    const data = {
      name: editingNameValue.trim(),
      note: editingNoteValue.trim(),
    };
    if (isStaff) {
      updateStaffAccount(email, data);
    } else {
      updateAdminAccount(email, data);
    }
    showToast(`✨ 已更新「${email}」的名稱與附註`, 'success');
    setEditingAccountEmail(null);
    setEditingNameValue('');
    setEditingNoteValue('');
  };

  // 1. 若 OAuth 驗證身分未具備管理員權限 (Non-admin)
  if (!isAdmin) {
    return (
      <div className="flex h-full flex-col items-center justify-center select-none px-4">
        <div className="w-full max-w-md rounded-2xl border border-rose-800/50 bg-zinc-950/90 p-8 shadow-2xl backdrop-blur-md text-center space-y-5 animate-fade-in">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-950/80 border border-rose-700/60 text-3xl shadow-inner shadow-rose-900">
            ⛔
          </div>

          <div>
            <h2 className="text-2xl font-bold text-zinc-100 tracking-wide">
              存取權限不足
            </h2>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              您目前的 Google 登入帳號「<strong className="text-zinc-200">{oauthUser?.email || cashierName}</strong>」角色為 <span className="font-mono text-rose-300 font-bold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">{userRole}</span>，未在系統管理員 Gmail 白名單中。
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-500 text-left space-y-1">
            <p className="text-zinc-400 font-semibold">💡 系統說明：</p>
            <p>• 系統設定模組僅限在「管理員 Gmail 白名單」內之 Google 帳號存取。</p>
            <p>• 如需變更權限，請由公司主管理員於此頁面新增授權您的 Gmail。</p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button
              variant="primary"
              onClick={() => setActiveTab(null)}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold py-2.5"
            >
              返回首頁
            </Button>

            {isMockService && (
              <button
                onClick={() => setUserRole('admin')}
                className="text-xs text-zinc-500 hover:text-cyan-400 underline pt-1 font-mono"
              >
                [示範環境切換] 切換為管理員身分 (admin)
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. OAuth 驗證具備管理員權限 (Admin)
  const activeLocationsCount = locations.filter((l) => l.isActive !== false).length;
  const totalStockAllLocations = Object.values(locationStockStats).reduce((acc, curr) => acc + curr.totalQty, 0);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-zinc-950 select-none p-6 space-y-5">
      {/* 頂部功能與管理員狀態列 */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <span>⚙️</span>
              <span>系統設定</span>
            </h1>
            <span className="rounded-full bg-emerald-950 border border-emerald-700/60 px-3 py-0.5 text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              Google OAuth 管理員驗證通過
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            全域系統參數維護 • 庫存據點管理、門市清單與 Google 登入帳號權限
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
                <option value="admin">👑 admin (管理員)</option>
                <option value="staff">👤 staff (一般店員)</option>
              </select>
            </div>
          )}

          <span className="text-xs text-zinc-400 font-mono">
            登入帳號: <strong className="text-cyan-300">{oauthUser?.email || 'admin@gmail.com'}</strong>
          </span>
        </div>
      </div>

      {/* 系統設定多模組分頁選單 (Sub-navigation Tabs) */}
      <div className="flex border-b border-zinc-800 gap-2">
        {SETTINGS_TABS.map((tab) => {
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
              <span className="text-lg">{tab.icon}</span>
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
                <span>➕</span>
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
                  <span className="text-3xl mb-2">📍</span>
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
                                  ✏️ 編輯
                                </Button>

                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => setDeletingLocation(loc)}
                                  className="text-xs px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 whitespace-nowrap"
                                  title="刪除此地點並將庫存全數轉移至目標據點"
                                >
                                  🗑️ 刪除 (轉移庫存)
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
                <span>🏪</span>
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
                ➕ 新增門市
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
                      <span className="text-xl">🏬</span>
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
                            setStoreName(store);
                            showToast(`已切換目前登入門市為「${store}」`, 'info');
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
                        🗑️ 刪除
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. OAuth 角色權限模組 (增刪管理員/店員 Gmail 與附註欄位) */}
        {activeSection === 'security' && (
          <div className="space-y-6 max-w-5xl">
            {/* 說明區塊 */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-2">
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <span>🛡️</span>
                <span>Google OAuth 帳號權限白名單</span>
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                本系統整合 Google 登入。使用者透過 Google 登入 (OAuth) 時，系統將比對其 Gmail 信箱，自動賦予「<strong>系統管理員 (admin)</strong>」或「<strong>一般店員 (staff)</strong>」角色權限，並可自訂每位成員的備註說明。
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 👑 管理員 Gmail 名單 */}
              <div className="rounded-2xl border border-amber-800/40 bg-zinc-900/60 p-5 space-y-4 flex flex-col">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-amber-300 text-base flex items-center gap-2">
                      <span>👑</span>
                      <span>系統管理員名單</span>
                    </h4>
                    <span className="font-mono text-xs text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                      {adminAccounts.length} 位
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    具備系統最高權限：可進入系統設定、管理庫存據點、門市與帳號白名單。
                  </p>
                </div>

                {/* 新增管理員 名稱、Gmail 與附註 */}
                <form onSubmit={handleAddAdminEmailSubmit} className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/80 p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                    <div className="sm:col-span-2">
                      <Input
                        type="text"
                        value={newAdminNameInput}
                        onChange={(e) => setNewAdminNameInput(e.target.value)}
                        placeholder="名稱 (如: 店長 Fred)"
                        className="text-sm font-semibold"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        type="email"
                        value={newAdminEmailInput}
                        onChange={(e) => setNewAdminEmailInput(e.target.value)}
                        placeholder="Gmail (必填)"
                        className="text-sm"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        type="text"
                        value={newAdminNoteInput}
                        onChange={(e) => setNewAdminNoteInput(e.target.value)}
                        placeholder="附註說明 (選填)"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 text-xs"
                    >
                      ➕ 新增管理員
                    </Button>
                  </div>
                </form>

                {/* 管理員清單 */}
                <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden divide-y divide-zinc-800">
                  {adminAccounts.map((account) => {
                    const isSelf = oauthUser?.email?.toLowerCase() === account.email.toLowerCase();
                    const isEditing = editingAccountEmail === account.email;

                    return (
                      <div
                        key={account.email}
                        className="p-3 hover:bg-zinc-900/60 transition-colors space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-wrap">
                            <span className="text-xs">🔑</span>
                            <span className="font-bold text-sm text-zinc-100">
                              {account.name || '未設定名稱'}
                            </span>
                            <span className="font-mono text-xs text-amber-300/80 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/40">
                              {account.email}
                            </span>
                            {isSelf && (
                              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.2 rounded font-bold whitespace-nowrap">
                                您目前登入中
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {!isEditing && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingAccountEmail(account.email);
                                  setEditingNameValue(account.name || '');
                                  setEditingNoteValue(account.note || '');
                                }}
                                className="text-xs text-zinc-400 hover:text-cyan-300 px-2 py-1 rounded bg-zinc-800/60 border border-zinc-700/60"
                                title="編輯名稱與附註說明"
                              >
                                ✏️ 編輯
                              </button>
                            )}

                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleRemoveAdminEmail(account.email)}
                              disabled={adminAccounts.length <= 1}
                              className="text-xs px-2 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60"
                              title={adminAccounts.length <= 1 ? '至少需保留一位管理員' : `移除管理員「${account.email}」`}
                            >
                              🗑️
                            </Button>
                          </div>
                        </div>

                        {/* 名稱與附註顯示或編輯欄位 */}
                        {isEditing ? (
                          <div className="space-y-2 pt-1 bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-700">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] text-zinc-400 font-semibold mb-1">名稱/姓名</label>
                                <Input
                                  value={editingNameValue}
                                  onChange={(e) => setEditingNameValue(e.target.value)}
                                  placeholder="名稱 (如: 店長 Fred)"
                                  className="text-xs py-1"
                                  autoFocus
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-zinc-400 font-semibold mb-1">附註說明</label>
                                <Input
                                  value={editingNoteValue}
                                  onChange={(e) => setEditingNoteValue(e.target.value)}
                                  placeholder="附註 (如: 資訊主管)"
                                  className="text-xs py-1"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveAccountEdit(account.email, false);
                                    if (e.key === 'Escape') setEditingAccountEmail(null);
                                  }}
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingAccountEmail(null)}
                                className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                              >
                                取消
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveAccountEdit(account.email, false)}
                                className="px-3 py-1 text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded font-bold"
                              >
                                儲存變更
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-zinc-400 flex items-center gap-1.5 pl-5">
                            <span className="text-zinc-500">附註:</span>
                            {account.note ? (
                              <span className="text-zinc-300 font-medium bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                                {account.note}
                              </span>
                            ) : (
                              <span className="text-zinc-600 italic">無備註</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 👤 一般店員 Gmail 名單 */}
              <div className="rounded-2xl border border-emerald-800/40 bg-zinc-900/60 p-5 space-y-4 flex flex-col">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-emerald-300 text-base flex items-center gap-2">
                      <span>👤</span>
                      <span>一般店員名單</span>
                    </h4>
                    <span className="font-mono text-xs text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      {staffAccounts.length} 位
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    具備前台 POS 操作權限：一般結帳收銀、客戶查詢與庫存查詢。
                  </p>
                </div>

                {/* 新增店員 名稱、Gmail 與附註 */}
                <form onSubmit={handleAddStaffEmailSubmit} className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/80 p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                    <div className="sm:col-span-2">
                      <Input
                        type="text"
                        value={newStaffNameInput}
                        onChange={(e) => setNewStaffNameInput(e.target.value)}
                        placeholder="名稱 (如: 王小美)"
                        className="text-sm font-semibold"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        type="email"
                        value={newStaffEmailInput}
                        onChange={(e) => setNewStaffEmailInput(e.target.value)}
                        placeholder="Gmail (必填)"
                        className="text-sm"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        type="text"
                        value={newStaffNoteInput}
                        onChange={(e) => setNewStaffNoteInput(e.target.value)}
                        placeholder="附註說明 (選填)"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-4 text-xs"
                    >
                      ➕ 新增店員
                    </Button>
                  </div>
                </form>

                {/* 店員清單 */}
                <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden divide-y divide-zinc-800">
                  {staffAccounts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-zinc-500">
                      目前尚未加入任何店員 Gmail
                    </div>
                  ) : (
                    staffAccounts.map((account) => {
                      const isSelf = oauthUser?.email?.toLowerCase() === account.email.toLowerCase();
                      const isEditing = editingAccountEmail === account.email;

                      return (
                        <div
                          key={account.email}
                          className="p-3 hover:bg-zinc-900/60 transition-colors space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-wrap">
                              <span className="text-xs">👤</span>
                              <span className="font-bold text-sm text-zinc-100">
                                {account.name || '未設定名稱'}
                              </span>
                              <span className="font-mono text-xs text-emerald-300/80 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40">
                                {account.email}
                              </span>
                              {isSelf && (
                                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.2 rounded font-bold whitespace-nowrap">
                                  您目前登入中
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {!isEditing && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingAccountEmail(account.email);
                                    setEditingNameValue(account.name || '');
                                    setEditingNoteValue(account.note || '');
                                  }}
                                  className="text-xs text-zinc-400 hover:text-cyan-300 px-2 py-1 rounded bg-zinc-800/60 border border-zinc-700/60"
                                  title="編輯名稱與附註說明"
                                >
                                  ✏️ 編輯
                                </button>
                              )}

                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleRemoveStaffEmail(account.email)}
                                className="text-xs px-2 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60"
                                title={`移除店員「${account.email}」`}
                              >
                                🗑️
                              </Button>
                            </div>
                          </div>

                          {/* 名稱與附註顯示或編輯欄位 */}
                          {isEditing ? (
                            <div className="space-y-2 pt-1 bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-700">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[11px] text-zinc-400 font-semibold mb-1">名稱/姓名</label>
                                  <Input
                                    value={editingNameValue}
                                    onChange={(e) => setEditingNameValue(e.target.value)}
                                    placeholder="名稱 (如: 王小美)"
                                    className="text-xs py-1"
                                    autoFocus
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] text-zinc-400 font-semibold mb-1">附註說明</label>
                                  <Input
                                    value={editingNoteValue}
                                    onChange={(e) => setEditingNoteValue(e.target.value)}
                                    placeholder="附註 (如: 早班收銀)"
                                    className="text-xs py-1"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveAccountEdit(account.email, true);
                                      if (e.key === 'Escape') setEditingAccountEmail(null);
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingAccountEmail(null)}
                                  className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                                >
                                  取消
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveAccountEdit(account.email, true)}
                                  className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold"
                                >
                                  儲存變更
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-zinc-400 flex items-center gap-1.5 pl-5">
                              <span className="text-zinc-500">附註:</span>
                              {account.note ? (
                                <span className="text-zinc-300 font-medium bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                                  {account.note}
                                </span>
                              ) : (
                                <span className="text-zinc-600 italic">無備註</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
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
