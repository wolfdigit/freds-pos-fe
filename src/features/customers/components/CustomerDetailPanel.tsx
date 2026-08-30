import { useState } from 'react';
import type { Customer } from '@/types/customer';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { formatCurrency } from '@/utils/currency';
import { CustomerPreOrderTab } from './CustomerPreOrderTab';
import { CustomerHistoryTab } from './CustomerHistoryTab';
import { cn } from '@/utils/cn';

interface CustomerDetailPanelProps {
  customer: Customer;
  onEditClick: () => void;
}

type Tab = 'preorders' | 'history';

export function CustomerDetailPanel({ customer, onEditClick }: CustomerDetailPanelProps) {
  const [tab, setTab] = useState<Tab>('preorders');

  const getBadgeColor = (tier: string) => {
    if (tier === 'platinum') return 'purple';
    if (tier === 'gold') return 'amber';
    if (tier === 'silver') return 'cyan';
    return 'zinc';
  };

  return (
    <div className="flex-1 flex flex-col h-full pl-6 overflow-hidden">
      {/* 會員概況頂部卡片 */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg shadow-black/30 shrink-0">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-600 to-emerald-600 font-mono text-xl font-bold text-white shadow-md shadow-cyan-900/30">
              {customer.name.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-zinc-100">{customer.name}</h2>
                <Badge color={getBadgeColor(customer.vipTier)}>{customer.vipTierName}</Badge>
              </div>
              <p className="mt-1 font-mono text-sm text-zinc-400 flex items-center gap-3">
                <span className="flex items-center">
                  <span className="select-none mr-1 text-zinc-500">📞</span>
                  <span className="select-text">{customer.phone}</span>
                </span>
                {customer.email && (
                  <span className="flex items-center text-zinc-500">
                    <span className="select-none mr-1">✉️</span>
                    <span className="select-text text-zinc-400">{customer.email}</span>
                  </span>
                )}
                <span className="text-zinc-600 flex items-center">
                  <span className="select-none mr-1">· 加入時間：</span>
                  <span className="select-text">{customer.createdAt}</span>
                </span>
              </p>
            </div>
          </div>

          <Button size="sm" variant="secondary" onClick={onEditClick} className="px-3 py-1.5 text-xs font-semibold">
            ✏️ 編輯會員資料
          </Button>
        </div>

        {/* 核心數據統計條 */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/50 p-3">
            <p className="text-xs font-medium text-zinc-400 flex items-center">
              <span className="select-none mr-1">💰</span>
              <span>累計消費總額</span>
            </p>
            <p className="mt-1 font-mono text-xl font-bold text-cyan-300 select-text">
              {formatCurrency(customer.totalSpent)}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/50 p-3">
            <p className="text-xs font-medium text-zinc-400 flex items-center">
              <span className="select-none mr-1">🎁</span>
              <span>點數餘額</span>
            </p>
            <p className="mt-1 font-mono text-xl font-bold text-emerald-400 select-text">
              {customer.rewardPoints} <span className="text-xs font-normal text-zinc-400 select-none">pts</span>
            </p>
          </div>

          <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/50 p-3">
            <p className="text-xs font-medium text-zinc-400 flex items-center">
              <span className="select-none mr-1">💬</span>
              <span>偏好與備註</span>
            </p>
            <p className="mt-1 text-xs text-zinc-200 line-clamp-2 select-text">
              {customer.note || '暫無備註資訊'}
            </p>
          </div>
        </div>
      </div>

      {/* 雙分頁 Tab header */}
      <div className="mt-5 flex gap-2 border-b border-zinc-800/80 shrink-0">
        <button
          onClick={() => setTab('preorders')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all',
            tab === 'preorders'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          )}
        >
          <span>📦 未結預訂單</span>
        </button>

        <button
          onClick={() => setTab('history')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all',
            tab === 'history'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          )}
        >
          <span>🧾 歷史結帳紀錄</span>
        </button>
      </div>

      {/* 分頁內容展示區 */}
      <div className="mt-4 flex-1 overflow-y-auto pr-2 pb-6">
        {tab === 'preorders' ? (
          <CustomerPreOrderTab customer={customer} />
        ) : (
          <CustomerHistoryTab customerId={customer.id} />
        )}
      </div>
    </div>
  );
}
