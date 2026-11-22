import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { errorMessage } from '@/auth/businessError';
import { systemService } from '@/services';
import type { ISystemService } from '@/services/interfaces/ISystemService';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Spinner } from '@/components/feedback/Spinner';
import { useToastStore } from '@/components/feedback/toastStore';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { formatCurrency } from '@/utils/currency';
import {
  STORE_PRODUCT_BATCH_MAX,
  STORE_PRODUCT_PAGE_SIZE,
  storeProductScope,
  type StoreDto,
  type StoreProductItem,
  type StoreProductScope,
} from '@/types/system';

type ListFilter = 'all' | 'in' | 'out';

const FILTER_OPTIONS: { value: ListFilter; label: string }[] = [
  { value: 'all', label: '全部商品' },
  { value: 'in', label: '已加入清單' },
  { value: 'out', label: '未加入清單' },
];

function inListParam(filter: ListFilter): boolean | undefined {
  if (filter === 'in') return true;
  if (filter === 'out') return false;
  return undefined;
}

interface StoreProductListPanelProps {
  /** 目前登入門市，預設編輯這間。 */
  currentStoreName: string;
  service?: ISystemService;
  pageSize?: number;
}

/**
 * 門市商品清單：選門市、搜尋整個商品目錄（後端分頁）、勾選加入或移出清單、從其他門市複製。
 * 勾選只先記在畫面上（換搜尋、篩選、頁數都保留），按「存檔」才一次送到後端。
 * 所有業務帳號都可以編輯清單與切換販售範圍。沒有依品牌或比例全選。
 */
