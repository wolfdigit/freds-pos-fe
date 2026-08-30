import { useState, useEffect } from 'react';
import type { CartItem } from '@/store/cartStore';
import { formatCurrency } from '@/utils/currency';

interface CartItemRowProps {
  item: CartItem;
  index: number;
  onUpdateQuantity: (quantity: number) => void;
  onUpdatePrice: (price: number) => void;
  onRemove: () => void;
  onViewDetail?: () => void;
}

export function CartItemRow({
  item,
  index,
  onUpdateQuantity,
  onUpdatePrice,
  onRemove,
  onViewDetail,
}: CartItemRowProps) {
  const [priceInput, setPriceInput] = useState(String(item.unitPrice));
  const [qtyInput, setQtyInput] = useState(String(item.quantity));

  useEffect(() => {
    setPriceInput(String(item.unitPrice));
  }, [item.unitPrice]);

  useEffect(() => {
    setQtyInput(String(item.quantity));
  }, [item.quantity]);

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setQtyInput(valStr);
    const val = parseInt(valStr, 10);
    if (!isNaN(val) && val > 0 && val !== item.quantity) {
      onUpdateQuantity(val);
    }
  };

  const handlePriceBlur = () => {
    const val = Number(priceInput);
    if (!isNaN(val) && val >= 0 && val !== item.unitPrice) {
      onUpdatePrice(val);
    } else {
      setPriceInput(String(item.unitPrice));
    }
  };

  const handleQtyBlur = () => {
    const val = parseInt(qtyInput, 10);
    if (!isNaN(val) && val > 0) {
      if (val !== item.quantity) onUpdateQuantity(val);
    } else {
      setQtyInput(String(item.quantity));
    }
  };

  // 即時計算當前輸入之有效數量 (若輸入中或失焦皆能即時反映警示)
  const parsedQty = parseInt(qtyInput, 10);
  const currentQuantity = !isNaN(parsedQty) && parsedQty > 0 ? parsedQty : item.quantity;

  const subtotal = item.unitPrice * currentQuantity;
  const isModifiedPrice = item.unitPrice !== item.originalPrice;
  const storeStock = item.storeStock ?? 0;
  const totalStock = item.totalStock ?? storeStock;
  const preOrderReserved = item.preOrderPendingCount ?? 0;
  // 預購保留扣減在總現貨
  const sellableTotal = Math.max(0, totalStock - preOrderReserved);
  // 門市現貨不足或超出全店可售總額 (以當前輸入之即時數量判斷)
  const isOverStoreStock = !item.preOrderId && currentQuantity > storeStock;
  const isOverTotalSellable = !item.preOrderId && currentQuantity > sellableTotal;
  const isOverStock = isOverStoreStock || isOverTotalSellable;

  return (
    <div
      className={`group flex items-center justify-between gap-3 border-b py-3 text-base transition-colors px-2 rounded ${
        isOverStock
          ? 'border-amber-700/80 bg-amber-950/20 hover:bg-amber-950/30'
          : 'border-zinc-800/70 hover:bg-zinc-800/30'
      }`}
    >
      {/* 品名與貨號：點擊跳出商品詳情 */}
      <div
        onClick={onViewDetail}
        className="min-w-0 flex-1 cursor-pointer select-none rounded p-1 -m-1 hover:bg-zinc-800/50 transition-colors"
        title="點擊查看此商品詳細資訊"
      >
        {/* 第一行：序號與完整品名 */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-zinc-500 text-base">{index}.</span>
          <p className="font-semibold text-zinc-100 text-base group-hover:text-cyan-300 transition-colors line-clamp-1">
            {item.name}
          </p>
        </div>

        {/* 庫存不足警示標籤（簡潔單行，不換行、不分欄，閱讀清晰） */}
        {isOverTotalSellable ? (
          <div className="mt-1">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/20 border border-rose-500/60 px-2 py-0.5 text-xs font-bold text-rose-300 animate-pulse whitespace-nowrap">
              <span>⚠️ 全域庫存不足</span>
              <span className="font-mono text-rose-200">（總可售僅 {sellableTotal} 台）</span>
            </span>
          </div>
        ) : isOverStoreStock ? (
          <div className="mt-1">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/20 border border-amber-500/60 px-2 py-0.5 text-xs font-bold text-amber-300 whitespace-nowrap">
              <span>⚠️ 門市現貨不足</span>
              <span className="font-mono text-amber-200">（門市僅 {storeStock} 台，需調撥）</span>
            </span>
          </div>
        ) : null}

        {/* 貨號、廠牌與標籤資訊 */}
        <div className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
          <span className="font-mono text-zinc-400 font-medium">{item.sku}</span>
          <span>· {item.brand}</span>
          {item.preOrderId && (
            <span className="rounded bg-cyan-950 px-1.5 py-0.5 text-xs font-semibold text-cyan-300 border border-cyan-800/60">
              預購取貨
            </span>
          )}
          {isModifiedPrice && (
            <span className="text-zinc-500 line-through text-sm">
              原價 {formatCurrency(item.originalPrice)}
            </span>
          )}
        </div>
      </div>

      {/* 單價輸入框 */}
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-zinc-400">$</span>
        <input
          type="text"
          inputMode="numeric"
          title="直接修改單價 (Enter或點擊空白處確認)"
          value={priceInput}
          onChange={(e) => setPriceInput(e.target.value.replace(/[^0-9]/g, ''))}
          onBlur={handlePriceBlur}
          onKeyDown={(e) => e.key === 'Enter' && handlePriceBlur()}
          className={`w-24 rounded-lg border bg-zinc-950 px-2 py-1.5 text-right font-mono text-base font-bold transition-colors focus:border-cyan-500 focus:outline-none ${
            isModifiedPrice
              ? 'border-amber-600/80 text-amber-300'
              : 'border-zinc-700 text-zinc-100'
          }`}
        />
      </div>

      {/* 乘號 */}
      <span className="text-zinc-400 text-base font-bold">×</span>

      {/* 數量輸入框 */}
      <div>
        <input
          type="number"
          min={1}
          title="直接修改數量"
          value={qtyInput}
          onChange={handleQtyChange}
          onBlur={handleQtyBlur}
          onKeyDown={(e) => e.key === 'Enter' && handleQtyBlur()}
          className="w-16 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-center font-mono text-base font-bold text-zinc-100 focus:border-cyan-500 focus:outline-none"
        />
      </div>

      {/* 小計 */}
      <div className="w-24 text-right font-mono text-lg font-bold text-cyan-300">
        {formatCurrency(subtotal)}
      </div>

      {/* 刪除按鈕 */}
      <button
        onClick={onRemove}
        className="text-zinc-400 hover:text-rose-400 p-2 text-lg transition-colors"
        title="移除商品"
      >
        ✕
      </button>
    </div>
  );
}

