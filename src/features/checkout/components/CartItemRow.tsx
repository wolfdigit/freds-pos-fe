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

  const parsedQty = parseInt(qtyInput, 10);
  const currentQuantity = !isNaN(parsedQty) && parsedQty > 0 ? parsedQty : item.quantity;
  const subtotal = item.unitPrice * currentQuantity;

  const isModifiedPrice = item.unitPrice !== item.originalPrice;
  const storeStock = item.storeStock ?? 0;
  const totalStock = item.totalStock ?? storeStock;
  const preOrderReserved = item.preOrderPendingCount ?? 0;
  const sellableTotal = Math.max(0, totalStock - preOrderReserved);

  const isOverStoreStock = !item.preOrderId && currentQuantity > storeStock;
  const isOverTotalSellable = !item.preOrderId && currentQuantity > sellableTotal;
  const isOverStock = isOverStoreStock || isOverTotalSellable;

  return (
    <div
      className={`group flex items-center justify-between gap-2.5 border-b py-2 text-base transition-colors px-2 rounded ${
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
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-zinc-500 text-sm shrink-0">{index}.</span>
          <p className="font-semibold text-zinc-100 text-base group-hover:text-cyan-300 transition-colors truncate">
            {item.name}
          </p>
        </div>

        {/* 庫存不足警示標籤 */}
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

        {/* 貨號與標籤資訊 */}
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-400">
          <span className="font-mono text-zinc-400 font-medium">{item.sku}</span>
          <span>· {item.brand}</span>
          {item.preOrderId && (
            <span className="rounded bg-cyan-950 px-1.5 py-0.5 text-[11px] font-semibold text-cyan-300 border border-cyan-800/60 shrink-0">
              預購取貨
            </span>
          )}
          {isModifiedPrice && (
            <span className="text-zinc-500 line-through text-xs shrink-0">
              原價 {formatCurrency(item.originalPrice)}
            </span>
          )}
        </div>
      </div>

      {/* 單價輸入框 */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-zinc-400">$</span>
        <input
          type="text"
          inputMode="numeric"
          title="直接修改單價 (Enter或點擊空白處確認)"
          value={priceInput}
          onChange={(e) => setPriceInput(e.target.value.replace(/[^0-9]/g, ''))}
          onBlur={handlePriceBlur}
          onKeyDown={(e) => e.key === 'Enter' && handlePriceBlur()}
          className={`w-20 rounded-lg border bg-zinc-950 px-1.5 py-1 text-right font-mono text-sm font-bold transition-colors focus:border-cyan-500 focus:outline-none ${
            isModifiedPrice ? 'border-amber-600/80 text-amber-300' : 'border-zinc-700 text-zinc-100'
          }`}
        />
      </div>

      {/* 乘號 */}
      <span className="text-zinc-500 text-xs font-bold shrink-0">×</span>

      {/* 數量輸入框與微調 */}
      <div className="flex items-center gap-1 shrink-0">
        <div className="flex items-center rounded-lg border border-zinc-700 bg-zinc-950 overflow-hidden">
          <input
            type="number"
            step="1"
            min="1"
            title="修改數量"
            value={qtyInput}
            onChange={handleQtyChange}
            onBlur={handleQtyBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleQtyBlur()}
            className="w-14 bg-transparent px-1.5 py-1 text-center font-mono text-sm font-bold text-zinc-100 transition-colors focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <div className="flex flex-col border-l border-zinc-800 bg-zinc-900/80 shrink-0">
            <button
              type="button"
              onClick={() => {
                const next = item.quantity + 1;
                onUpdateQuantity(next);
                setQtyInput(String(next));
              }}
              className="flex h-3.5 w-4 items-center justify-center text-[9px] text-zinc-400 hover:bg-cyan-900 hover:text-cyan-200 transition-colors"
              title="增加數量 (+1)"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => {
                if (item.quantity > 1) {
                  const next = item.quantity - 1;
                  onUpdateQuantity(next);
                  setQtyInput(String(next));
                }
              }}
              className="flex h-3.5 w-4 items-center justify-center text-[9px] text-zinc-400 hover:bg-zinc-800 transition-colors border-t border-zinc-800"
              title="減少數量 (-1)"
            >
              ▼
            </button>
          </div>
        </div>
      </div>

      {/* 小計 */}
      <div className="w-20 text-right font-mono text-base font-bold text-cyan-300 shrink-0">
        {formatCurrency(subtotal)}
      </div>

      {/* 刪除按鈕 */}
      <button
        onClick={onRemove}
        className="text-zinc-500 hover:text-rose-400 p-1 text-base transition-colors shrink-0"
        title="移除商品"
      >
        ✕
      </button>
    </div>
  );
}

export function ReturnCartItemRow({
  item,
  index,
  onUpdateQuantity,
  onUpdatePrice,
  onRemove,
  onViewDetail,
}: CartItemRowProps) {
  const [priceInput, setPriceInput] = useState(String(item.unitPrice));
  const [qtyInput, setQtyInput] = useState(String(Math.abs(item.quantity)));

  useEffect(() => {
    setPriceInput(String(item.unitPrice));
  }, [item.unitPrice]);

  useEffect(() => {
    setQtyInput(String(Math.abs(item.quantity)));
  }, [item.quantity]);

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setQtyInput(valStr);
    const val = parseInt(valStr, 10);
    if (!isNaN(val) && val > 0) {
      onUpdateQuantity(-val);
    }
  };

  const handleQtyBlur = () => {
    const val = parseInt(qtyInput, 10);
    if (!isNaN(val) && val > 0) {
      onUpdateQuantity(-val);
    } else {
      setQtyInput(String(Math.abs(item.quantity)));
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

  const absQty = Math.abs(item.quantity);
  const refundSubtotal = item.unitPrice * item.quantity; // 負數金額

  return (
    <div className="group flex items-center justify-between gap-2.5 border-b border-rose-900/40 py-1.5 px-2 text-base transition-colors rounded bg-rose-950/40 hover:bg-rose-950/60">
      {/* 品名與貨號 */}
      <div
        onClick={onViewDetail}
        className="min-w-0 flex-1 cursor-pointer select-none rounded p-1 -m-1 hover:bg-rose-900/30 transition-colors"
        title="點擊查看此商品詳細資訊"
      >
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-rose-400/80 text-xs shrink-0">{index}.</span>
          <span className="rounded bg-rose-500/20 border border-rose-500/50 px-1.5 py-0.5 text-[11px] font-bold text-rose-300 shrink-0">
            退貨
          </span>
          <p className="font-semibold text-rose-100 text-sm group-hover:text-rose-200 transition-colors truncate">
            {item.name}
          </p>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-rose-300/70">
          <span className="font-mono font-medium">{item.sku}</span>
          <span>· {item.brand}</span>
        </div>
      </div>

      {/* 單價輸入框 */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-rose-400">$</span>
        <input
          type="text"
          inputMode="numeric"
          title="修改退貨對應單價"
          value={priceInput}
          onChange={(e) => setPriceInput(e.target.value.replace(/[^0-9]/g, ''))}
          onBlur={handlePriceBlur}
          onKeyDown={(e) => e.key === 'Enter' && handlePriceBlur()}
          className="w-20 rounded-lg border border-rose-800 bg-rose-950 px-1.5 py-1 text-right font-mono text-sm font-bold text-rose-200 focus:border-rose-400 focus:outline-none"
        />
      </div>

      {/* 乘號 */}
      <span className="text-rose-400/70 text-xs font-bold shrink-0">×</span>

      {/* 數量控制 */}
      <div className="flex items-center gap-1 shrink-0">
        <div className="flex items-center rounded-lg border border-rose-800 bg-rose-950 overflow-hidden">
          <span className="pl-1.5 font-mono text-xs font-bold text-rose-400">-</span>
          <input
            type="number"
            step="1"
            min="1"
            title="修改退貨數量"
            value={qtyInput}
            onChange={handleQtyChange}
            onBlur={handleQtyBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleQtyBlur()}
            className="w-12 bg-transparent px-1 py-1 text-center font-mono text-sm font-bold text-rose-200 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <div className="flex flex-col border-l border-rose-900 bg-rose-900/60 shrink-0">
            <button
              type="button"
              onClick={() => {
                const nextAbs = absQty + 1;
                onUpdateQuantity(-nextAbs);
                setQtyInput(String(nextAbs));
              }}
              className="flex h-3.5 w-4 items-center justify-center text-[9px] text-rose-300 hover:bg-rose-800 transition-colors"
              title="增加退貨數量 (+1)"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => {
                if (absQty > 1) {
                  const nextAbs = absQty - 1;
                  onUpdateQuantity(-nextAbs);
                  setQtyInput(String(nextAbs));
                }
              }}
              className="flex h-3.5 w-4 items-center justify-center text-[9px] text-rose-400 hover:bg-rose-800 transition-colors border-t border-rose-900"
              title="減少退貨數量 (-1)"
            >
              ▼
            </button>
          </div>
        </div>
      </div>

      {/* 退貨折抵小計 */}
      <div className="w-20 text-right font-mono text-base font-bold text-rose-400 shrink-0">
        {formatCurrency(refundSubtotal)}
      </div>

      {/* 刪除按鈕 */}
      <button
        onClick={onRemove}
        className="text-rose-400/60 hover:text-rose-300 p-1 text-base transition-colors shrink-0"
        title="移除退貨品項"
      >
        ✕
      </button>
    </div>
  );
}
