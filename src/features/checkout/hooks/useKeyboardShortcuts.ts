import { useEffect } from 'react';

interface ShortcutHandlers {
  onFocusSearch: () => void;
  onOpenPreOrderDrawer: () => void;
  onOpenPayment: () => void;
  onEscape: () => void;
}

export function useKeyboardShortcuts({ onFocusSearch, onOpenPreOrderDrawer, onOpenPayment, onEscape }: ShortcutHandlers) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (e.key === 'F2' || (e.key === '/' && !isTyping)) {
        e.preventDefault();
        onFocusSearch();
      } else if (e.key === 'F4') {
        e.preventDefault();
        onOpenPreOrderDrawer();
      } else if (e.key === 'F9' || (e.key === ' ' && !isTyping)) {
        e.preventDefault();
        onOpenPayment();
      } else if (e.key === 'Escape') {
        onEscape();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onFocusSearch, onOpenPreOrderDrawer, onOpenPayment, onEscape]);
}
