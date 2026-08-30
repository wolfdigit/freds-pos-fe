import { cn } from '@/utils/cn';

interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-zinc-700 border-t-cyan-400',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="載入中"
    />
  );
}
