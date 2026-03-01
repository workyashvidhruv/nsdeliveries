'use client';

import { useState } from 'react';
import { MIN_PAYMENT_CENTS, MAX_PAYMENT_CENTS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

interface AmountSliderProps {
  value: number;
  onChange: (cents: number) => void;
}

export function AmountSlider({ value, onChange }: AmountSliderProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-baseline">
        <span className="text-3xl sm:text-4xl font-bold text-[var(--foreground)]">
          {formatCurrency(value)}
        </span>
        <span className="text-xs text-[var(--muted)]">
          min {formatCurrency(MIN_PAYMENT_CENTS)}
        </span>
      </div>

      <input
        type="range"
        min={MIN_PAYMENT_CENTS}
        max={MAX_PAYMENT_CENTS}
        step={50}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[var(--border)]
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
      />

      <p className="text-xs text-[var(--muted)] italic mb-2">
        Higher tips increase your chances of getting a faster delivery
      </p>
    </div>
  );
}
