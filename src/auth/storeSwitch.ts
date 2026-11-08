export function storeSwitchNotice(storeName: string): string {
  return `購物車的商品、數量、會員、運費與備註會保留。下一筆訂單會歸到「${storeName}」，庫存改扣該登入門市目前對應的庫存地點。`;
}
