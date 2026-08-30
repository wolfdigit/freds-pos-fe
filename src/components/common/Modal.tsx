import { useEffect, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  widthClassName?: string;
  zIndexClassName?: string;
}

export function Modal({ open, onClose, title, children, widthClassName = 'max-w-lg', zIndexClassName = 'z-50' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={cn('fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4', zIndexClassName)}>
      <div
        className={cn(
          'w-full max-h-[90vh] flex flex-col rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/50 overflow-hidden',
          widthClassName
        )}
      >
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-3.5 select-none shrink-0 bg-zinc-900/90">
          <h2 className="text-lg font-bold text-zinc-100">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 text-lg transition-colors"
            aria-label="關閉"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
