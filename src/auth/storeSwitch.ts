export function storeSwitchNotice(storeName: string): string {
  return `購物車的商品、數量、會員、運費與備註會保留。下一筆訂單會歸到「${storeName}」。庫存仍檢查並扣同一個門市現貨，不會因為換門市而改扣其他據點。`;
}
