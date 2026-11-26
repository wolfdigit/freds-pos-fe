import type { CheckoutOrder } from '@/types/checkout';

/**
 * 訂單的門市名稱：後端 branchId 是結帳當下的門市名稱（store_branch.name）。
 * 對得到現有門市才顯示；舊的 branch-store / branch-online 或已刪除門市留空（不退回 branchName / branchId）。
 */
export function orderStoreName(order: Pick<CheckoutOrder, 'branchId'>, storeNames: ReadonlySet<string>): string {
  const id = order.branchId?.trim() ?? '';
  return id && storeNames.has(id) ? id : '';
}
