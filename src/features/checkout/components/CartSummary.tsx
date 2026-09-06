import { formatCurrency } from '@/utils/currency';
import { Button } from '@/components/common/Button';

interface CartSummaryProps {
  subtotal: number;
  salesSubtotal?: number;
  returnSubtotal?: number;
  discount: number;
  shippingFee: number;
  onShippingFeeChange: (fee: number) => void;
  totalAmount: number;
  itemCount: number;
  salesItemCount?: number;
  returnItemCount?: number;
  boundCustomerName?: string | null;
  hasPreOrderItems?: boolean;
  onClear: () => void;
  onCheckout: () => void;
  onConvertToPreOrder?: () => void;
}

// 依需求 9：刪除宅配 $100，超商 $60 改成 $65
const SHIPPING_PRESETS = [
  { label: '免運 $0', fee: 0 },
  { label: '超商 $65', fee: 65 },
];

export function CartSummary({
  subtotal,
  salesSubtotal,
  returnSubtotal,
  discount,
  shippingFee,
  onShippingFeeChange,
  totalAmount,
  itemCount,
  salesItemCount = 0,
  returnItemCount = 0,
  boundCustomerName,
  hasPreOrderItems = false,
  onClear,
  onCheckout,
  onConvertToPreOrder,
}: CartSummaryProps) {
  const isPreOrderDisabled = itemCount === 0 || !boundCustomerName || hasPreOrderItems;

  const getPreOrderTooltip = () => {
    if (hasPreOrderItems) return '購物車內含有帶入之預購品項，無法再轉寫為預購單';
    if (!boundCustomerName) return '需先綁定會員方可轉為預購單';
    if (itemCount === 0) return '購物車無商品';
    return `將購物車商品轉為會員「${boundCustomerName}」之預購單`;
  };

  const hasReturns = returnSubtotal !== undefined && returnSubtotal < 0;

  return (
    <div className="mt-2.5 space-y-2.5 border-t border-zinc-800 pt-2.5">
      {/* 費用明細 */}
      <div className="space-y-1.5 font-mono text-sm text-zinc-300">
        {hasReturns ? (
          <>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400">待結銷售小計</span>
              <span className="font-semibold text-zinc-200">{formatCurrency(salesSubtotal ?? 0)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-rose-400">
              <span>↩️ 瑕疵退貨折抵</span>
              <span className="font-bold">{formatCurrency(returnSubtotal)}</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between items-center">
            <span className="text-zinc-400 text-xs">商品小計</span>
            <span className="font-semibold text-zinc-200 text-base">{formatCurrency(subtotal)}</span>
          </div>
        )}

        {discount !== 0 && (
          <div className="flex justify-between items-center text-amber-400 text-xs">
            <span>改價折讓</span>
            <span className="font-semibold text-sm">-{formatCurrency(discount)}</span>
          </div>
        )}

        {/* 運費輸入與快速選取 (依需求 5：運費按鈕放大) */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <span className="text-zinc-300 text-sm font-semibold">運費</span>
            <div className="flex gap-2">
              {SHIPPING_PRESETS.map((preset) => (
                <button
                  key={preset.fee}
                  type="button"
                  onClick={() => onShippingFeeChange(preset.fee)}
                  className={`rounded-lg px-3 py-1 text-sm font-bold transition-all shadow-sm ${
                    shippingFee === preset.fee
                      ? 'bg-cyan-500 text-zinc-950 ring-2 ring-cyan-400'
                      : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white border border-zinc-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-zinc-400 text-sm">$</span>
            <input
              type="text"
              inputMode="numeric"
              value={shippingFee}
              onChange={(e) => onShippingFeeChange(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)}
              className="w-24 rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-right font-mono text-base font-bold text-zinc-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 應收總計與件數統計 (依需求 5 & 10：總計件數字體放大，分開統計購買與退貨) */}
      <div className="flex items-center justify-between border-t border-zinc-800/80 pt-2.5">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-zinc-300">
            {totalAmount < 0 ? '門市退款總額' : '應收總計'}
          </span>
          {/* 件數統計 (字體放大) */}
          <div className="text-sm font-mono text-zinc-300 mt-1">
            {returnItemCount > 0 ? (
              <span className="flex items-center gap-2">
                <span>購買 <strong className="text-cyan-300 text-base font-extrabold">{salesItemCount}</strong> 件</span>
                <span className="text-zinc-500">|</span>
                <span className="text-rose-400">退貨 <strong className="text-rose-300 text-base font-extrabold">{returnItemCount}</strong> 件</span>
              </span>
            ) : (
              <span>共 <strong className="text-cyan-300 text-base font-extrabold">{itemCount}</strong> 件商品</span>
            )}

          </div>
        </div>

        <span
          className={`font-mono text-3xl font-extrabold ${
            totalAmount < 0 ? 'text-rose-400' : 'text-cyan-300'
          }`}
        >
          {formatCurrency(totalAmount)}
        </span>
      </div>

      {/* 操作按鈕組 */}
      <div className="flex items-center gap-2 pt-1.5">
        <Button
          variant="ghost"
          size="md"
          onClick={onClear}
          className="px-3 py-2.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 shrink-0"
        >
          清空
        </Button>

        {onConvertToPreOrder && (
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onConvertToPreOrder}
            disabled={isPreOrderDisabled}
            title={getPreOrderTooltip()}
            className={`px-3 py-2.5 text-xs font-bold shrink-0 border transition-all ${
              isPreOrderDisabled
                ? 'border-zinc-800 bg-zinc-900 text-zinc-600 opacity-60 cursor-not-allowed'
                : 'border-amber-500/60 bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 shadow-sm'
            }`}
          >
            📋 轉預購單
          </Button>
        )}

        <Button
          variant="primary"
          size="lg"
          onClick={onCheckout}
          disabled={itemCount === 0}
          className={`flex-1 py-2.5 text-base font-bold shadow-lg transition-all ${
            totalAmount < 0
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
              : 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-cyan-950/50'
          }`}
        >
          {totalAmount < 0 ? '↩️ 確認退貨處置 (Space)' : '💳 結帳收銀 (Space)'}
        </Button>
      </div>
    </div>
  );
}
