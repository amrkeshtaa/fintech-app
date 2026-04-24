'use client';

import { Wifi, MoreHorizontal } from 'lucide-react';
import type { VirtualCard } from '@/lib/types';
import { maskCardNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface VirtualCardDisplayProps {
  card: VirtualCard;
  flipped?: boolean;
  compact?: boolean;
}

export function VirtualCardDisplay({ card, flipped = false, compact = false }: VirtualCardDisplayProps) {
  const isFrozen = card.status === 'frozen';

  return (
    <div
      className={cn(
        'relative rounded-2xl overflow-hidden card-shine select-none',
        compact ? 'w-full max-w-[280px] h-[160px]' : 'w-full max-w-[360px] h-[210px]',
        isFrozen && 'opacity-60 grayscale',
      )}
      style={{
        background: card.network === 'visa'
          ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)'
          : 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      }}
    >
      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute -right-4 top-12 w-20 h-20 rounded-full bg-white/5" />

      {isFrozen && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20">
          <div className="text-center">
            <span className="text-3xl">❄️</span>
            <p className="text-white font-semibold text-sm mt-1">Card Frozen</p>
          </div>
        </div>
      )}

      <div className={cn('absolute inset-0 flex flex-col justify-between z-10', compact ? 'p-4' : 'p-6')}>
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/70 text-xs font-medium">PayNow</p>
            {!compact && (
              <p className="text-white/50 text-xs mt-0.5">Virtual Card</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Wifi className={cn('text-white/60 rotate-90', compact ? 'w-4 h-4' : 'w-5 h-5')} />
          </div>
        </div>

        {/* Chip */}
        {!compact && (
          <div className="w-10 h-8 bg-gradient-to-br from-amber-300 to-amber-500 rounded-md opacity-90" />
        )}

        {/* Bottom row */}
        <div>
          <p className={cn('text-white/70 font-mono', compact ? 'text-xs mb-1' : 'text-sm mb-2')}>
            {maskCardNumber(card.last4)}
          </p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider">Card Holder</p>
              <p className={cn('text-white font-semibold uppercase tracking-wider', compact ? 'text-xs' : 'text-sm')}>
                {card.cardholderName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/50 text-xs uppercase tracking-wider">Expires</p>
              <p className={cn('text-white font-semibold', compact ? 'text-xs' : 'text-sm')}>
                {card.expiryMonth}/{card.expiryYear}
              </p>
            </div>
            <div>
              {card.network === 'visa' ? (
                <span className="text-white font-extrabold italic text-lg tracking-tight">VISA</span>
              ) : (
                <div className="flex">
                  <div className="w-7 h-7 rounded-full bg-red-500 opacity-90" />
                  <div className="w-7 h-7 rounded-full bg-amber-400 opacity-90 -ml-3" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
