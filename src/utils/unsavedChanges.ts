/**
 * 頁面上尚未存檔的變更（例如門市商品清單的勾選）。
 * 切換主分頁、設定分頁或瀏覽器返回時先詢問；關閉 / 重新整理分頁時由 beforeunload 提示。
 */
export const UNSAVED_CHANGES_MESSAGE = '有尚未存檔的變更，確定要離開並放棄這些變更嗎？';

let unsavedMessage: string | null = null;

export function setUnsavedChanges(message: string | null): void {
  unsavedMessage = message;
}

export function hasUnsavedChanges(): boolean {
  return unsavedMessage !== null;
}

/** 沒有未存檔變更時直接回 true；有的話跳確認框，使用者同意放棄才回 true（並清掉標記）。 */
export function confirmDiscardUnsavedChanges(): boolean {
  if (unsavedMessage === null) return true;
  const ok = typeof window === 'undefined' ? true : window.confirm(unsavedMessage);
  if (ok) unsavedMessage = null;
  return ok;
}
