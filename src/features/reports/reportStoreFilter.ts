import type { StoreDto } from '@/types/system';

/** 日報表的門市篩選：某間門市，或所有門市總計。 */
export type ReportStoreFilter = { kind: 'store'; storeName: string } | { kind: 'all' };

export const ALL_STORES_REPORT: ReportStoreFilter = { kind: 'all' };
export const ALL_STORES_REPORT_LABEL = '所有門市總計';
export const ALL_STORES_REPORT_KEY = 'all';

export interface ReportStoreButton {
  key: string;
  label: string;
  filter: ReportStoreFilter;
}

/** 預設：目前登入門市；沒有登入門市（管理員）時是所有門市總計。 */
export function defaultReportStoreFilter(loginStoreName: string): ReportStoreFilter {
  const name = loginStoreName.trim();
  return name ? { kind: 'store', storeName: name } : ALL_STORES_REPORT;
}

export function reportStoreKey(filter: ReportStoreFilter): string {
  return filter.kind === 'all' ? ALL_STORES_REPORT_KEY : `store:${filter.storeName}`;
}

/**
 * 按鈕順序：目前登入門市、其他門市（依名稱）、最後是所有門市總計。
 * 已刪除的門市不在門市清單裡，不會有按鈕；它們的訂單只在所有門市總計出現。
 */
export function reportStoreButtons(stores: readonly StoreDto[], loginStoreName: string): ReportStoreButton[] {
  const login = loginStoreName.trim();
  const buttons: ReportStoreButton[] = [];
  if (login) buttons.push({ key: `store:${login}`, label: login, filter: { kind: 'store', storeName: login } });
  const others = [...new Set(stores.map((store) => store.name))]
    .filter((name) => name && name !== login)
    .sort((a, b) => a.localeCompare(b, 'zh-Hant'));
  for (const name of others) {
    buttons.push({ key: `store:${name}`, label: name, filter: { kind: 'store', storeName: name } });
  }
  buttons.push({ key: ALL_STORES_REPORT_KEY, label: ALL_STORES_REPORT_LABEL, filter: ALL_STORES_REPORT });
  return buttons;
}

/** 送給 GET /checkout/orders 的 storeName；所有門市總計不送。 */
export function reportStoreName(filter: ReportStoreFilter): string | undefined {
  return filter.kind === 'store' ? filter.storeName : undefined;
}
