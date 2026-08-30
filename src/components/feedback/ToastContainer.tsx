import { useToastStore, type ToastVariant } from './toastStore';
import { cn } from '@/utils/cn';

const variantClasses: Record<ToastVariant, string> = {
  success: 'border-emerald-700 bg-emerald-950 text-emerald-200',
  error: 'border-rose-700 bg-rose-950 text-rose-200',
  warning: 'border-amber-700 bg-amber-950 text-amber-200',
  info: 'border-cyan-700 bg-cyan-950 text-cyan-200',
};

export function ToastContainer() {
  const { toasts, dismissToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => dismissToast(toast.id)}
          className={cn(
            'cursor-pointer rounded-lg border px-4 py-3 text-sm shadow-lg',
            variantClasses[toast.variant]
          )}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
