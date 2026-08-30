import { useState, useMemo } from 'react';
import { useProductList } from './hooks/useProductList';
import { ProductTable } from './components/ProductTable';
import { StockTransferModal } from './components/StockTransferModal';
import { CreateProductModal } from './components/CreateProductModal';
import { StockAdjustmentConfirmModal } from './components/StockAdjustmentConfirmModal';
import { StockAdjustmentReceiptModal } from './components/StockAdjustmentReceiptModal';
import { RestockModal } from './components/RestockModal';
import { ProductDetailModal } from '@/features/checkout/components/ProductDetailModal';
import { ProductEditModal } from './components/ProductEditModal';
import type { Product, StockLocation } from '@/types/product';
import type { StockItemAdjustment, StockLocationChange } from '@/types/inventory';
import { Button } from '@/components/common/Button';

const BRAND_TABS: string[] = [
  'ALL',
  'AutoArt',
  'Spark',
  'Inno64',
  'Mini GT',
  'TLV',
  'Kyosho',
  'Tarmac Works',
];

export type StockFilterType =
  | 'ALL'
  | 'PREORDER_EXCEEDS_STORE'
  | 'PREORDER_EXCEEDS_TOTAL'
  | 'STORE_LOW'
  | 'WAREHOUSE_LOW'
  | 'STORE_OUT'
  | 'TOTAL_OUT'
  | 'HAS_STOCK';

const STOCK_FILTER_OPTIONS: { value: StockFilterType; label: string }[] = [
  { value: 'ALL', label: '📊 全部庫存狀況' },
  { value: 'PREORDER_EXCEEDS_STORE', label: '⚠️ 預購未交 > 門市現貨 (待補貨)' },
  { value: 'PREORDER_EXCEEDS_TOTAL', label: '🚨 預購未交 > 預估總計 (欠貨警告)' },
  { value: 'STORE_LOW', label: '⚠️ 門市現貨低庫存 (≤ 2 台)' },
  { value: 'WAREHOUSE_LOW', label: '⚠️ 後方倉庫低庫存 (≤ 2 台)' },
  { value: 'STORE_OUT', label: '🚫 門市現貨缺貨 (= 0 台)' },
  { value: 'TOTAL_OUT', label: '🚫 全部據點皆無現貨 (= 0 台)' },
  { value: 'HAS_STOCK', label: '📦 任一據點有現貨 (> 0 台)' },
];

const LOCATION_NAMES: Record<StockLocation, string> = {
  store: '門市現貨',
  warehouse: '後方倉庫',
  company: '公司總倉',
  other: '調度暫存',
};

