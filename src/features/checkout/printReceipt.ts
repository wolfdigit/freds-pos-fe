/**
 * 80mm 結帳明細的列印頁面尺寸。
 *
 * CSS 的 `size` 只能是具名尺寸，或一到兩個長度。只給一個長度會變成正方形，
 * `80mm auto` 不是合法語法，瀏覽器會整段忽略。短單與長單都改量實際版面高度，
 * 再寫成兩個長度（寬 80mm、高為內容）。紙捲能否使用這個尺寸、如何分頁與切紙，
 * 仍由瀏覽器與 Windows 驅動決定。
 */
export const RECEIPT_PAGE_WIDTH_MM = 80;
export const RECEIPT_CONTENT_WIDTH_MM = 72;
export const RECEIPT_PRINT_ROOT_ID = 'receipt-print-root';
export const RECEIPT_PRINT_SHEET_ID = 'receipt-print-sheet';

const PAGE_STYLE_ID = 'receipt-page-size';
const CSS_PX_PER_MM = 96 / 25.4;
const PAGE_HEIGHT_SAFETY_MM = 4;
const ESCAPE_GUARD_MS = 500;

let suppressEscapeUntil = 0;

export function armReceiptPrintEscapeGuard(): void {
  suppressEscapeUntil = Date.now() + ESCAPE_GUARD_MS;
}

export function isReceiptPrintEscapeSuppressed(): boolean {
  return Date.now() < suppressEscapeUntil;
}

export function applyReceiptPageSize(sheet: HTMLElement): void {
  const heightPx = sheet.scrollHeight;
  if (heightPx < 8) return;

  const heightMm = Math.round((heightPx / CSS_PX_PER_MM + PAGE_HEIGHT_SAFETY_MM) * 10) / 10;
  const style = ensurePageStyle();
  style.textContent =
    `@media print { @page { size: ${RECEIPT_PAGE_WIDTH_MM}mm ${heightMm}mm; margin: 0; } }`;
}

export function clearReceiptPageSize(): void {
  document.getElementById(PAGE_STYLE_ID)?.remove();
}

export function printReceiptSheet(): void {
  const sheet = document.getElementById(RECEIPT_PRINT_SHEET_ID);
  if (sheet instanceof HTMLElement) applyReceiptPageSize(sheet);
  armReceiptPrintEscapeGuard();
  window.print();
  armReceiptPrintEscapeGuard();
}

function ensurePageStyle(): HTMLStyleElement {
  const existing = document.getElementById(PAGE_STYLE_ID);
  if (existing instanceof HTMLStyleElement) return existing;
  const style = document.createElement('style');
  style.id = PAGE_STYLE_ID;
  document.head.appendChild(style);
  return style;
}
