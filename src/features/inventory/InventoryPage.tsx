import { useEffect, useMemo, useState } from 'react';
import { useProductList } from './hooks/useProductList';
import { ProductTable } from './components/ProductTable';
import { LoadMoreFooter } from '@/components/common/LoadMoreFooter';
import { StockTransferModal } from './components/StockTransferModal';
import { CreateProductModal } from './components/CreateProductModal';
import { StockAdjustmentConfirmModal } from './components/StockAdjustmentConfirmModal';
import { StockAdjustmentReceiptModal } from './components/StockAdjustmentReceiptModal';
import { RestockModal } from './components/RestockModal';
import { ProductDetailModal } from '@/features/checkout/components/ProductDetailModal';
import { ProductEditModal } from './components/ProductEditModal';
import type { Product, ProductSearchParams, StockLocation } from '@/types/product';
import type { InventoryItemAdjustment, InventoryLocationChange } from '@/types/inventory';
import { useLocations } from './hooks/useLocations';
import { Button } from '@/components/common/Button';
import { useUiStore } from '@/store/uiStore';
import { useSessionStore } from '@/store/sessionStore';
import { useStoreChoices } from '@/hooks/useStoreChoices';
import { StoreFilterTabs } from '@/components/common/StoreFilterTabs';
import {
  defaultStoreFilter,
  findStore,
  focusStoreName,
  sameStoreFilter,
  selectedStoreScope,
  storeFilterButtons,
  storeFilterScope,
  type InventoryStoreFilter,
} from './storeFilter';

export type StockFilterType =
  | 'ALL'
  | 'STORE_LOW'
  | 'WAREHOUSE_LOW'
  | 'STORE_OUT'
  | 'TOTAL_OUT'
  | 'HAS_STOCK';

const STOCK_FILTER_OPTIONS: { value: StockFilterType; label: string }[] = [
  { value: 'ALL', label: '全部庫存狀況' },
  { value: 'STORE_LOW', label: '⚠️ 門市現貨低庫存 (≤ 2 台)' },
  { value: 'WAREHOUSE_LOW', label: '⚠️ 後方倉庫低庫存 (≤ 2 台)' },
  { value: 'STORE_OUT', label: '🚫 門市現貨缺貨 (= 0 台)' },
  { value: 'TOTAL_OUT', label: '🚫 全部據點皆無現貨 (= 0 台)' },
  { value: 'HAS_STOCK', label: '任一據點有現貨 (> 0 台)' },
];

/** 庫存狀況篩選對應的後端參數（上下限含等號，沒有庫存列算 0）。 */
export function stockFilterParams(filter: StockFilterType, warehouseLocationId: string): ProductSearchParams {
  switch (filter) {
    case 'STORE_LOW':
      return { loginStoreQuantityMax: 2 };
    case 'WAREHOUSE_LOW':
      return { locationId: warehouseLocationId, locationQuantityMax: 2 };
    case 'STORE_OUT':
      return { loginStoreQuantityMin: 0, loginStoreQuantityMax: 0 };
    case 'TOTAL_OUT':
      return { totalInventoryMin: 0, totalInventoryMax: 0 };
    case 'HAS_STOCK':
      return { inInventoryOnly: true };
    default:
      return {};
  }
}

