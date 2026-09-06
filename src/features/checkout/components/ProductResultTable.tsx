import { useState, useMemo } from 'react';
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

interface ProductGroup {
  groupKey: string;
  barcode: string;
  brand: string;
  name: string;
  items: Product[];
}

export function ProductResultTable({
  results,
  isLoading,
  onAdd,
  onViewDetail,
  onCreateNew,
}: ProductResultTableProps) {
  // 記錄同條碼多貨號群組中，每個群組目前選中的 productId
  const [selectedProductMap, setSelectedProductMap] = useState<Record<string, string>>({});

  // 將結果依照 barcode 分組 (若無條碼則以 id 獨立成組)
  const productGroups = useMemo(() => {
    const groups: ProductGroup[] = [];
    const map = new Map<string, ProductGroup>();

    for (const p of results) {
      const key = p.barcode ? `barcode-${p.barcode}` : `id-${p.id}`;
      if (!map.has(key)) {
        const newGroup: ProductGroup = {
          groupKey: key,
          barcode: p.barcode,
          brand: p.brand,
          name: p.name,
          items: [p],
        };
        map.set(key, newGroup);
        groups.push(newGroup);
      } else {
        map.get(key)!.items.push(p);
      }
    }
    return groups;
  }, [results]);

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
        <p className="text-sm text-zinc-400">找不到符合條件的模型商品</p>
        <Button size="sm" variant="secondary" onClick={onCreateNew}>
          + 新增此商品建檔
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden rounded-lg border border-zinc-800 bg-zinc-900/40 max-h-full">
      <table className="w-full table-fixed text-left text-xs border-collapse">
        <thead className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950 text-zinc-300 font-semibold select-none shadow-sm shadow-black/40">
          <tr>
            <th className="py-2 pl-2.5 pr-1.5 w-24 bg-zinc-950 truncate">廠牌 / 貨號</th>
            <th className="py-2 px-1.5 bg-zinc-950 truncate">品名 / 規格 (點擊加入)</th>
            <th className="py-2 px-1.5 w-16 text-right bg-zinc-950">定價</th>
            <th className="py-2 pl-1 pr-2 w-12 text-center bg-zinc-950">詳情</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {productGroups.map((group) => {
            const currentSelectedId = selectedProductMap[group.groupKey] || group.items[0].id;
            const currentProduct = group.items.find((i) => i.id === currentSelectedId) || group.items[0];
            const hasMultipleSkus = group.items.length > 1;

            return (
              <tr
                key={group.groupKey}
                onClick={() => onAdd(currentProduct)}
                className="group cursor-pointer transition-colors hover:bg-zinc-800/60"
                title="點擊將商品加入待結清單"
              >
                {/* 1. 廠牌與貨號合併上下行 (縮小字體) */}
                <td className="py-2 pl-2.5 pr-1.5 align-middle overflow-hidden">
                  <div className="flex flex-col">
                    <span className="font-semibold text-zinc-200 text-xs truncate" title={currentProduct.brand}>
                      {currentProduct.brand}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-400 font-medium tracking-tight mt-0.5 truncate" title={currentProduct.sku}>
                      {currentProduct.sku}
                    </span>
                  </div>
                </td>

                {/* 2. 商品品名與同條碼多貨號下拉選單 (直接出現下拉選單，依需求 2) */}
                <td className="py-2 px-1.5 align-middle overflow-hidden">
                  <p className="truncate font-medium text-zinc-100 group-hover:text-cyan-300 transition-colors text-xs" title={currentProduct.name}>
                    {currentProduct.name}
                  </p>

                  {hasMultipleSkus ? (
                    <div className="mt-0.5" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={currentSelectedId}
                        onChange={(e) => {
                          setSelectedProductMap((prev) => ({
                            ...prev,
                            [group.groupKey]: e.target.value,
                          }));
                        }}
                        className="w-full rounded border border-cyan-800/80 bg-zinc-900 px-1.5 py-0.5 text-[11px] text-cyan-200 font-mono focus:border-cyan-400 focus:outline-none truncate"
                        title="選擇此條碼的不同貨號"
                      >
                        {group.items.map((item) => (
                          <option key={item.id} value={item.id}>
                            [{item.sku}] {item.spec ? `${item.spec} - ` : ''}
                            {formatCurrency(item.listPrice)}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : currentProduct.spec ? (
                    <p className="text-[11px] text-zinc-400 mt-0.5 truncate" title={currentProduct.spec}>
                      {currentProduct.spec}
                    </p>
                  ) : null}
                </td>

                {/* 3. 定價 (與下拉選擇聯動) */}
                <td className="py-2 px-1.5 text-right font-mono font-bold text-cyan-300 text-xs align-middle whitespace-nowrap">
                  {formatCurrency(currentProduct.listPrice)}
                </td>

                {/* 4. 詳情按鈕 */}
                <td className="py-2 pl-1 pr-2 text-center align-middle">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetail(currentProduct);
                    }}
                    title="查看商品詳細資訊"
                    className="inline-flex items-center justify-center rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[11px] font-semibold text-zinc-300 hover:border-cyan-400 hover:text-cyan-300 hover:bg-zinc-700 transition-colors whitespace-nowrap"
                  >
                    ℹ
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
