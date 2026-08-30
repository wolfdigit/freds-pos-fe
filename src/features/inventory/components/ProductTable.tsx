import type { Product, StockLocation } from '@/types/product';
import { Badge } from '@/components/common/Badge';
import { formatCurrency } from '@/utils/currency';
import { Spinner } from '@/components/feedback/Spinner';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  draftStocks: Record<string, Record<StockLocation, number>>;
  onStockChange: (productId: string, location: StockLocation, newQty: number) => void;
  onTransfer: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

function getOrigStock(product: Product, location: StockLocation): number {
  return product.stocks.find((s) => s.location === location)?.quantity ?? 0;
}

export function ProductTable({
  products,
  isLoading,
  draftStocks,
  onStockChange,
  onTransfer,
  onSelectProduct,
}: ProductTableProps) {
  if (isLoading) {
    return (
      <div className="flex h-52 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex h-52 flex-col items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-400">
        <p className="text-base font-medium">🔍 找不到符合條件的商品</p>
        <p className="text-sm text-zinc-500 mt-1">請嘗試變更關鍵字或切換廠牌分類</p>
      </div>
    );
  }

  return (
    <div className="max-h-[calc(100vh-230px)] overflow-y-auto overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 shadow-md [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-h]:2.5 [&::-webkit-scrollbar-track]:bg-zinc-900 [&::-webkit-scrollbar-track]:rounded-lg [&::-webkit-scrollbar-thumb]:bg-cyan-500/80 [&::-webkit-scrollbar-thumb]:rounded-lg hover:[&::-webkit-scrollbar-thumb]:bg-cyan-400">
      <table className="w-full text-left text-base border-collapse">
        <thead className="sticky top-0 z-10 bg-zinc-900 text-sm font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 shadow-md">
          <tr>
            <th className="px-4 py-3.5 min-w-[160px] bg-zinc-900">商品貨號 (SKU) / 條碼</th>
            <th className="px-4 py-3.5 min-w-[280px] bg-zinc-900">車型與塗裝品名 (廠牌/比例)</th>
            <th className="px-4 py-3.5 text-right bg-zinc-900">門市定價</th>
            <th className="px-4 py-3.5 text-center min-w-[120px] bg-zinc-900">門市現貨</th>
            <th className="px-4 py-3.5 text-center min-w-[120px] bg-zinc-900">後方倉庫</th>
            <th className="px-4 py-3.5 text-center min-w-[120px] bg-zinc-900">公司總倉</th>
            <th className="px-4 py-3.5 text-center min-w-[120px] bg-zinc-900">調度暫存</th>
            <th className="px-4 py-3.5 text-right font-bold bg-zinc-900">預估總計</th>
            <th className="px-4 py-3.5 text-right font-bold bg-zinc-900">預購未交</th>
            <th className="px-4 py-3.5 text-right min-w-[90px] bg-zinc-900">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/80">
          {products.map((p) => {
            const pDraft = draftStocks[p.id] || {};
            const storeQty = pDraft.store ?? getOrigStock(p, 'store');
            const warehouseQty = pDraft.warehouse ?? getOrigStock(p, 'warehouse');
            const companyQty = pDraft.company ?? getOrigStock(p, 'company');
            const otherQty = pDraft.other ?? getOrigStock(p, 'other');

            const storeOrig = getOrigStock(p, 'store');
            const warehouseOrig = getOrigStock(p, 'warehouse');
            const companyOrig = getOrigStock(p, 'company');
            const otherOrig = getOrigStock(p, 'other');

            const totalCalculated = storeQty + warehouseQty + companyQty + otherQty;

            const isStoreModified = storeQty !== storeOrig;
            const isWarehouseModified = warehouseQty !== warehouseOrig;
            const isCompanyModified = companyQty !== companyOrig;
            const isOtherModified = otherQty !== otherOrig;

            return (
              <tr
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className="hover:bg-zinc-900/70 transition-colors cursor-pointer group"
                title="點擊查看商品詳細資訊與編輯"
              >
                {/* 第一重點欄位：商品貨號 (SKU) 與 國際條碼 */}
                <td className="px-4 py-3.5">
                  <p className="font-mono text-lg font-bold text-cyan-400 tracking-wide group-hover:text-cyan-300 transition-colors">
                    {p.sku}
                  </p>
                  <p className="font-mono text-sm font-medium text-zinc-300 flex items-center gap-1 mt-0.5">
                    <span>🏷️</span>
                    <span>{p.barcode || '無條碼'}</span>
                  </p>
                </td>

                {/* 第二重點欄位：車型與塗裝品名、廠牌與比例 */}
                <td className="px-4 py-3.5 max-w-md">
                  <p className="truncate text-lg font-bold text-zinc-100 group-hover:text-cyan-300 transition-colors">
                    {p.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-sm font-bold text-zinc-200 shadow-sm">
                      {p.brand}
                    </span>
                    <Badge color="zinc">{p.scale}</Badge>
                    {p.material && <span className="text-xs text-zinc-500">{p.material}</span>}
                  </div>
                </td>

                {/* 門市定價 (放大 text-xl 20px) */}
                <td className="px-4 py-3.5 text-right font-mono text-xl font-bold text-zinc-100">
                  {formatCurrency(p.listPrice)}
                </td>

                {/* 1. 門市現貨 (直編 & 放大 text-xl 20px，紅減綠增高亮，固定位置) */}
                <td className="px-4 py-2.5 text-center align-top">
                  <div className="flex flex-col items-center justify-start h-16 pt-1">
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="number"
                        min={0}
                        value={storeQty}
                        onChange={(e) => onStockChange(p.id, 'store', Math.max(0, Number(e.target.value) || 0))}
                        className={`w-20 rounded-xl border px-2 py-1.5 text-center font-mono text-xl font-bold transition-all ${
                          storeQty > storeOrig
                            ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-2 ring-emerald-500'
                            : storeQty < storeOrig
                            ? 'border-rose-500 bg-rose-950/40 text-rose-300 ring-2 ring-rose-500'
                            : storeQty > 0
                            ? 'border-zinc-700 bg-zinc-900 text-emerald-400 focus:border-cyan-400'
                            : 'border-zinc-800 bg-zinc-900 text-rose-400 focus:border-cyan-400'
                        }`}
                      />
                    </div>
                    <div className="h-5 flex items-center justify-center mt-1">
                      {isStoreModified && (
                        <span
                          className={`text-xs font-mono font-bold ${
                            storeQty - storeOrig > 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {storeQty - storeOrig > 0 ? `+${storeQty - storeOrig}` : storeQty - storeOrig}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* 2. 後方倉庫 (直編 & 放大 text-xl 20px，紅減綠增高亮，固定位置) */}
                <td className="px-4 py-2.5 text-center align-top">
                  <div
                    className="flex flex-col items-center justify-start h-16 pt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="number"
                      min={0}
                      value={warehouseQty}
                      onChange={(e) => onStockChange(p.id, 'warehouse', Math.max(0, Number(e.target.value) || 0))}
                      className={`w-20 rounded-xl border px-2 py-1.5 text-center font-mono text-xl font-bold transition-all ${
                        warehouseQty > warehouseOrig
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-2 ring-emerald-500'
                          : warehouseQty < warehouseOrig
                          ? 'border-rose-500 bg-rose-950/40 text-rose-300 ring-2 ring-rose-500'
                          : 'border-zinc-700 bg-zinc-900 text-zinc-200 focus:border-cyan-400'
                      }`}
                    />
                    <div className="h-5 flex items-center justify-center mt-1">
                      {isWarehouseModified && (
                        <span
                          className={`text-xs font-mono font-bold ${
                            warehouseQty - warehouseOrig > 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {warehouseQty - warehouseOrig > 0
                            ? `+${warehouseQty - warehouseOrig}`
                            : warehouseQty - warehouseOrig}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* 3. 公司總倉 (直編 & 放大 text-xl 20px，紅減綠增高亮，固定位置) */}
                <td className="px-4 py-2.5 text-center align-top">
                  <div
                    className="flex flex-col items-center justify-start h-16 pt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="number"
                      min={0}
                      value={companyQty}
                      onChange={(e) => onStockChange(p.id, 'company', Math.max(0, Number(e.target.value) || 0))}
                      className={`w-20 rounded-xl border px-2 py-1.5 text-center font-mono text-xl font-bold transition-all ${
                        companyQty > companyOrig
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-2 ring-emerald-500'
                          : companyQty < companyOrig
                          ? 'border-rose-500 bg-rose-950/40 text-rose-300 ring-2 ring-rose-500'
                          : 'border-zinc-700 bg-zinc-900 text-zinc-300 focus:border-cyan-400'
                      }`}
                    />
                    <div className="h-5 flex items-center justify-center mt-1">
                      {isCompanyModified && (
                        <span
                          className={`text-xs font-mono font-bold ${
                            companyQty - companyOrig > 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {companyQty - companyOrig > 0
                            ? `+${companyQty - companyOrig}`
                            : companyQty - companyOrig}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* 4. 調度暫存 (直編 & 放大 text-xl 20px，紅減綠增高亮，固定位置) */}
                <td className="px-4 py-2.5 text-center align-top">
                  <div
                    className="flex flex-col items-center justify-start h-16 pt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="number"
                      min={0}
                      value={otherQty}
                      onChange={(e) => onStockChange(p.id, 'other', Math.max(0, Number(e.target.value) || 0))}
                      className={`w-20 rounded-xl border px-2 py-1.5 text-center font-mono text-xl font-bold transition-all ${
                        otherQty > otherOrig
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-2 ring-emerald-500'
                          : otherQty < otherOrig
                          ? 'border-rose-500 bg-rose-950/40 text-rose-300 ring-2 ring-rose-500'
                          : 'border-zinc-700 bg-zinc-900 text-zinc-400 focus:border-cyan-400'
                      }`}
                    />
                    <div className="h-5 flex items-center justify-center mt-1">
                      {isOtherModified && (
                        <span
                          className={`text-xs font-mono font-bold ${
                            otherQty - otherOrig > 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {otherQty - otherOrig > 0
                            ? `+${otherQty - otherOrig}`
                            : otherQty - otherOrig}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* 預估總計 (放大 text-xl 20px) */}
                <td className="px-4 py-3.5 text-right font-mono font-extrabold text-xl text-cyan-300">
                  {totalCalculated}
                </td>

                {/* 預購未交 (放大 text-xl 20px，無「台」單位) */}
                <td className="px-4 py-3.5 text-right font-mono font-bold text-xl">
                  {p.preOrderPendingCount > 0 ? (
                    <span className="text-amber-400">{p.preOrderPendingCount}</span>
                  ) : (
                    <span className="text-zinc-600">0</span>
                  )}
                </td>

                {/* 操作按鈕 (單項調撥) */}
                <td className="px-4 py-3.5 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTransfer(p);
                    }}
                    className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-cyan-300 transition-colors"
                    title="跨據點庫存調撥"
                  >
                    ⇄ 調撥
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
