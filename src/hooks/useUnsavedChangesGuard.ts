import { useEffect } from 'react';
import { setUnsavedChanges, UNSAVED_CHANGES_MESSAGE } from '@/utils/unsavedChanges';

/** dirty 時登記未存檔變更並在關閉 / 重新整理分頁前提示；元件卸載或存檔後自動解除。 */
export function useUnsavedChangesGuard(dirty: boolean, message: string = UNSAVED_CHANGES_MESSAGE): void {
  useEffect(() => {
    if (!dirty) return undefined;
    setUnsavedChanges(message);
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      setUnsavedChanges(null);
    };
  }, [dirty, message]);
}
