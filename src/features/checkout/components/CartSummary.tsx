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
  boundCustomerName?: string | null;
  hasPreOrderItems?: boolean;
  onClear: () => void;
  onCheckout: () => void;
  onConvertToPreOrder?: () => void;
}

const SHIPPING_PRESETS = [
  { label: '免運 $0', fee: 0 },
  { label: '超商 $60', fee: 60 },
  { label: '宅配 $100', fee: 100 },
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
    <div className="mt-3 space-y-3 border-t border-zinc-800 pt-3">
      {/* 費用明細 */}
      <div className="space-y-2 font-mono text-base text-zinc-300">
        {hasReturns ? (
          <>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">待結銷售小計</span>
              <span className="font-semibold text-zinc-200">{formatCurrency(salesSubtotal ?? 0)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-rose-400">
              <span>↩️ 瑕疵退貨折抵</span>
              <span className="font-bold">{formatCurrency(returnSubtotal)}</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">商品小計</span>
            <span className="font-semibold text-zinc-200 text-lg">{formatCurrency(subtotal)}</span>
          </div>
        )}

        {discount !== 0 && (
          <div className="flex justify-between items-center text-amber-400">
            <span>改價折讓</span>
            <span className="font-semibold text-lg">-{formatCurrency(discount)}</span>
          </div>
        )}

        {/* 運費輸入與快速選取 */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">運費</span>
            <div className="flex gap-1.5">
              {SHIPPING_PRESETS.map((preset) => (
                <button
                  key={preset.fee}
                  type="button"
                  onClick={() => onShippingFeeChange(preset.fee)}
                  className={`rounded-md px-2.5 py-1 text-sm font-semibold transition-colors ${
                    shippingFee === preset.fee
                      ? 'bg-cyan-500 text-zinc-950 font-bold'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 text-base">$</span>
            <input
              type="text"
              inputMode="numeric"
              value={shippingFee}
              onChange={(e) => onShippingFeeChange(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)}
              className="w-24 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-right font-mono text-base font-bold text-zinc-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 應收總計 */}
      <div className="flex items-center justify-between border-t border-zinc-800/80 pt-2.5">
        <span className="text-base font-bold text-zinc-300">
          {totalAmount < 0 ? '門市退款總額' : '應收總計'}
        </span>
        <span
          className={`font-mono text-3xl font-extrabold ${
            totalAmount < 0 ? 'text-rose-400' : 'text-cyan-300'
          }`}
        >
          {formatCurrency(totalAmount)}
        </span>
      </div>

      {/* 按鈕組 */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          variant="ghost"
          size="md"
          onClick={onClear}
          className="px-3 py-3 text-sm font-medium text-zinc-400 hover:text-zinc-200 shrink-0"
        >
          清空清單
        </Button>

        {onConvertToPreOrder && (
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onConvertToPreOrder}
            disabled={isPreOrderDisabled}
            title={getPreOrderTooltip()}
            className={`px-3.5 py-3 text-sm font-bold shrink-0 border transition-all ${
              isPreOrderDisabled
                ? 'border-zinc-800 bg-zinc-900 text-zinc-600 opacity-60 cursor-not-allowed'
                : 'border-amber-500/60 bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 shadow-sm'
            }`}
          >
            📋 轉成預購單
          </Button>
        )}

        <Button
          variant="primary"
          size="lg"
          onClick={onCheckout}
          disabled={itemCount === 0}
          className={`flex-1 text-base font-bold py-3 ${
            totalAmount < 0 ? 'bg-rose-600 hover:bg-rose-500 border-rose-500 text-white' : ''
          }`}
        >
          {totalAmount < 0 ? '↩️ 門市退款處置 (F9)' : '★ 付款結帳 (F9)'}
        </Button>
      </div>
    </div>
  );
}
