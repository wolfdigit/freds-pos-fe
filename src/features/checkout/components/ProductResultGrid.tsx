import type { Product } from '@/types/product';
import { ProductResultCard } from './ProductResultCard';
import { Spinner } from '@/components/feedback/Spinner';
import { Button } from '@/components/common/Button';

interface ProductResultGridProps {
  results: Product[];
  isLoading: boolean;
  onAdd: (product: Product) => void;
  onCreateNew: () => void;
}

export function ProductResultGrid({ results, isLoading, onAdd, onCreateNew }: ProductResultGridProps) {
  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-zinc-800 py-12 text-center">
        <p className="text-sm text-zinc-500">找不到符合條件的模型車，請檢查貨號或條碼</p>
        <Button size="sm" variant="secondary" onClick={onCreateNew}>
          + 新增此商品建檔
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
      {results.map((product) => (
        <ProductResultCard key={product.id} product={product} onAdd={onAdd} />
      ))}
    </div>
  );
}
