import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export function Badge({ children, variant = 'neutral', className, ...props }: BadgeProps) {
  const variants = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger:  'bg-red-500/10 text-red-400 border-red-500/20',
    info:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
    neutral: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
