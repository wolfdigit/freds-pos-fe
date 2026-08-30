import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type BadgeColor = 'emerald' | 'amber' | 'cyan' | 'rose' | 'zinc' | 'purple';

interface BadgeProps {
  color?: BadgeColor;
  children: ReactNode;
  className?: string;
}

const colorClasses: Record<BadgeColor, string> = {
  emerald: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  amber: 'bg-amber-950 text-amber-300 border-amber-800',
  cyan: 'bg-cyan-950 text-cyan-300 border-cyan-800',
  rose: 'bg-rose-950 text-rose-300 border-rose-800',
  zinc: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  purple: 'bg-purple-950 text-purple-300 border-purple-800',
};

export function Badge({ color = 'zinc', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium font-mono',
        colorClasses[color],
        className
      )}
    >
      {children}
    </span>
  );
}
