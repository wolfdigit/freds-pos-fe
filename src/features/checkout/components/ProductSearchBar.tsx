import { forwardRef } from 'react';
import { Input } from '@/components/common/Input';
import { cn } from '@/utils/cn';

const BRAND_TABS: string[] = [
  'ALL',
  'AutoArt',
  'Spark',
  'Inno64',
  'Mini GT',
  'Tomica Limited Vintage',
  'Kyosho',
  'Minichamps',
  'Ignition Model',
  'Hot Wheels',
  "Fred's 周邊",
];

interface ProductSearchBarProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  brand: string | 'ALL';
  onBrandChange: (brand: string | 'ALL') => void;
}

export const ProductSearchBar = forwardRef<HTMLInputElement, ProductSearchBarProps>(function ProductSearchBar(
  { keyword, onKeywordChange, brand, onBrandChange },
  ref
) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          ref={ref}
          monospace
          placeholder="🔍 掃描條碼 / 輸入貨號(支援無dash) / 車型品名... (F2 聚焦)"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          className="text-lg py-2.5 pr-10"
        />
        {keyword && (
          <button
            type="button"
            onClick={() => onKeywordChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 text-base"
            title="清空商品搜尋"
          >
            ✕
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {BRAND_TABS.map((b) => (
          <button
            key={b}
            onClick={() => onBrandChange(b)}
            className={cn(
              'whitespace-nowrap rounded-lg px-3 py-1.5 text-base font-medium transition-colors',
              brand === b
                ? 'bg-cyan-500 text-zinc-950 font-bold'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
            )}
          >
            {b === 'ALL' ? '全部廠牌' : b === 'Tomica Limited Vintage' ? 'TLV' : b}
          </button>
        ))}
      </div>
    </div>
  );
});
