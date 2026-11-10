import { useEffect, useState } from 'react';
import { hasPermission } from '@/auth/permissions';
import { errorMessage } from '@/auth/businessError';
import { storeSwitchNotice } from '@/auth/storeSwitch';
import { readPersistedCart } from '@/auth/cartPersistence';
import { authApi } from '@/services/api/httpAuthService';
import { locationService, systemService } from '@/services';
import { DEFAULT_INVENTORY_LOCATIONS, type InventoryLocationDto } from '@/types/inventory';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Spinner } from '@/components/feedback/Spinner';
import { useToastStore } from '@/components/feedback/toastStore';
import { useAuthStore } from '@/store/authStore';
import type { StoreDto } from '@/types/system';

export function StoreSelectScreen() {
  const user = useAuthStore((state) => state.user);
  const selectStore = useAuthStore((state) => state.selectStore);
  const logout = useAuthStore((state) => state.logout);
  const [stores, setStores] = useState<StoreDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newStoreName, setNewStoreName] = useState('');
  const [locations, setLocations] = useState<InventoryLocationDto[]>([]);
  const [normalLocationId, setNormalLocationId] = useState('');
  const [returnedLocationId, setReturnedLocationId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const showToast = useToastStore((state) => state.showToast);
  const canCreateInitial = hasPermission(user?.role, 'store.createInitial');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    authApi
      .listStores()
      .then((rows) => {
        if (!cancelled) setStores(rows);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, '無法讀取門市清單'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    locationService
      .getLocations()
      .catch(() =>
        DEFAULT_INVENTORY_LOCATIONS.map((location) => ({
          id: location.id,
          name: location.name,
          icon: location.icon,
          isDefault: location.isDefault,
          displayOrder: location.displayOrder,
          storeNames: [],
          returnedStoreNames: [],
        }))
      )
      .then((rows) => {
        if (cancelled) return;
        setLocations(rows);
        setNormalLocationId(rows[0]?.id ?? '');
        setReturnedLocationId(rows.find((row) => row.name === '退貨品')?.id ?? rows[0]?.id ?? '');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const choose = async (storeName: string) => {
    setError(null);
    setSubmitting(true);
    const savedItems = user?.id ? readPersistedCart(user.id).items.length : 0;
    try {
      await selectStore(storeName);
      if (savedItems > 0) showToast(storeSwitchNotice(storeName), 'warning', 8000);
    } catch (err) {
      setError(errorMessage(err, '無法選擇門市'));
    } finally {
      setSubmitting(false);
    }
  };

  const createFirstStore = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = newStoreName.trim();
    if (!name || !normalLocationId || !returnedLocationId) {
      setError('請填寫門市名稱，並選擇正常貨與退貨庫存點');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await systemService.createStore({
        name,
        inventoryLocationId: normalLocationId,
        returnedInventoryLocationId: returnedLocationId,
      });
      await choose(name);
    } catch (err) {
      setError(errorMessage(err, '無法建立門市'));
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <section className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl">
        <h1 className="text-2xl font-bold">選擇登入門市</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          {user?.name}（{user?.email}）已登入。登入門市決定結帳扣哪個正常貨庫存點、退貨進哪個退貨庫存點。
        </p>
        {loading ? (
          <div className="mt-6 flex justify-center">
            <Spinner />
          </div>
        ) : stores.length === 0 ? (
          canCreateInitial ? (
            <form onSubmit={createFirstStore} className="mt-6 space-y-3">
              <p className="text-sm text-zinc-300">目前還沒有門市。請先建立第一間，建立後會直接選為這次登入門市。</p>
              <label htmlFor="first-store-name" className="block text-sm font-medium text-zinc-300">
                門市名稱
              </label>
              <Input
                id="first-store-name"
                value={newStoreName}
                onChange={(event) => setNewStoreName(event.target.value)}
                placeholder="例如：奇可門市"
              />
              <label className="block text-sm text-zinc-300" htmlFor="first-store-normal">
                正常貨庫存點
                <select
                  id="first-store-normal"
                  value={normalLocationId}
                  onChange={(event) => setNormalLocationId(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                >
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>{location.name}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-zinc-300" htmlFor="first-store-returned">
                退貨庫存點
                <select
                  id="first-store-returned"
                  value={returnedLocationId}
                  onChange={(event) => setReturnedLocationId(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                >
                  {locations.map((location) => (
                    <option key={`returned-${location.id}`} value={location.id}>{location.name}</option>
                  ))}
                </select>
              </label>
              <p className="text-xs text-zinc-500">兩個可以選同一個。尚未選門市時若讀不到地點清單，會用系統預設的五個庫存點。</p>
              <Button type="submit" variant="primary" disabled={submitting}>
                建立並進入
              </Button>
            </form>
          ) : (
            <p className="mt-6 text-sm text-amber-200">
              目前沒有門市。請管理員建立第一間後再選擇。店員在還沒選門市時不能建立門市。
            </p>
          )
        ) : (
          <ul className="mt-6 space-y-2">
            {stores.map((store) => (
              <li key={store.name}>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void choose(store.name)}
                  className="flex w-full items-center justify-between rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-left hover:border-cyan-500 disabled:opacity-60"
                >
                  <span className="font-semibold">{store.name}</span>
                  {store.isDefault && <span className="text-xs text-cyan-300">預設</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
        {error && (
          <p className="mt-4 text-sm text-rose-300" role="alert">
            {error}
          </p>
        )}
        <div className="mt-6">
          <Button type="button" variant="ghost" onClick={() => void logout()}>
            登出
          </Button>
        </div>
      </section>
    </div>
  );
}
