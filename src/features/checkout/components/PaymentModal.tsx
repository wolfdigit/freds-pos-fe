import { useState, useMemo } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { formatCurrency } from '@/utils/currency';
import { useCartStore } from '@/store/cartStore';
import type { InvoiceInfo, PaymentMethodType, PaymentTender } from '@/types/checkout';

export interface OverStockItemDetail {
  productId?: string;
  name: string;
  quantity: number;
  storeStock: number;
  totalStock: number;
  preOrderReserved: number;
  available: number;
}

interface PaymentModalProps {
  open: boolean;
  totalAmount: number;
  isSubmitting: boolean;
  hasOverStockItems?: boolean;
  overStockItemsList?: OverStockItemDetail[];
  onClose: () => void;
  onConfirm: (payments: PaymentTender[], invoice: InvoiceInfo) => void;
}

// 依需求 11：7 種指定付款方式
const PAYMENT_METHODS: { type: PaymentMethodType; label: string; icon: string }[] = [
  { type: 'cash', label: '現金', icon: '💵' },
  { type: 'bank_transfer_ctbc', label: '轉帳(中信)', icon: '🏦' },
  { type: 'bank_transfer_ubot', label: '轉帳(聯邦)', icon: '🏦' },
  { type: 'credit_card_physical', label: '信用卡(實體)', icon: '💳' },
  { type: 'credit_card_online', label: '信用卡(網路)', icon: '🌐' },
  { type: 'line_pay', label: 'LINE Pay', icon: '📱' },
  { type: 'cod', label: '貨到付款', icon: '📦' },
];

