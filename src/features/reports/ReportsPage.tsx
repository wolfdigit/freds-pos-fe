import { useDailyReport } from './hooks/useDailyReport';
import { DailyReportTable } from './components/DailyReportTable';
import { PAYMENT_METHOD_OPTIONS } from '@/types/report';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/feedback/Spinner';
import { formatDate, nowIso } from '@/utils/date';

export function ReportsPage() {
  const {
    selectedDate,
    setSelectedDate,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    summary,
    isLoading,
    reload,
    setQuickDate,
    availableDatesWithOrders,
  } = useDailyReport();

  const isToday = selectedDate === formatDate(nowIso());

  return (
    <div className="flex h-full flex-col space-y-3.5 min-h-0">
      {/* 頂部功能列與重新整理按鈕 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
              <span>📊</span> 營運日報表
            </h1>
            <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-300 border border-cyan-500/20">
              結帳紀錄與收支加總
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            結帳日報表、各付款管道營收明細、現金流水加總與退貨件數彙整
          </p>
        </div>

        {/* 重新整理按鈕 */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={reload}
            disabled={isLoading}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5"
            title="重新整理訂單數據"
          >
            <span>🔄</span>
            <span>重新整理</span>
          </Button>
        </div>
      </div>

      {/* 篩選控制器：日期選擇與付款方式篩選 (緊湊設計) */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 shadow-md backdrop-blur-sm space-y-2.5 shrink-0">
        {/* 日期篩選列 */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/60 pb-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
              <span>📅</span> 結算日期：
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs font-mono text-zinc-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <div className="flex items-center gap-1">
              <button
                onClick={() => setQuickDate('today')}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  isToday
                    ? 'bg-cyan-500 text-zinc-950 font-bold'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                今天
              </button>
              <button
                onClick={() => setQuickDate('yesterday')}
                className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                昨天
              </button>
              <button
                onClick={() => setQuickDate('beforeYesterday')}
                className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                前天
              </button>
            </div>
          </div>

          {/* 示範資料快捷日期 */}
          {availableDatesWithOrders.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="text-[11px]">有紀錄：</span>
              <div className="flex flex-wrap gap-1">
                {availableDatesWithOrders.slice(0, 3).map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDate(d)}
                    className={`rounded px-1.5 py-0.5 font-mono text-[11px] transition-colors ${
                      selectedDate === d
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                        : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 付款方式篩選列 */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400 shrink-0 flex items-center gap-1">
            <span>💳</span> 付款篩選：
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PAYMENT_METHOD_OPTIONS.map((option) => {
              const isSelected = selectedPaymentMethod === option.type;
              return (
                <button
                  key={option.type}
                  onClick={() => setSelectedPaymentMethod(option.type)}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 shadow-sm font-semibold'
                      : 'bg-zinc-950/80 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 載入中狀態 */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
          <Spinner size="lg" />
          <p className="mt-3 text-xs font-medium">載入結帳數據與日報表中...</p>
        </div>
      ) : (
        /* 結帳明細表格與最末行總計 */
        <div className="flex-1 min-h-0 flex flex-col">
          <DailyReportTable
            orders={summary.orders}
            summary={summary}
            selectedDate={selectedDate}
            selectedPaymentMethod={selectedPaymentMethod}
            availableDates={availableDatesWithOrders}
            onSelectDate={setSelectedDate}
          />
        </div>
      )}
    </div>
  );
}
