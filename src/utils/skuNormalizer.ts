/**
 * 將貨號轉為標準純字母數字大寫字串
 * 例如: " aa - 79121_b " -> "AA79121B"
 */
export function normalizeSku(input: string): string {
  if (!input) return '';
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * 模糊搜尋匹配函式：支援去 dash 貨號比對與條碼比對
 */
export function isSkuMatch(query: string, productSku: string, productBarcode?: string): boolean {
  const normalizedQuery = normalizeSku(query);
  const normalizedTarget = normalizeSku(productSku);

  if (!normalizedQuery) return true;

  if (normalizedTarget.includes(normalizedQuery)) return true;

  if (productBarcode && productBarcode.includes(query.trim())) return true;

  return false;
}
