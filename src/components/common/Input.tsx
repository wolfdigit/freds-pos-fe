import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  monospace?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, monospace, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder:text-zinc-500',
        'focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400',
        monospace && 'font-mono tracking-wide',
        className
      )}
      {...rest}
    />
  );
});
