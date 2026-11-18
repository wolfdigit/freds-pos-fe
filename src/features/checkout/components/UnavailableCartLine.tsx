import type { ReactNode } from 'react';

interface UnavailableCartLineProps {
  /** 有值時這一行會被後端拒絕，標示紅色並提供移除按鈕。 */
  reason: string | null;
  onRemove: () => void;
  children: ReactNode;
}

export function UnavailableCartLine({ reason, onRemove, children }: UnavailableCartLineProps) {
  if (!reason) return <>{children}</>;
  return (
    <div
      role="alert"
      data-testid="unavailable-cart-line"
      className="rounded-lg border border-red-600 bg-red-950/40 ring-1 ring-red-600/60"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between gap-2 px-2 pt-1.5 text-sm font-bold text-red-300">
        <span>⛔ {reason}</span>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 rounded border border-red-500 bg-red-700 px-2 py-0.5 text-xs font-bold text-white hover:bg-red-600"
        >
          移除
        </button>
      </div>
      <div className="opacity-60">{children}</div>
    </div>
  );
}
