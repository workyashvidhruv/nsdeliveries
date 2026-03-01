'use client';

import { cn } from '@/lib/utils';
import { FOOD_TYPES, FOOD_TYPE_LABELS, FOOD_TYPE_EMOJI, type FoodType } from '@/lib/constants';

interface FoodTypeSelectorProps {
  value: FoodType | null;
  onChange: (type: FoodType) => void;
}

export function FoodTypeSelector({ value, onChange }: FoodTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {FOOD_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={cn(
            'flex flex-col items-center gap-3 p-6 rounded-[12px] border-2 transition-colors duration-200 min-h-[5rem]',
            value === type
              ? 'border-white bg-white/5'
              : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--muted)]'
          )}
        >
          <span className="text-3xl sm:text-4xl">{FOOD_TYPE_EMOJI[type]}</span>
          <span className={cn(
            'text-sm font-medium',
            value === type ? 'text-white' : 'text-[var(--secondary-foreground)]'
          )}>
            {FOOD_TYPE_LABELS[type]}
          </span>
        </button>
      ))}
    </div>
  );
}
