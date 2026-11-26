import { useMemo } from 'react';
import { useDailyReport } from './hooks/useDailyReport';
import { DailyReportTable } from './components/DailyReportTable';
import { PAYMENT_METHOD_OPTIONS } from '@/types/report';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/feedback/Spinner';
import { formatDate, nowIso } from '@/utils/date';
import { StoreFilterTabs } from '@/components/common/StoreFilterTabs';
import { useStoreChoices } from '@/hooks/useStoreChoices';
import { reportStoreButtons, reportStoreKey } from './reportStoreFilter';

export function ReportsPage() {
  const {
    storeFilter,
    setStoreFilter,
    loginStoreName,
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
  const { stores } = useStoreChoices();
  const storeNames = useMemo(() => new Set(stores.map((store) => store.name)), [stores]);
  const storeButtons = useMemo(() => reportStoreButtons(stores, loginStoreName), [stores, loginStoreName]);
  const allStores = storeFilter.kind === 'all';

  return (
    <div className="flex h-full flex-col space-y-3.5 min-h-0">
      {/* 頂部功能列與重新整理按鈕 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
              營運日報表
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
            loading={isLoading}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5"
            title="重新整理訂單數據"
          >
            <span>{isLoading ? '重新整理中...' : '重新整理'}</span>
          </Button>
        </div>
      </div>

      {/* 篩選控制器：門市、日期與付款方式（按鈕較大，最小高度 40px；門市、付款列在窄螢幕橫向捲動） */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 shadow-md backdrop-blur-sm space-y-3 shrink-0">
        {/* 門市篩選列：登入門市、其他門市、所有門市總計（門市多時橫向捲動） */}
        <div className="border-b border-zinc-800/60 pb-2">
          <StoreFilterTabs
            testId="report-store-tabs"
            size="lg"
            tabs={storeButtons}
            activeKey={reportStoreKey(storeFilter)}
            onSelect={(key) => {
              const button = storeButtons.find((row) => row.key === key);
              if (button) setStoreFilter(button.filter);
            }}
          />
        </div>

        {/* 日期篩選列 */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/60 pb-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-sm font-semibold text-zinc-300 flex items-center gap-1 whitespace-nowrap">
結算日期：
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="min-h-10 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-base font-mono text-zinc-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setQuickDate('today')}
                className={`min-h-10 rounded-lg px-4 py-2 text-base font-medium transition-colors ${
                  isToday
                    ? 'bg-cyan-500 text-zinc-950 font-bold'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                今天
              </button>
              <button
                onClick={() => setQuickDate('yesterday')}
                className="min-h-10 rounded-lg bg-zinc-800 px-4 py-2 text-base font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                昨天
              </button>
              <button
                onClick={() => setQuickDate('beforeYesterday')}
                className="min-h-10 rounded-lg bg-zinc-800 px-4 py-2 text-base font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                前天
              </button>
            </div>
          </div>

          {/* 示範資料快捷日期 */}
          {availableDatesWithOrders.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-zinc-400 min-w-0">
              <span className="whitespace-nowrap shrink-0">有紀錄：</span>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                {availableDatesWithOrders.slice(0, 3).map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDate(d)}
                    className={`min-h-10 shrink-0 whitespace-nowrap rounded-lg px-3 py-2 font-mono text-sm transition-colors ${
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
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" data-testid="report-payment-tabs">
          <span className="text-sm font-semibold text-zinc-400 shrink-0 whitespace-nowrap flex items-center gap-1">
付款篩選：
          </span>
          <div className="flex gap-1.5">
            {PAYMENT_METHOD_OPTIONS.map((option) => {
              const isSelected = selectedPaymentMethod === option.type;
              return (
                <button
                  key={option.type}
                  onClick={() => setSelectedPaymentMethod(option.type)}
                  className={`flex min-h-10 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-4 py-2 text-base font-medium transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 shadow-sm font-semibold'
                      : 'bg-zinc-950/80 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
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
            showStoreColumn={allStores}
            storeNames={storeNames}
          />
        </div>
      )}
    </div>
  );
}