export function PaymentModal({
  open,
  totalAmount,
  isSubmitting,
  hasOverStockItems = false,
  overStockItemsList = [],
  onClose,
  onConfirm,
}: PaymentModalProps) {

  const [method, setMethod] = useState<PaymentMethodType>('cash');
  const [showOverStockConfirm, setShowOverStockConfirm] = useState(false);

  const { attachedCustomer, usedPoints, setUsedPoints, getSubtotal, shippingFee } = useCartStore();

  const customerPoints = attachedCustomer?.rewardPoints ?? 0;
  const isNegative = totalAmount < 0;

  // 最大可折抵點數：不可超過顧客現有點數，且不可超過（商品小計 + 運費）
  const maxRedeemablePoints = useMemo(() => {
    if (isNegative || !attachedCustomer) return 0;
    const orderPrePointsTotal = Math.max(0, getSubtotal() + shippingFee);
    return Math.min(customerPoints, orderPrePointsTotal);
  }, [isNegative, attachedCustomer, customerPoints, getSubtotal, shippingFee]);

  const selectedMethodObj = PAYMENT_METHODS.find((m) => m.type === method) || PAYMENT_METHODS[0];

  const proceedSubmit = () => {
    const invoice: InvoiceInfo = { type: 'none' };
    const payment: PaymentTender = {
      type: method,
      name: isNegative ? `${selectedMethodObj.label}退款` : selectedMethodObj.label,
      amount: totalAmount,
    };

    setShowOverStockConfirm(false);
    onConfirm([payment], invoice);
  };

  const handleConfirmClick = () => {
    if (hasOverStockItems) {
      setShowOverStockConfirm(true);
      return;
    }
    proceedSubmit();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isNegative ? '↩️ 門市退換貨處置' : '💳 付款與收銀結帳'}
      widthClassName="max-w-2xl"
    >
      <div className="space-y-4 text-base">
        {/* 會員點數折抵區塊 (當有會員且非純退款時顯示) */}
        {attachedCustomer && !isNegative && customerPoints > 0 && (
          <div className="rounded-xl border border-amber-600/40 bg-amber-950/20 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-amber-300 flex items-center gap-1.5">
                <span>🎁 會員點數折抵</span>
                <span className="font-mono text-zinc-400 font-normal">
                  (現有 {customerPoints} pts · 1 點折 1 元)
                </span>
              </span>
              <span className="font-mono text-amber-200">
                已折抵：<strong className="text-sm text-amber-400 font-bold">{usedPoints}</strong> 元
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 flex gap-1.5">
                {[0, 50, 100, 200].map((pts) => (
                  <button
                    key={pts}
                    type="button"
                    disabled={pts > maxRedeemablePoints}
                    onClick={() => setUsedPoints(pts)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition-all border ${
                      usedPoints === pts
                        ? 'border-amber-400 bg-amber-500 text-zinc-950 shadow-sm'
                        : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    {pts === 0 ? '不折抵' : `折 $${pts}`}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={maxRedeemablePoints <= 0}
                  onClick={() => setUsedPoints(maxRedeemablePoints)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition-all border ${
                    usedPoints === maxRedeemablePoints && maxRedeemablePoints > 0
                      ? 'border-amber-400 bg-amber-500 text-zinc-950 shadow-sm'
                      : 'border-amber-600/60 bg-amber-900/40 text-amber-200 hover:bg-amber-800/60 disabled:opacity-40'
                  }`}
                >
                  全額折 (${maxRedeemablePoints})
                </button>
              </div>

              <div className="flex items-center gap-1 text-xs">
                <span className="text-zinc-400">自訂:</span>
                <input
                  type="number"
                  min={0}
                  max={maxRedeemablePoints}
                  value={usedPoints || ''}
                  placeholder="0"
                  onChange={(e) => {
                    const val = Math.min(maxRedeemablePoints, Math.max(0, Number(e.target.value) || 0));
                    setUsedPoints(val);
                  }}
                  className="w-16 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-right font-mono text-xs font-bold text-amber-300 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 金額顯示卡片 */}
        <div
          className={`rounded-xl border py-4 px-4 text-center transition-all ${
            isNegative
              ? 'border-rose-600/80 bg-rose-950/50 shadow-lg shadow-rose-950/60 ring-1 ring-rose-500/40'
              : 'border-zinc-800 bg-zinc-950/70'
          }`}
        >
          <p className={`text-sm font-bold ${isNegative ? 'text-rose-300' : 'text-zinc-400'}`}>
            {isNegative ? '↩️ 門市應退款總額' : '應收結帳總金額'}
          </p>
          <p
            className={`font-mono text-4xl font-extrabold mt-1 tracking-tight ${
              isNegative ? 'text-rose-400 drop-shadow-md' : 'text-cyan-300'
            }`}
          >
            {isNegative ? `-${formatCurrency(Math.abs(totalAmount))}` : formatCurrency(totalAmount)}
          </p>
        </div>

        {/* 支付方式選擇 (依需求 11：7 種指定付款方式) */}
        <div>
          <label className="mb-2 block text-xs font-bold text-zinc-400">請選擇結帳支付方式</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {PAYMENT_METHODS.map((m) => {
              const isSelected = method === m.type;
              return (
                <button
                  key={m.type}
                  type="button"
                  onClick={() => setMethod(m.type)}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-3 px-2 text-sm font-bold transition-all ${
                    isSelected
                      ? isNegative
                        ? 'border-rose-500 bg-rose-500/20 text-rose-200 shadow-md shadow-rose-950/50 ring-2 ring-rose-500/60'
                        : 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-md shadow-cyan-950/50 ring-2 ring-cyan-500/60'
                      : 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{m.icon}</span>
                  <span>{isNegative ? `${m.label}退款` : m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 底部按鈕 */}
        <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
          <Button variant="ghost" size="lg" onClick={onClose} disabled={isSubmitting}>
            取消
          </Button>
          <Button
            variant={isNegative ? 'danger' : 'primary'}
            size="lg"
            onClick={handleConfirmClick}
            disabled={isSubmitting}
            className="px-8 text-base font-bold shadow-lg"
          >
            {isSubmitting
              ? '結帳處理中...'
              : isNegative
              ? `確認以【${selectedMethodObj.label}】完成退款`
              : `確認【${selectedMethodObj.label}】完成結帳 (${formatCurrency(totalAmount)})`}
          </Button>
        </div>
      </div>

      {/* 現貨不足二次確認 Modal */}
      {showOverStockConfirm && (
        <Modal
          open={showOverStockConfirm}
          onClose={() => setShowOverStockConfirm(false)}
          title="⚠️ 門市現貨/全域庫存不足確認"
          widthClassName="max-w-xl"
        >
          <div className="space-y-4 text-sm text-zinc-300">
            <p className="text-amber-300 font-semibold">
              以下商品結帳數量超過門市現貨或全域可售庫存，出單後請至倉庫調撥或注意交期：
            </p>
            <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 font-mono text-xs">
              {overStockItemsList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-zinc-800/60 pb-1.5 last:border-0 last:pb-0"
                >
                  <span className="font-semibold text-zinc-200 truncate max-w-[240px]">
                    {item.name}
                  </span>
                  <div className="text-right">
                    <span className="text-cyan-300">結帳 {item.quantity} 台</span>
                    <span className="text-zinc-500 ml-2">
                      (門市現貨: {item.storeStock} / 全店可售: {item.available})
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowOverStockConfirm(false)}>
                返回修改
              </Button>
              <Button variant="primary" onClick={proceedSubmit} disabled={isSubmitting}>
                確認繼續結帳
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
}