export function StoreProductListPanel({
  currentStoreName,
  service = systemService,
  pageSize = STORE_PRODUCT_PAGE_SIZE,
}: StoreProductListPanelProps) {
  const showToast = useToastStore((state) => state.showToast);
  const [stores, setStores] = useState<StoreDto[]>([]);
  const [storeName, setStoreName] = useState(currentStoreName);
  const [scope, setScope] = useState<StoreProductScope>('all');
  const [keyword, setKeyword] = useState('');
  const searchKeyword = useDebouncedValue(keyword);
  const [filter, setFilter] = useState<ListFilter>('all');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<StoreProductItem[]>([]);
  const [total, setTotal] = useState(0);
  const [listedTotal, setListedTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 尚未存檔的勾選：productId -> 存檔後是否在清單。跟後端目前狀態相同的會從這裡拿掉。
  const [staged, setStaged] = useState<Map<string, boolean>>(() => new Map());
  // 各商品在後端的狀態（最後一次讀到的），用來判斷勾回原狀時取消變更。
  const serverInList = useRef<Map<string, boolean>>(new Map());
  const [pendingStore, setPendingStore] = useState<string | null>(null);
  const [copySource, setCopySource] = useState('');
  const [copyReplace, setCopyReplace] = useState(false);
  const [confirm, setConfirm] = useState<'copy' | 'scope' | 'switchStore' | null>(null);
  const [busy, setBusy] = useState(false);
  const latest = useRef(0);

  useEffect(() => {
    let cancelled = false;
    service
      .listStoreChoices({ fresh: true })
      .then((rows) => {
        if (cancelled) return;
        setStores(rows);
        setStoreName((current) =>
          rows.some((row) => row.name === current) ? current : (rows[0]?.name ?? '')
        );
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, '無法讀取門市清單'));
      });
    return () => {
      cancelled = true;
    };
  }, [service]);

  useEffect(() => {
    setPage(1);
  }, [storeName, searchKeyword, filter]);

  const load = useCallback(async () => {
    if (!storeName) {
      setLoading(false);
      return;
    }
    const requestId = ++latest.current;
    setLoading(true);
    setError(null);
    try {
      const result = await service.listStoreProducts(storeName, {
        keyword: searchKeyword,
        inList: inListParam(filter),
        page,
        pageSize,
      });
      if (requestId !== latest.current) return;
      result.items.forEach((item) => serverInList.current.set(item.productId, item.inList));
      setItems(result.items);
      setTotal(result.total);
      setListedTotal(result.listedTotal);
      setScope(result.productScope);
    } catch (err) {
      if (requestId === latest.current) setError(errorMessage(err, '無法讀取門市商品清單'));
    } finally {
      if (requestId === latest.current) setLoading(false);
    }
  }, [service, storeName, searchKeyword, filter, page, pageSize]);

  useEffect(() => {
    void load();
  }, [load]);

  const stagedAdd = useMemo(() => [...staged].filter(([, inList]) => inList).map(([id]) => id), [staged]);
  const stagedRemove = useMemo(() => [...staged].filter(([, inList]) => !inList).map(([id]) => id), [staged]);
  const dirty = staged.size > 0;
  const tooMany = staged.size > STORE_PRODUCT_BATCH_MAX;
  useUnsavedChangesGuard(dirty);

  const effectiveInList = (item: StoreProductItem) => staged.get(item.productId) ?? item.inList;

  const toggle = (item: StoreProductItem) => {
    if (busy) return;
    const next = !effectiveInList(item);
    const server = serverInList.current.get(item.productId) ?? item.inList;
    setStaged((current) => {
      const updated = new Map(current);
      if (next === server) updated.delete(item.productId);
      else updated.set(item.productId, next);
      return updated;
    });
  };

  const discardChanges = () => setStaged(new Map());

  const save = async () => {
    if (!dirty || busy || tooMany) return;
    setBusy(true);
    setError(null);
    try {
      const result = await service.saveStoreProducts(storeName, { add: stagedAdd, remove: stagedRemove });
      const added = result.added ?? stagedAdd.length;
      const removed = result.removed ?? stagedRemove.length;
      showToast(`已存檔：加入 ${added} 項、移出 ${removed} 項，清單共 ${result.listedTotal} 項`, 'success');
      setStaged(new Map());
      setListedTotal(result.listedTotal);
      await load();
    } catch (err) {
      // 失敗時保留勾選，讓使用者修正後再存。
      setError(errorMessage(err, '無法儲存門市商品清單'));
    } finally {
      setBusy(false);
    }
  };

  const requestStoreChange = (name: string) => {
    if (name === storeName) return;
    if (dirty) {
      setPendingStore(name);
      setConfirm('switchStore');
      return;
    }
    setStoreName(name);
  };

  const confirmStoreChange = () => {
    if (pendingStore) {
      setStaged(new Map());
      serverInList.current = new Map();
      setStoreName(pendingStore);
    }
    setPendingStore(null);
    setConfirm(null);
  };

  const runCopy = async () => {
    if (!copySource || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await service.copyStoreProducts(storeName, { sourceStoreName: copySource, replace: copyReplace });
      showToast(`已從「${copySource}」複製清單：異動 ${result.changed} 項，目前共 ${result.listedTotal} 項`, 'success');
      setConfirm(null);
      setStaged(new Map());
      await load();
    } catch (err) {
      setError(errorMessage(err, '無法複製清單'));
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  const nextScope: StoreProductScope = scope === 'list' ? 'all' : 'list';
  const runScope = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await service.setStoreProductScope(storeName, nextScope);
      const value = storeProductScope(updated);
      setScope(value);
      setStores((rows) => rows.map((row) => (row.name === storeName ? { ...row, productScope: value } : row)));
      showToast(
        value === 'list' ? `「${storeName}」改為只販售清單商品` : `「${storeName}」改為販售全部商品`,
        'success'
      );
      setConfirm(null);
    } catch (err) {
      setError(errorMessage(err, '無法切換販售範圍'));
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const otherStores = stores.filter((row) => row.name !== storeName);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-5 max-w-4xl" data-testid="store-product-panel">
      <div>
        <h3 className="text-lg font-bold text-zinc-100">門市商品清單</h3>
        <p className="mt-1 text-xs text-zinc-400">
          「只販售清單商品」的門市，結帳搜尋、條碼掃描與庫存頁只會列出清單內的商品，清單外的商品不能結帳（仍可退貨）。
          勾選後按「存檔」才會送出；所有店員都可以編輯清單與切換販售範圍。
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm text-zinc-300">
          門市
          <select
            aria-label="選擇門市"
            value={storeName}
            onChange={(event) => requestStoreChange(event.target.value)}
            className="mt-1 block w-56 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
          >
            {stores.map((store) => (
              <option key={store.name} value={store.name}>
                {store.name}
                {store.name === currentStoreName ? '（目前登入）' : ''}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-2 pb-1">
          <span
            data-testid="store-product-scope"
            className={
              scope === 'list'
                ? 'rounded-full border border-amber-700/60 bg-amber-950/40 px-3 py-0.5 text-xs font-bold text-amber-300'
                : 'rounded-full border border-emerald-800 bg-emerald-950 px-3 py-0.5 text-xs font-bold text-emerald-300'
            }
          >
            {scope === 'list' ? '只販售清單商品' : '販售全部商品'}
          </span>
          <span className="text-xs text-zinc-400">
            清單內 <strong className="font-mono text-zinc-100">{listedTotal}</strong> 項
          </span>
          {storeName && (
            <Button size="sm" variant="secondary" onClick={() => setConfirm('scope')} disabled={busy}>
              {scope === 'list' ? '改為販售全部商品' : '改為只販售清單商品'}
            </Button>
          )}
        </div>
      </div>

      {scope === 'all' && (
        <p className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-400" role="status">
          這間門市目前販售全部商品。清單可以先編輯好，切換為「只販售清單商品」後才生效。
        </p>
      )}

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
        <label className="text-sm text-zinc-300">
          從其他門市複製清單
          <select
            aria-label="複製來源門市"
            value={copySource}
            onChange={(event) => setCopySource(event.target.value)}
            className="mt-1 block w-56 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
          >
            <option value="">選擇來源門市</option>
            {otherStores.map((store) => (
              <option key={store.name} value={store.name}>
                {store.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm text-zinc-300">
          <input type="checkbox" checked={copyReplace} onChange={(event) => setCopyReplace(event.target.checked)} />
          取代（移除來源沒有的商品）
        </label>
        <Button
          size="sm"
          variant="secondary"
          disabled={!copySource || busy || dirty}
          title={dirty ? '請先存檔或放棄未存檔的勾選' : undefined}
          onClick={() => setConfirm('copy')}
        >
          複製
        </Button>
        {dirty && <span className="pb-2 text-xs text-amber-300">有未存檔的勾選，請先存檔或放棄後再複製</span>}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          aria-label="搜尋商品"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="搜尋貨號 / 品名 / 條碼 / 廠牌..."
          className="flex-1 min-w-[240px] rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 font-mono text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-400 focus:outline-none"
        />
        <select
          aria-label="清單篩選"
          value={filter}
          onChange={(event) => setFilter(event.target.value as ListFilter)}
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-cyan-300"
        >
          {FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div
        className={
          dirty
            ? 'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-700/60 bg-amber-950/30 px-4 py-3'
            : 'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3'
        }
        data-testid="store-product-save-bar"
      >
        <span className="text-sm text-zinc-300" role="status">
          {dirty ? (
            <>
              未存檔變更 <strong className="font-mono text-amber-300">{staged.size}</strong> 項（加入 {stagedAdd.length}、移出{' '}
              {stagedRemove.length}），存檔後清單約 {Math.max(0, listedTotal + stagedAdd.length - stagedRemove.length)} 項
            </>
          ) : (
            '沒有未存檔的變更'
          )}
          {tooMany && (
            <span className="ml-2 text-rose-300">一次最多存 {STORE_PRODUCT_BATCH_MAX} 項，請分批存檔</span>
          )}
        </span>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" disabled={!dirty || busy} onClick={discardChanges}>
            放棄變更
          </Button>
          <Button size="sm" variant="primary" disabled={!dirty || busy || tooMany} loading={busy && dirty} onClick={() => void save()}>
            存檔
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-rose-900/60 bg-rose-950/30 px-3 py-2 text-sm text-rose-200" role="alert">
          {error}
        </p>
      )}

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        {loading && items.length === 0 ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">沒有符合的商品</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-xs text-zinc-400">
              <tr>
                <th className="w-16 px-3 py-2 text-left">清單</th>
                <th className="px-3 py-2 text-left">貨號</th>
                <th className="px-3 py-2 text-left">品名</th>
                <th className="px-3 py-2 text-left">廠牌</th>
                <th className="px-3 py-2 text-right">售價</th>
                <th className="px-3 py-2 text-left">加入</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {items.map((item) => {
                const inList = effectiveInList(item);
                const changed = staged.has(item.productId);
                return (
                  <tr
                    key={item.productId}
                    className={changed ? 'bg-amber-950/30' : inList ? 'bg-cyan-950/20' : undefined}
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        aria-label={`${item.sku} ${inList ? '移出清單' : '加入清單'}`}
                        checked={inList}
                        disabled={busy}
                        onChange={() => toggle(item)}
                        className="h-4 w-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-2 font-mono text-zinc-200">{item.sku}</td>
                    <td className="px-3 py-2 text-zinc-100">{item.name}</td>
                    <td className="px-3 py-2 text-zinc-400">{item.brand}</td>
                    <td className="px-3 py-2 text-right font-mono text-zinc-300">{formatCurrency(item.listPrice)}</td>
                    <td className="px-3 py-2 text-xs text-zinc-500">
                      {changed ? (
                        <span className="font-bold text-amber-300">{inList ? '待加入（未存檔）' : '待移出（未存檔）'}</span>
                      ) : item.inList ? (
                        (item.addedBy ?? '')
                      ) : (
                        ''
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>
          共 {total} 項 · 第 {page} / {pageCount} 頁
        </span>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
            上一頁
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={page >= pageCount || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            下一頁
          </Button>
        </div>
      </div>

      <Modal
        open={confirm === 'copy'}
        onClose={() => setConfirm(null)}
        title="複製門市商品清單"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirm(null)} disabled={busy}>
              取消
            </Button>
            <Button variant="primary" onClick={() => void runCopy()} loading={busy}>
              確定複製
            </Button>
          </div>
        }
      >
        <p className="text-sm text-zinc-300">
          把「{copySource}」的清單複製到「{storeName}」。
          {copyReplace ? '「' + storeName + '」清單裡來源沒有的商品會被移除。' : '既有的清單商品會保留。'}
        </p>
      </Modal>

      <Modal
        open={confirm === 'scope'}
        onClose={() => setConfirm(null)}
        title="切換販售範圍"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirm(null)} disabled={busy}>
              取消
            </Button>
            <Button variant="primary" onClick={() => void runScope()} loading={busy}>
              確定切換
            </Button>
          </div>
        }
      >
        <p className="text-sm text-zinc-300">
          {nextScope === 'list'
            ? `切換後「${storeName}」只能銷售清單內的 ${listedTotal} 項商品，結帳搜尋與庫存頁也只列出這些商品。`
            : `切換後「${storeName}」販售全部商品。清單會保留，之後再切回可以沿用。`}
        </p>
      </Modal>
      <Modal
        open={confirm === 'switchStore'}
        onClose={() => {
          setPendingStore(null);
          setConfirm(null);
        }}
        title="有未存檔的變更"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setPendingStore(null);
                setConfirm(null);
              }}
            >
              留在這裡
            </Button>
            <Button variant="danger" onClick={confirmStoreChange}>
              放棄變更並切換
            </Button>
          </div>
        }
      >
        <p className="text-sm text-zinc-300">
          「{storeName}」有 {staged.size} 項勾選尚未存檔。切換到「{pendingStore}」會放棄這些變更。
        </p>
      </Modal>
    </div>
  );
}