export function InventoryPage() {
  const [stockFilter, setStockFilter] = useState<StockFilterType>('ALL');
  const { locations, isLoading: locationsLoading } = useLocations();
  const warehouseLocationId = locations.find((location) => location.name === '後方倉庫')?.id ?? '';

  // 暫存各地點數量: productId -> location -> newQuantity
  const [draftStocks, setDraftStocks] = useState<Record<string, Record<StockLocation, number>>>({});
  // 有草稿的商品快照：換了搜尋或篩選條件、商品不在目前結果裡時，草稿仍看得到、存得到。
  const [draftProducts, setDraftProducts] = useState<Record<string, Product>>({});
  const draftedProducts = useMemo(
    () =>
      Object.keys(draftStocks)
        .map((id) => draftProducts[id])
        .filter((product): product is Product => Boolean(product)),
    [draftStocks, draftProducts]
  );

  // 庫存狀況篩選交給後端（以已儲存的數量判斷）並分頁；有草稿的商品不論條件都留在畫面上，儲存後重新查詢。
  const stockFilters = useMemo(
    () => stockFilterParams(stockFilter, warehouseLocationId),
    [stockFilter, warehouseLocationId]
  );
  // 「後方倉庫低庫存」要等庫存點讀完；沒有後方倉庫時沒有商品符合（跟以前一樣）。
  const filterReady = stockFilter !== 'WAREHOUSE_LOW' || (!locationsLoading && Boolean(warehouseLocationId));
  // 表頭門市按鈕：登入門市、全部商品、其他門市。所選門市決定商品清單、地點欄位順序、
  // 可售／退貨欄位、未販售標示與門市低庫存篩選；全部商品時這些都看登入門市。所有店員都可以切換。
  const loginStoreName = useSessionStore((state) => state.storeName).trim();
  const { stores } = useStoreChoices();
  const [storeFilter, setStoreFilter] = useState<InventoryStoreFilter>(() => defaultStoreFilter(loginStoreName));
  useEffect(() => {
    setStoreFilter(defaultStoreFilter(loginStoreName));
  }, [loginStoreName]);
  const storeButtons = useMemo(() => storeFilterButtons(stores, loginStoreName), [stores, loginStoreName]);
  const productScope = useMemo(() => storeFilterScope(storeFilter, loginStoreName), [storeFilter, loginStoreName]);
  const focusStore = focusStoreName(storeFilter, loginStoreName);
  const selectedScope = selectedStoreScope(storeFilter, stores);
  const otherStoreSelected = storeFilter.kind === 'store' && storeFilter.storeName !== loginStoreName;
  const storeLabel = otherStoreSelected && focusStore ? `「${focusStore}」` : '本門市';
  // 進貨預設進到所選門市（全部商品時是登入門市）的可售地點。
  const restockStore = findStore(stores, focusStore);
  const {
    keyword,
    setKeyword,
    products,
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    loadMore,
    reload,
    pinProduct,
  } = useProductList({ stockFilters, enabled: filterReady, keepVisible: draftedProducts, scope: productScope });

  const [transferTarget, setTransferTarget] = useState<Product | null>(null);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createPrefill, setCreatePrefill] = useState('');
  const pendingCreate = useUiStore((s) => s.isProductCreateModalOpen);
  const pendingKeyword = useUiStore((s) => s.productCreateKeyword);
  const closeProductCreateModal = useUiStore((s) => s.closeProductCreateModal);

  useEffect(() => {
    if (!pendingCreate) return;
    setCreatePrefill(pendingKeyword);
    setIsCreateModalOpen(true);
    closeProductCreateModal();
  }, [pendingCreate, pendingKeyword, closeProductCreateModal]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);

  // 理貨單彈窗狀態
  const [receiptAdjustments, setReceiptAdjustments] = useState<InventoryItemAdjustment[]>([]);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // 處理表格欄位數字輸入變更
  const handleStockChange = (productId: string, location: StockLocation, newQty: number) => {
    const product = products.find((row) => row.id === productId);
    if (product) setDraftProducts((prev) => ({ ...prev, [productId]: product }));
    setDraftStocks((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [location]: newQty,
      },
    }));
  };

  // 重置未儲存的修改
  const handleResetDrafts = () => {
    setDraftStocks({});
    setDraftProducts({});
  };

  // 計算並整理已修改的商品與動態分析明細 (支援 DB 動態據點)
  const pendingAdjustments = useMemo<InventoryItemAdjustment[]>(() => {
    const list: InventoryItemAdjustment[] = [];

    // 以目前清單裡的最新資料為準；不在目前結果裡的用編輯當下的快照。
    const current = new Map(products.map((product) => [product.id, product]));
    for (const [productId, pDraft] of Object.entries(draftStocks)) {
      const p = current.get(productId) ?? draftProducts[productId];
      if (!p) continue;

      const changes: InventoryLocationChange[] = [];
      let totalDiff = 0;

      const allLocations = Array.from(
        new Set([
          ...p.inventories.map((s) => s.location),
          ...Object.keys(pDraft),
        ])
      );

      for (const loc of allLocations) {
        if (pDraft[loc] !== undefined) {
          const origStock = p.inventories.find((s) => s.location === loc);
          const origQty = origStock?.quantity ?? 0;
          const locName = origStock?.locationName || loc;
          const newQty = pDraft[loc];
          const diff = newQty - origQty;
          if (diff !== 0) {
            changes.push({
              location: loc,
              locationName: locName,
              oldQty: origQty,
              newQty,
              diff,
            });
            totalDiff += diff;
          }
        }
      }

      if (changes.length > 0) {
        let summaryText = '';
        if (changes.length === 2 && changes[0].diff + changes[1].diff === 0) {
          const fromLoc = changes.find((c) => c.diff < 0);
          const toLoc = changes.find((c) => c.diff > 0);
          if (fromLoc && toLoc) {
            summaryText = `${fromLoc.locationName} ➔ ${toLoc.locationName} 調撥 ${toLoc.diff} 台`;
          } else {
            summaryText = `跨據點調撥 ${Math.abs(changes[0].diff)} 台`;
          }
        } else if (totalDiff > 0) {
          summaryText = `庫存增加 (進貨) +${totalDiff} 台`;
        } else if (totalDiff < 0) {
          summaryText = `庫存減少 (盤虧/調整) ${totalDiff} 台`;
        } else {
          summaryText = `跨據點調撥 ${Math.abs(changes[0].diff)} 台`;
        }

        list.push({
          productId: p.id,
          sku: p.sku,
          barcode: p.barcode,
          name: p.name,
          brand: p.brand,
          changes,
          summaryText,
        });
      }
    }

    return list;
  }, [products, draftStocks, draftProducts]);

  const modifiedCount = pendingAdjustments.length;

  const handleBatchSaveSuccess = (adjustments: InventoryItemAdjustment[]) => {
    setReceiptAdjustments(adjustments);
    setIsReceiptModalOpen(true);
    setDraftStocks({});
    setDraftProducts({});
    // 儲存後重新查詢：數量改了的商品可能不再符合目前的庫存狀況篩選。
    reload();
  };

  const handleRestockSuccess = () => {
    reload();
  };

  const handleEditProductFromDetail = (product: Product) => {
    setSelectedDetailProduct(null);
    setEditingProduct(product);
  };

  const handleCreateProductSuccess = (createdProduct: Product, initialDrafts?: Record<StockLocation, number>) => {
    if (initialDrafts) {
      setDraftStocks((prev) => ({
        ...prev,
        [createdProduct.id]: initialDrafts,
      }));
      setDraftProducts((prev) => ({ ...prev, [createdProduct.id]: createdProduct }));
    }
    // 分頁時新商品不一定在已載入的頁面裡，先固定顯示在最前面。
    pinProduct(createdProduct);
    reload();
  };

  return (
    <div className="space-y-4 text-base">
      {/* 頂部搜尋列、庫存條件過濾選單與功能操作列 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full max-w-2xl">
          {/* 1. 關鍵字搜尋框 (含清空按鈕 ✕) */}
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜尋貨號 / 車型品名 / 條碼 / 廠牌..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 pl-4 pr-10 py-2.5 font-mono text-base text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            />
            {keyword && (
              <button
                onClick={() => setKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                title="清空搜尋內容"
              >
                ✕
              </button>
            )}
          </div>

          {/* 2. 庫存狀況進階條件過濾器 */}
          <div className="w-64">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as StockFilterType)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-base font-semibold text-cyan-300 focus:border-cyan-400 focus:outline-none"
            >
              {STOCK_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 右側功能按鈕：快速條碼進貨、建立新商品 & 儲存庫存變更 */}
        <div className="flex items-center gap-3">
          {modifiedCount > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 animate-fade-in">
              <span className="text-sm font-medium text-amber-300">
                已修改 <strong className="font-mono text-amber-400 text-base">{modifiedCount}</strong> 項庫存
              </span>
              <button
                onClick={handleResetDrafts}
                className="text-xs text-zinc-400 hover:text-zinc-200 underline ml-1"
              >
                重設
              </button>
              <Button
                variant="primary"
                onClick={() => setIsConfirmModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-3 py-1 text-sm shadow-md"
              >
                儲存庫存變更
              </Button>
            </div>
          )}

          <Button
            variant="secondary"
            onClick={() => setIsRestockModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-base font-semibold border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40"
          >
            快速條碼進貨
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              setCreatePrefill('');
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 text-base font-semibold border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40"
          >
            建立新商品
          </Button>
        </div>
      </div>

      {/* 門市篩選 (Store Tabs)：登入門市、全部商品、其他門市 */}
      <StoreFilterTabs
        testId="inventory-store-tabs"
        tabs={storeButtons}
        activeKey={storeButtons.find((button) => sameStoreFilter(button.filter, storeFilter))?.key ?? ''}
        onSelect={(key) => {
          const button = storeButtons.find((row) => row.key === key);
          if (button) setStoreFilter(button.filter);
        }}
      />

      <div
        className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-700/50 bg-amber-950/30 px-3 py-2 text-sm text-amber-100"
        role="status"
        data-testid="store-product-scope-hint"
      >
        <span className="font-bold">
          {storeFilter.kind === 'all'
            ? '顯示全部商品（含門市未販售）'
            : selectedScope === 'all'
              ? '此門市販售全部商品'
              : selectedScope === 'list'
                ? `僅顯示「${storeFilter.storeName}」的可售商品`
                : `門市「${storeFilter.storeName}」的商品`}
        </span>
        <span className="text-xs text-amber-200/80">各據點欄位與總庫存仍是全部據點的數量。</span>
      </div>

      {/* 庫存列表表格 (支援各地點數量直編、顯示條碼與特大數字) */}
      <ProductTable
        products={products}
        isLoading={isLoading}
        draftStocks={draftStocks}
        onStockChange={handleStockChange}
        onTransfer={setTransferTarget}
        onSelectProduct={setSelectedDetailProduct}
        focusStoreName={focusStore}
        storeLabel={storeLabel}
      />
      {!isLoading && (
        <LoadMoreFooter
          shown={products.length}
          total={Math.max(total, products.length)}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={() => void loadMore()}
        />
      )}

      {/* 跨據點單項調撥彈窗 (套用至編輯列表) */}
      <StockTransferModal
        product={transferTarget}
        onClose={() => setTransferTarget(null)}
        onTransferred={() => {
          setTransferTarget(null);
          reload();
        }}
      />

      {/* 新增商品建檔彈窗 */}
      <CreateProductModal
        open={isCreateModalOpen}
        initialKeyword={createPrefill}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateProductSuccess}
      />

      {/* 批量庫存變更確認與操作紀錄彈窗 */}
      <StockAdjustmentConfirmModal
        open={isConfirmModalOpen}
        adjustments={pendingAdjustments}
        onClose={() => setIsConfirmModalOpen(false)}
        onSuccess={handleBatchSaveSuccess}
      />

      {/* 快速條碼進貨彈窗 */}
      <RestockModal
        open={isRestockModalOpen}
        scope={productScope}
        targetStoreName={storeFilter.kind === 'store' ? storeFilter.storeName : loginStoreName || null}
        defaultLocationId={restockStore?.inventoryLocationId ?? null}
        loginStoreName={loginStoreName}
        onClose={() => setIsRestockModalOpen(false)}
        onSuccess={handleRestockSuccess}
      />

      {/* 庫存異動與理貨明細單彈窗 */}
      <StockAdjustmentReceiptModal
        open={isReceiptModalOpen}
        adjustments={receiptAdjustments}
        onClose={() => setIsReceiptModalOpen(false)}
      />

      {/* 商品詳情彈窗 (含編輯模式按鈕) */}
      <ProductDetailModal
        open={!!selectedDetailProduct}
        product={selectedDetailProduct}
        onClose={() => setSelectedDetailProduct(null)}
        showAddToCart={false}
        onEdit={handleEditProductFromDetail}
      />

      {/* 商品編輯彈窗 */}
      <ProductEditModal
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSuccess={reload}
      />
    </div>
  );
}
