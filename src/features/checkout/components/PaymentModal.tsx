import { useMemo, useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { formatCurrency, calculateChange } from '@/utils/currency';
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
  onViewProductDetail?: (productId: string) => void;
}

const CASH_QUICK_ADD = [1000, 500, 100, 50, 10, 5, 1];
const METHOD_LABELS: Record<Exclude<PaymentMethodType, 'cod'>, string> = {
  cash: '現金',
  credit_card: '信用卡',
  line_pay: 'LINE Pay',
  bank_transfer: '銀行轉帳',
};

export function PaymentModal({
  open,
  totalAmount,
  isSubmitting,
  hasOverStockItems = false,
  overStockItemsList = [],
  onClose,
  onConfirm,
  onViewProductDetail,
}: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethodType>('cash');
  const [tenderedCash, setTenderedCash] = useState('');
  const [invoiceType, setInvoiceType] = useState<InvoiceInfo['type']>('none');
  const [carrierCode, setCarrierCode] = useState('');
  const [taxId, setTaxId] = useState('');
  const [buyerTitle, setBuyerTitle] = useState('');
  const [showOverStockConfirm, setShowOverStockConfirm] = useState(false);

  const { attachedCustomer, usedPoints, setUsedPoints, getSubtotal, shippingFee } = useCartStore();

  const customerPoints = attachedCustomer?.rewardPoints ?? 0;
  const isNegative = totalAmount < 0;

  useEffect(() => {
    if (open) {
      setTenderedCash('');
    }
  }, [open]);

  // 最大可折抵點數：不可超過顧客現有點數，且不可超過（商品小計 + 運費）
  const maxRedeemablePoints = useMemo(() => {
    if (isNegative || !attachedCustomer) return 0;
    const orderPrePointsTotal = Math.max(0, getSubtotal() + shippingFee);
    return Math.min(customerPoints, orderPrePointsTotal);
  }, [isNegative, attachedCustomer, customerPoints, getSubtotal, shippingFee]);

  const cashInput = Number(tenderedCash) || 0;
  const change = useMemo(() => calculateChange(cashInput, totalAmount), [cashInput, totalAmount]);

  const canConfirm = method !== 'cash' || isNegative || change.isSufficient;

  const handleQuickAdd = (amount: number) => setTenderedCash(String(cashInput + amount));
  const handleExact = () => setTenderedCash(String(totalAmount));
  const handleRoundUpThousand = () => setTenderedCash(String(Math.ceil(totalAmount / 1000) * 1000));
  const handleRoundUpHundred = () => setTenderedCash(String(Math.ceil(totalAmount / 100) * 100));

  const proceedSubmit = () => {
    const invoice: InvoiceInfo = {
      type: invoiceType,
      carrierCode: invoiceType === 'carrier' ? carrierCode : undefined,
      taxId: invoiceType === 'tax_id' ? taxId : undefined,
      buyerTitle: invoiceType === 'tax_id' ? buyerTitle : undefined,
    };

    const payment: PaymentTender = {
      type: method,
      name: isNegative ? `${METHOD_LABELS[method as Exclude<PaymentMethodType, 'cod'>]}退款` : METHOD_LABELS[method as Exclude<PaymentMethodType, 'cod'>],
      amount: method === 'cash' && !isNegative ? Math.max(cashInput, totalAmount) : totalAmount,
      ...(method === 'cash' && !isNegative ? { tenderedCash: cashInput, changeAmount: change.changeAmount } : {}),
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
    <Modal open={open} onClose={onClose} title={isNegative ? '↩️ 門市退換貨處置' : '💳 付款與收銀結帳'} widthClassName="max-w-2xl">
      <div className="space-y-4 text-base">
        {/* 會員點數折抵區塊 (當有會員且非純退款時顯示) */}
        {attachedCustomer && !isNegative && customerPoints > 0 && (
          <div className="rounded-xl border border-amber-600/40 bg-amber-950/20 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span className="text-amber-300 flex items-center gap-1.5">
                <span>🎁 會員點數折抵</span>
                <span className="font-mono text-xs text-amber-400 font-normal">
                  (現有 {customerPoints} pts · 1 點折抵 1 元)
                </span>
              </span>
              <span className="font-mono text-amber-200">
                已折抵：<strong className="text-base text-amber-400 font-bold">{usedPoints}</strong> 元
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
                  全額折抵 (${maxRedeemablePoints})
                </button>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-xs text-zinc-400">自訂:</span>
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
                  className="w-16 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-right font-mono text-sm font-bold text-amber-300 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 金額顯示 (若為負數則特別以退款玫瑰紅套色提示) */}
        <div
          className={`rounded-xl border py-3.5 px-4 text-center transition-all ${
            isNegative
              ? 'border-rose-600/80 bg-rose-950/50 shadow-lg shadow-rose-950/60 ring-1 ring-rose-500/40'
              : 'border-zinc-800 bg-zinc-950/60'
          }`}
        >
          <p
            className={`text-base font-bold ${
              isNegative ? 'text-rose-300' : 'text-zinc-400'
            }`}
          >
            {isNegative ? '↩️ 門市退款總額 (收銀抽屜退還現金 / 原管道刷退)' : '應收總金額'}
          </p>
          <p
            className={`font-mono text-4xl font-extrabold mt-0.5 tracking-tight ${
              isNegative ? 'text-rose-400 drop-shadow-md' : 'text-cyan-300'
            }`}
          >
            {isNegative ? `-${formatCurrency(Math.abs(totalAmount))}` : formatCurrency(totalAmount)}
          </p>
        </div>

        {/* 支付方式切換 */}
        <div className="flex gap-2.5">
          {(Object.keys(METHOD_LABELS) as Exclude<PaymentMethodType, 'cod'>[]).map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`flex-1 rounded-xl border py-2.5 text-base font-bold transition-colors ${
                method === m
                  ? isNegative
                    ? 'border-rose-500 bg-rose-500/20 text-rose-200 shadow-md shadow-rose-950/50'
                    : 'border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-md shadow-cyan-950/50'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {isNegative ? `${METHOD_LABELS[m]}退款` : METHOD_LABELS[m]}
            </button>
          ))}
        </div>

        {/* 現金付款快捷操作 (僅在應收為正數且選現金時出現) */}
        {method === 'cash' && !isNegative && (
          <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3.5">
            <label className="block text-base font-semibold text-zinc-200">實收現金金額</label>
            <div className="relative">
              <Input
                monospace
                type="text"
                inputMode="decimal"
                placeholder="輸入實收現金金額"
                value={tenderedCash}
                onChange={(e) => setTenderedCash(e.target.value.replace(/[^0-9]/g, ''))}
                autoFocus
                className="text-2xl font-bold py-2.5 pl-4 pr-12 text-right tracking-wider text-cyan-300"
              />
              {tenderedCash && (
                <button
                  type="button"
                  onClick={() => setTenderedCash('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 text-lg transition-colors"
                  title="清空實收現金金額"
                >
                  ✕
                </button>
              )}
            </div>

            {/* 快速面額按鈕 */}
            <div className="space-y-2 pt-0.5">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleRoundUpThousand}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-1.5 text-base font-semibold text-zinc-200 hover:bg-zinc-700 hover:border-zinc-600 transition-colors"
                >
                  進位千元 ({formatCurrency(Math.ceil(totalAmount / 1000) * 1000)})
                </button>
                <button
                  type="button"
                  onClick={handleRoundUpHundred}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-1.5 text-base font-semibold text-zinc-200 hover:bg-zinc-700 hover:border-zinc-600 transition-colors"
                >
                  進位百元 ({formatCurrency(Math.ceil(totalAmount / 100) * 100)})
                </button>
                <button
                  type="button"
                  onClick={handleExact}
                  className="rounded-lg border border-cyan-800 bg-cyan-950/80 px-3.5 py-1.5 text-base font-semibold text-cyan-300 hover:bg-cyan-900 transition-colors"
                >
                  剛剛好 ({formatCurrency(totalAmount)})
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {CASH_QUICK_ADD.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickAdd(amt)}
                    className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/80 py-1.5 font-mono text-base font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* 找零與現金不足計算顯示 */}
            {tenderedCash && (
              <div
                className={`rounded-lg p-3 text-center font-mono transition-colors ${
                  change.isSufficient
                    ? 'border border-emerald-800/80 bg-emerald-950/40 text-emerald-300'
                    : 'border border-rose-800/80 bg-rose-950/40 text-rose-300'
                }`}
              >
                <p className="text-sm text-zinc-400 mb-0.5">計算結果</p>
                <p className="text-2xl font-extrabold">
                  {change.isSufficient
                    ? `應找零：${formatCurrency(change.changeAmount)}`
                    : `現金不足：尚缺 ${formatCurrency(change.shortageAmount)}`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 發票資訊 */}
        <div className="space-y-2.5 rounded-xl border border-zinc-800 bg-zinc-950/30 p-3.5">
          <div className="flex items-center justify-between">
            <label className="text-base font-semibold text-zinc-200">
              {isNegative ? '發票與折讓處理' : '發票資訊'}
            </label>
            <div className="flex gap-2">
              {(['none', 'carrier', 'tax_id'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setInvoiceType(t)}
                  className={`rounded-lg px-4 py-1.5 text-base font-medium transition-colors ${
                    invoiceType === t
                      ? 'bg-cyan-500 text-zinc-950 font-bold'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {t === 'none'
                    ? isNegative ? '開立折讓單 (免載具)' : '無發票 / 免開'
                    : t === 'carrier'
                    ? '手機載具'
                    : '統一編號'}
                </button>
              ))}
            </div>
          </div>
          {invoiceType === 'carrier' && (
            <Input
              className="mt-1 text-base py-2"
              placeholder="/ABC+123 (輸入手機載具條碼)"
              value={carrierCode}
              onChange={(e) => setCarrierCode(e.target.value)}
            />
          )}
          {invoiceType === 'tax_id' && (
            <div className="mt-1 grid grid-cols-2 gap-3">
              <Input
                className="text-base py-2"
                placeholder="統一編號 8 碼"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
              />
              <Input
                className="text-base py-2"
                placeholder="買受人抬頭"
                value={buyerTitle}
                onChange={(e) => setBuyerTitle(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* 彈窗按鈕 */}
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="ghost" size="lg" onClick={onClose} className="text-base">
            取消
          </Button>
          <Button
            variant={isNegative ? 'danger' : 'success'}
            size="lg"
            onClick={handleConfirmClick}
            disabled={!canConfirm || isSubmitting}
            className={`text-lg font-bold px-8 py-2.5 ${
              isNegative ? 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-500 shadow-md shadow-rose-950/50' : ''
            }`}
          >
            {isSubmitting
              ? '單據處理中…'
              : isNegative
              ? '↩️ 確認退款出單 (Enter)'
              : '★ 確認結帳出單 (Enter)'}
          </Button>
        </div>
      </div>

      {/* 可售庫存不足二次確認視窗 */}
      <Modal
        open={showOverStockConfirm}
        onClose={() => setShowOverStockConfirm(false)}
        title="可售庫存不足 - 出單確認"
        widthClassName="max-w-lg"
      >
        <div className="space-y-3 text-base">
          <p className="text-sm text-zinc-300">
            以下品項超過現貨或可售存量，出單後請盡速調撥或補貨：
          </p>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {overStockItemsList.map((item, i) => {
              const needTransfer = item.quantity > item.storeStock;
              const needRestock = item.quantity > item.available;

              return (
                <div
                  key={i}
                  onClick={() => item.productId && onViewProductDetail?.(item.productId)}
                  className={`rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm space-y-1.5 transition-colors ${
                    item.productId ? 'cursor-pointer hover:border-cyan-500/80 hover:bg-zinc-900/80 group' : ''
                  }`}
                  title={item.productId ? '點擊查看商品詳細資訊' : undefined}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-zinc-100 truncate flex-1 group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                      <span>{item.name}</span>
                      {item.productId && <span className="text-zinc-500 group-hover:text-cyan-400 text-xs">ℹ 詳情</span>}
                    </span>
                    <span className="font-mono text-xs text-cyan-300 font-bold bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded shrink-0">
                      結帳 {item.quantity} 台
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-xs font-mono text-zinc-300 pt-1 border-t border-zinc-800/50">
                    <div className="flex items-center gap-1.5">
                      <span>門市: {item.storeStock}</span>
                      {needTransfer ? (
                        <span className="text-amber-400 font-bold">（需調撥 {item.quantity - item.storeStock}）</span>
                      ) : (
                        <span className="text-emerald-400">（足夠）</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-right">
                      <span>總存: {item.totalStock} · 預訂: {item.preOrderReserved}</span>
                      {needRestock ? (
                        <span className="text-rose-400 font-bold">（須補貨 {item.quantity - item.available}）</span>
                      ) : (
                        <span className="text-emerald-400">（可售: {item.available}）</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800/60">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setShowOverStockConfirm(false)}
              className="text-base"
            >
              返回修改
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={proceedSubmit}
              disabled={isSubmitting}
              className="text-base font-bold px-5 bg-amber-500 hover:bg-amber-400 text-zinc-950"
            >
              確認出單 (後續調撥/補貨)
            </Button>
          </div>
        </div>
      </Modal>
    </Modal>
  );
}
