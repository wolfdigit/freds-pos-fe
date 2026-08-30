import type { Product } from '@/types/product';
import { Badge } from '@/components/common/Badge';
import { formatCurrency } from '@/utils/currency';

interface ProductResultCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function ProductResultCard({ product, onAdd }: ProductResultCardProps) {
  const storeQty = product.stocks.find((s) => s.location === 'store')?.quantity ?? 0;
  const warehouseQty = product.stocks.find((s) => s.location === 'warehouse')?.quantity ?? 0;

  return (
    <button
      onClick={() => onAdd(product)}
      className="flex flex-col gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-left transition-colors hover:border-cyan-600 hover:bg-zinc-800/60"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-zinc-500">
          {product.brand} · {product.scale}
        </span>
        <span className="font-mono text-xs text-zinc-500">{product.sku}</span>
      </div>
      <p className="line-clamp-2 text-sm font-medium text-zinc-100">{product.name}</p>
      <div className="flex items-center justify-between">
        <span className="font-mono text-base font-semibold text-cyan-300">
          {formatCurrency(product.listPrice)}
        </span>
        <div className="flex gap-1">
          {storeQty > 0 ? (
            <Badge color="emerald">門市 {storeQty}</Badge>
          ) : (
            <Badge color="amber">需調撥</Badge>
          )}
          <Badge color="zinc">倉庫 {warehouseQty}</Badge>
        </div>
      </div>
    </button>
  );
}
