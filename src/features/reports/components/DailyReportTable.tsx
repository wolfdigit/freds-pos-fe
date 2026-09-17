import { useState } from 'react';
import type { CheckoutOrder } from '@/types/checkout';
import type { DailyReportSummary } from '@/types/report';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { formatCurrency } from '@/utils/currency';
import { formatDateTime } from '@/utils/date';
import { OrderDetailModal } from '@/features/checkout/components/OrderDetailModal';

interface DailyReportTableProps {
  orders: CheckoutOrder[];
  summary: DailyReportSummary;
  selectedDate: string;
  selectedPaymentMethod: string;
  availableDates: string[];
  onSelectDate: (date: string) => void;
}

export function DailyReportTable({
  orders,
  summary,
  selectedDate,
  selectedPaymentMethod,
  availableDates,
  onSelectDate,
}: DailyReportTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<CheckoutOrder | null>(null);

  const renderStatusBadge = (status: CheckoutOrder['status']) => {
    switch (status) {
      case 'refunded':
        return <Badge color="rose">已全額退款</Badge>;
      case 'partially_refunded':
        return <Badge color="amber">部分已退款</Badge>;
      case 'completed':
      default:
        return <Badge color="emerald">正常完成</Badge>;
    }
  };

  const renderPaymentBadges = (payments: CheckoutOrder['payments']) => {
    if (!payments || payments.length === 0) {
      return <Badge color="zinc">未標示</Badge>;
    }
    return (
      <div className="flex flex-wrap gap-1">
        {payments.map((p, idx) => {
          let badgeColor: 'emerald' | 'purple' | 'cyan' | 'amber' | 'zinc' = 'zinc';
          if (p.type === 'cash') badgeColor = 'emerald';
          else if (p.type.startsWith('bank_transfer')) badgeColor = 'purple';
          else if (p.type.startsWith('credit_card')) badgeColor = 'cyan';
          else if (p.type === 'line_pay') badgeColor = 'amber';

          return (
            <Badge key={idx} color={badgeColor} className="text-xs font-mono">
              <span>{p.name || p.type}</span>
              <span className="ml-1 font-bold">{formatCurrency(p.amount)}</span>
            </Badge>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/70 overflow-hidden shadow-xl backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 px-4 py-2.5 bg-zinc-950/40 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-zinc-100">📋 結帳與退換貨明細清單</span>
          <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs font-mono font-semibold text-cyan-300 border border-cyan-500/20">
            {orders.length} 筆紀錄
          </span>
        </div>
        <div className="text-xs text-zinc-400 font-mono">
          報表日期：<span className="text-zinc-200 font-semibold">{selectedDate}</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center px-4">
          <div className="text-3xl mb-2">📭</div>
          <h3 className="text-sm font-semibold text-zinc-300">
            在 {selectedDate} 查無符合條件的結帳紀錄
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            {selectedPaymentMethod !== 'all'
              ? '請嘗試切換至「全部付款方式」或選擇其他有營業資料的日期'
              : '該日期尚無任何銷售或退貨交易'}
          </p>

          {availableDates.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
              <span className="text-xs text-zinc-400">快速切換日期：</span>
              {availableDates.slice(0, 4).map((d) => (
                <button
                  key={d}
                  onClick={() => onSelectDate(d)}
                  className="rounded-md border border-zinc-700 bg-zinc-800/80 px-2 py-0.5 text-xs font-mono text-cyan-300 hover:border-cyan-500 hover:bg-cyan-950/40 transition-colors"
                >
                  📅 {d}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-auto min-h-0">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950 text-xs font-semibold uppercase text-zinc-400 shadow-sm">
              <tr>
                <th className="py-2.5 px-3">單號 / 狀態</th>
                <th className="py-2.5 px-3">時間 / 收銀員</th>
                <th className="py-2.5 px-3">顧客 / 會員</th>
                <th className="py-2.5 px-3">品項摘要</th>
                <th className="py-2.5 px-3">付款方式與金額</th>
                <th className="py-2.5 px-3 text-center">退貨件數</th>
                <th className="py-2.5 px-3 text-right">訂單總額</th>
                <th className="py-2.5 px-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {orders.map((order) => {
                const timeStr = formatDateTime(order.createdAt).split(' ')[1] || order.createdAt;
                const returnItems = order.items.filter((i) => i.quantity < 0);
                const returnQtyTotal = returnItems.reduce((s, i) => s + Math.abs(i.quantity), 0);
                const isReturnOrder = returnItems.length > 0;

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-zinc-800/40 transition-colors group"
                  >
                    {/* 單號與狀態 */}
                    <td className="py-3 px-3.5">
                      <div className="font-mono font-semibold text-zinc-200 flex items-center gap-1.5">
                        <span>{order.orderNumber}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        {renderStatusBadge(order.status)}
                        {isReturnOrder && (
                          <Badge color="rose">含退換貨</Badge>
                        )}
                      </div>
                    </td>

                    {/* 時間與收銀員 */}
                    <td className="py-3 px-3">
                      <div className="font-mono text-zinc-300">{timeStr}</div>
                      <div className="text-xs text-zinc-500">{order.cashierName}</div>
                    </td>

                    {/* 顧客 */}
                    <td className="py-3 px-3">
                      {order.customerId ? (
                        <div>
                          <span className="font-medium text-cyan-300 hover:underline">
                            {order.customerName}
                          </span>
                          {order.customerPhone && (
                            <div className="text-xs font-mono text-zinc-500">
                              {order.customerPhone}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-500">散客</span>
                      )}
                    </td>

                    {/* 品項摘要 */}
                    <td className="py-3 px-3 max-w-xs">
                      <div className="space-y-1">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-2 text-xs truncate"
                          >
                            <span
                              className={`truncate ${
                                item.quantity < 0 ? 'text-rose-300 font-medium' : 'text-zinc-300'
                              }`}
                              title={item.name}
                            >
                              {item.quantity < 0 && '🔄 [退貨] '}
                              {item.name}
                            </span>
                            <span
                              className={`font-mono shrink-0 ${
                                item.quantity < 0 ? 'text-rose-400 font-bold' : 'text-zinc-400'
                              }`}
                            >
                              x {item.quantity}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-[11px] text-zinc-500 italic">
                            ...等共 {order.items.length} 項品項
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 付款方式與金額 */}
                    <td className="py-3 px-3">
                      {renderPaymentBadges(order.payments)}
                    </td>

                    {/* 退貨件數 */}
                    <td className="py-3 px-3 text-center">
                      {returnQtyTotal > 0 ? (
                        <span className="inline-flex items-center justify-center rounded-full bg-rose-500/20 px-2 py-0.5 text-xs font-mono font-bold text-rose-300 border border-rose-500/30">
                          -{returnQtyTotal} 件
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-zinc-600">0</span>
                      )}
                    </td>

                    {/* 訂單總額 */}
                    <td className="py-3 px-3 text-right font-mono">
                      <div
                        className={`text-base font-bold ${
                          order.totalAmount < 0 ? 'text-rose-400' : 'text-zinc-100'
                        }`}
                      >
                        {formatCurrency(order.totalAmount)}
                      </div>
                      {order.discountAmount > 0 && (
                        <div className="text-xs text-amber-400 font-mono">
                          省 {formatCurrency(order.discountAmount)}
                        </div>
                      )}
                    </td>

                    {/* 操作按鈕 */}
                    <td className="py-3 px-3 text-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedOrder(order)}
                        className="text-xs px-2.5 py-1"
                      >
                        查看明細
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* 表格最末行總計 (Footer Summary Rows) */}
            <tfoot className="sticky bottom-0 z-10 border-t-2 border-zinc-700 bg-zinc-950 font-sans shadow-lg">
              {/* 1. 各付款方式獨立加總列 */}
              {summary.paymentStats.map((stat) => {
                let badgeColor: 'emerald' | 'purple' | 'cyan' | 'amber' | 'zinc' = 'zinc';
                if (stat.type === 'cash') badgeColor = 'emerald';
                else if (stat.type.startsWith('bank_transfer')) badgeColor = 'purple';
                else if (stat.type.startsWith('credit_card')) badgeColor = 'cyan';
                else if (stat.type === 'line_pay') badgeColor = 'amber';

                return (
                  <tr key={stat.type} className="border-b border-zinc-800/60 bg-zinc-900/60 hover:bg-zinc-900/90 transition-colors">
                    {/* 付款方式說明 (跨 4 欄) */}
                    <td colSpan={4} className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-200">
                          {stat.type === 'cash' ? '💵 現金支付加總' : `${stat.label} 付款加總`}
                        </span>
                        <span className="rounded bg-zinc-800/90 px-2 py-0.5 text-xs font-mono text-zinc-400 border border-zinc-700">
                          共 {stat.count} 筆交易
                        </span>
                        {stat.type === 'cash' && (summary.cashInflow > 0 || summary.cashOutflow > 0) && (
                          <span className="text-xs font-mono text-zinc-400">
                            (收現: <span className="text-emerald-400">+{formatCurrency(summary.cashInflow)}</span> / 退款: <span className="text-rose-400">-{formatCurrency(summary.cashOutflow)}</span>)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 付款方式標籤 */}
                    <td className="py-2.5 px-3">
                      <Badge color={badgeColor} className="text-xs font-semibold px-2 py-0.5">
                        {stat.label}
                      </Badge>
                    </td>

                    {/* 退貨標記欄位空白 */}
                    <td className="py-2.5 px-3 text-center text-xs font-mono text-zinc-600">
                      -
                    </td>

                    {/* 該付款方式金額加總 */}
                    <td className="py-2.5 px-3 text-right font-mono">
                      <div
                        className={`text-base font-extrabold ${
                          stat.type === 'cash'
                            ? 'text-emerald-300'
                            : stat.totalAmount < 0
                            ? 'text-rose-400'
                            : 'text-zinc-100'
                        }`}
                      >
                        {formatCurrency(stat.totalAmount)}
                      </div>
                    </td>

                    {/* 操作空白 */}
                    <td className="py-2.5 px-3 text-center text-xs text-zinc-600">
                      -
                    </td>
                  </tr>
                );
              })}

              {/* 2. 當日結算總計列 (Grand Total) */}
              <tr className="border-t border-zinc-700 bg-zinc-950 font-bold">
                {/* 總計標籤與訂單筆數說明 (跨 4 欄) */}
                <td colSpan={4} className="py-3 px-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-extrabold text-zinc-100 tracking-wide flex items-center gap-1.5">
                      <span className="text-lg">📊</span> 當日結算總計
                    </span>
                    <span className="rounded-lg bg-zinc-800 px-2.5 py-0.5 text-xs font-mono text-zinc-200 border border-zinc-700">
                      訂單共 <strong className="text-zinc-100">{summary.totalOrdersCount}</strong> 筆
                    </span>
                    <span className="rounded-lg bg-zinc-800 px-2.5 py-0.5 text-xs font-mono text-zinc-300 border border-zinc-700">
                      正數銷售: <strong className="text-zinc-100">{summary.totalSoldQuantity}</strong> 件
                    </span>
                  </div>
                </td>

                {/* 付款管道總覽 */}
                <td className="py-3 px-3">
                  <span className="text-xs font-mono text-zinc-400">
                    共 {summary.paymentStats.length} 種付款管道
                  </span>
                </td>

                {/* 當日退貨件數總計 */}
                <td className="py-3 px-3 text-center">
                  <div className="inline-flex items-center justify-center gap-1 rounded-lg border border-rose-500/40 bg-rose-950/40 px-2.5 py-0.5 text-xs font-mono font-extrabold text-rose-300">
                    <span>🔄 退貨:</span>
                    <span className="text-sm">{summary.totalReturnedQuantity > 0 ? `-${summary.totalReturnedQuantity} 件` : '0 件'}</span>
                  </div>
                </td>

                {/* 當日總營業額 (營收淨額) */}
                <td className="py-3 px-3 text-right">
                  <div className="text-xs text-zinc-400 font-normal">
                    總營業額 (實收淨額)
                  </div>
                  <div className="text-xl font-black font-mono text-cyan-300 mt-0.5">
                    {formatCurrency(summary.totalRevenue)}
                  </div>
                  {summary.totalDiscountAmount > 0 && (
                    <div className="text-xs font-mono text-amber-400 font-normal mt-0.5">
                      折讓: -{formatCurrency(summary.totalDiscountAmount)}
                    </div>
                  )}
                </td>

                {/* 操作空白欄 */}
                <td className="py-3 px-3 text-center text-xs text-zinc-600">
                  -
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* 原始單據明細彈窗 */}
      <OrderDetailModal
        open={selectedOrder !== null}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
