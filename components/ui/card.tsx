import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export function Card({ children, className, glass = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/[0.06] p-5',
        glass
          ? 'bg-white/[0.04] backdrop-blur-md'
          : 'bg-dark-800/60',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-sm font-semibold text-slate-400 uppercase tracking-wider', className)} {...props}>
      {children}
    </h3>
  );
}