export function InventoryPage() {
  const { keyword, setKeyword, brand, setBrand, products, isLoading, reload } = useProductList();

  const [stockFilter, setStockFilter] = useState<StockFilterType>('ALL');

  const [transferTarget, setTransferTarget] = useState<Product | null>(null);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);

  // 理貨單彈窗狀態
  const [receiptAdjustments, setReceiptAdjustments] = useState<StockItemAdjustment[]>([]);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // 暫存各地點數量: productId -> location -> newQuantity
  const [draftStocks, setDraftStocks] = useState<Record<string, Record<StockLocation, number>>>({});

  // 處理表格欄位數字輸入變更
  const handleStockChange = (productId: string, location: StockLocation, newQty: number) => {
    setDraftStocks((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [location]: newQty,
      },
    }));
  };

  // 處理單項調撥：套用至編輯清單草稿中，而不直接寫資料庫
  const handleApplyTransfer = (
    productId: string,
    fromLocation: StockLocation,
    toLocation: StockLocation,
    quantity: number
  ) => {
    const p = products.find((item) => item.id === productId);
    if (!p) return;

    const pDraft = draftStocks[productId] || {};
    const getQty = (loc: StockLocation) =>
      pDraft[loc] !== undefined
        ? pDraft[loc]
        : p.stocks.find((s) => s.location === loc)?.quantity ?? 0;

    const currentFromQty = getQty(fromLocation);
    const currentToQty = getQty(toLocation);

    setDraftStocks((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [fromLocation]: Math.max(0, currentFromQty - quantity),
        [toLocation]: currentToQty + quantity,
      },
    }));
  };

  // 重置未儲存的修改
  const handleResetDrafts = () => {
    setDraftStocks({});
  };

  // 根據庫存與預購狀況過濾商品
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const getQty = (loc: StockLocation) =>
        draftStocks[p.id]?.[loc] !== undefined
          ? draftStocks[p.id][loc]
          : p.stocks.find((s) => s.location === loc)?.quantity ?? 0;

      const storeQty = getQty('store');
      const warehouseQty = getQty('warehouse');
      const companyQty = getQty('company');
      const otherQty = getQty('other');
      const totalQty = storeQty + warehouseQty + companyQty + otherQty;

      if (stockFilter === 'PREORDER_EXCEEDS_STORE') {
        return p.preOrderPendingCount > storeQty;
      }
      if (stockFilter === 'PREORDER_EXCEEDS_TOTAL') {
        return p.preOrderPendingCount > totalQty;
      }
      if (stockFilter === 'STORE_LOW') {
        return storeQty <= 2;
      }
      if (stockFilter === 'WAREHOUSE_LOW') {
        return warehouseQty <= 2;
      }
      if (stockFilter === 'STORE_OUT') {
        return storeQty === 0;
      }
      if (stockFilter === 'TOTAL_OUT') {
        return totalQty === 0;
      }
      if (stockFilter === 'HAS_STOCK') {
        return totalQty > 0;
      }
      return true;
    });
  }, [products, stockFilter, draftStocks]);

  // 計算並整理已修改的商品與動態分析明細
  const pendingAdjustments = useMemo<StockItemAdjustment[]>(() => {
    const list: StockItemAdjustment[] = [];

    for (const p of products) {
      const pDraft = draftStocks[p.id];
      if (!pDraft) continue;

      const changes: StockLocationChange[] = [];
      let totalDiff = 0;

      for (const loc of ['store', 'warehouse', 'company', 'other'] as StockLocation[]) {
        if (pDraft[loc] !== undefined) {
          const origQty = p.stocks.find((s) => s.location === loc)?.quantity ?? 0;
          const newQty = pDraft[loc];
          const diff = newQty - origQty;
          if (diff !== 0) {
            changes.push({
              location: loc,
              locationName: LOCATION_NAMES[loc] || loc,
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
        const storeChange = changes.find((c) => c.location === 'store');
        const warehouseChange = changes.find((c) => c.location === 'warehouse');

        if (
          changes.length === 2 &&
          storeChange &&
          warehouseChange &&
          storeChange.diff + warehouseChange.diff === 0
        ) {
          if (storeChange.diff > 0) {
            summaryText = `倉庫 ➔ 門市調撥 ${storeChange.diff} 台`;
          } else {
            summaryText = `門市 ➔ 倉庫調撥 ${warehouseChange.diff} 台`;
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
          name: p.name,
          brand: p.brand,
          changes,
          summaryText,
        });
      }
    }

    return list;
  }, [products, draftStocks]);

  const modifiedCount = pendingAdjustments.length;

  const handleBatchSaveSuccess = (adjustments: StockItemAdjustment[]) => {
    setReceiptAdjustments(adjustments);
    setIsReceiptModalOpen(true);
    setDraftStocks({});
    reload();
  };

  const handleRestockSuccess = (adjustments: StockItemAdjustment[]) => {
    setReceiptAdjustments(adjustments);
    setIsReceiptModalOpen(true);
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
    }
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
              placeholder="🔍 搜尋貨號 / 車型品名 / 條碼 / 廠牌..."
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

          {/* 2. 庫存與預購狀況進階條件過濾器 */}
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
                💾 儲存庫存變更
              </Button>
            </div>
          )}

          <Button
            variant="secondary"
            onClick={() => setIsRestockModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-base font-semibold border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40"
          >
            📥 快速條碼進貨
          </Button>

          <Button
            variant="secondary"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-base font-semibold border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40"
          >
            ➕ 建立新商品
          </Button>
        </div>
      </div>

      {/* 品牌廠牌分類標籤 (Brand Tabs) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap mr-1">
          廠牌篩選：
        </span>
        {BRAND_TABS.map((b) => (
          <button
            key={b}
            onClick={() => setBrand(b)}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all whitespace-nowrap ${
              brand === b
                ? 'bg-cyan-500 text-zinc-950 shadow-sm font-bold scale-[1.02]'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            {b === 'ALL' ? '全部品牌' : b}
          </button>
        ))}
      </div>

      {/* 庫存列表表格 (支援各地點數量直編、顯示條碼與特大數字) */}
      <ProductTable
        products={filteredProducts}
        isLoading={isLoading}
        draftStocks={draftStocks}
        onStockChange={handleStockChange}
        onTransfer={setTransferTarget}
        onSelectProduct={setSelectedDetailProduct}
      />

      {/* 跨據點單項調撥彈窗 (套用至編輯列表) */}
      <StockTransferModal
        product={transferTarget}
        currentDrafts={transferTarget ? draftStocks[transferTarget.id] : undefined}
        onClose={() => setTransferTarget(null)}
        onApplyTransfer={handleApplyTransfer}
      />

      {/* 新增商品建檔彈窗 */}
      <CreateProductModal
        open={isCreateModalOpen}
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
