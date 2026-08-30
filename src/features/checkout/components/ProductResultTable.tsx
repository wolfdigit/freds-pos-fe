import type { Product } from '@/types/product';
import { Spinner } from '@/components/feedback/Spinner';
import { Button } from '@/components/common/Button';
import { formatCurrency } from '@/utils/currency';

interface ProductResultTableProps {
  results: Product[];
  isLoading: boolean;
  onAdd: (product: Product) => void;
  onViewDetail: (product: Product) => void;
  onCreateNew: () => void;
}

export function ProductResultTable({
  results,
  isLoading,
  onAdd,
  onViewDetail,
  onCreateNew,
}: ProductResultTableProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/30">
        <Spinner />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-zinc-800 bg-zinc-900/20 py-16 text-center">
        <p className="text-base text-zinc-400">找不到符合條件的模型商品，請檢查貨號或條碼</p>
        <Button size="md" variant="secondary" onClick={onCreateNew}>
          + 新增此商品建檔
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto rounded-lg border border-zinc-800 bg-zinc-900/40 max-h-full">
      <table className="w-full text-left text-base border-collapse">
        <thead className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950 text-zinc-300 font-semibold select-none shadow-sm shadow-black/40">
          <tr>
            <th className="py-3 pl-3 pr-2 w-28 text-base bg-zinc-950">廠牌</th>
            <th className="py-3 px-2 w-36 text-base bg-zinc-950">貨號 (SKU)</th>
            <th className="py-3 px-2 text-base bg-zinc-950">商品品名 / 車型塗裝 (點擊整列直接加入)</th>
            <th className="py-3 px-2 w-32 text-center text-base bg-zinc-950">門市現貨</th>
            <th className="py-3 px-2 w-24 text-center text-base bg-zinc-950">倉庫</th>
            <th className="py-3 px-2 w-32 text-right text-base bg-zinc-950">定價</th>
            <th className="py-3 pl-2 pr-3 w-24 text-center text-base bg-zinc-950">詳情</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {results.map((product) => {
            const storeQty = product.stocks.find((s) => s.location === 'store')?.quantity ?? 0;
            const warehouseQty = product.stocks.find((s) => s.location === 'warehouse')?.quantity ?? 0;
            const reservedPreOrder = product.preOrderPendingCount ?? 0;
            // 預購保留是扣減在總現貨：全域可售總現貨 = 全域總現貨 - 預購未取保留
            const sellableTotal = Math.max(0, product.totalStock - reservedPreOrder);
            const isOutOfStoreStock = storeQty <= 0;

            return (
              <tr
                key={product.id}
                onClick={() => onAdd(product)}
                className="group cursor-pointer transition-colors hover:bg-zinc-800/60"
                title="點擊將商品加入結帳單"
              >
                <td className="py-3 pl-3 pr-2 font-medium text-zinc-200">
                  <span className="rounded bg-zinc-800 px-2 py-1 text-sm font-semibold text-zinc-200">
                    {product.brand}
                  </span>
                </td>
                <td className="py-3 px-2 font-mono font-medium text-zinc-200 tracking-wide text-base">
                  {product.sku}
                </td>
                <td className="py-3 px-2">
                  <p className="line-clamp-1 font-medium text-zinc-100 group-hover:text-cyan-300 transition-colors text-base">
                    {product.name}
                  </p>
                </td>
                <td className="py-3 px-2 text-center font-mono font-semibold">
                  {isOutOfStoreStock ? (
                    <span
                      title={sellableTotal > 0 ? `門市無現貨，但後方倉庫/總倉仍有 ${sellableTotal} 台可售可調撥` : '全域無現貨'}
                      className="inline-flex items-center rounded-md border border-amber-800/80 bg-amber-950/60 px-2 py-1 text-sm font-bold text-amber-300"
                    >
                      需調撥 (0)
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-md border border-emerald-800/80 bg-emerald-950/60 px-2 py-1 text-sm font-bold text-emerald-300">
                      {storeQty} 台
                    </span>
                  )}
                </td>
                <td className="py-3 px-2 text-center font-mono text-zinc-300 text-base">
                  {warehouseQty} 台
                </td>
                <td className="py-3 px-2 text-right font-mono font-bold text-cyan-300 text-lg">
                  {formatCurrency(product.listPrice)}
                </td>
                <td className="py-3 pl-2 pr-3 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetail(product);
                    }}
                    title="查看商品詳細資訊"
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-base font-semibold text-zinc-200 hover:border-cyan-400 hover:text-cyan-300 hover:bg-zinc-700 transition-colors whitespace-nowrap"
                  >
                    <span>ℹ</span>
                    <span>詳情</span>
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
