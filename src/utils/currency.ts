/**
 * 格式化為新台幣整數顯示，例如: NT$ 7,200
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return 'NT$ 0';
  return `NT$ ${Math.round(amount).toLocaleString('zh-TW')}`;
}

/**
 * 安全金額累加，防止浮點數誤差
 */
export function safeAdd(...numbers: number[]): number {
  return Math.round(numbers.reduce((acc, cur) => acc + (cur || 0), 0));
}

/**
 * 計算找零金額 (實收 - 應付)
 */
export function calculateChange(
  tendered: number,
  totalDue: number
): {
  isSufficient: boolean;
  changeAmount: number;
  shortageAmount: number;
} {
  const diff = Math.round(tendered - totalDue);
  return {
    isSufficient: diff >= 0,
    changeAmount: Math.max(0, diff),
    shortageAmount: Math.max(0, -diff),
  };
}
