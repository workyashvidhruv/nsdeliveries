'use client';

import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-[var(--secondary-foreground)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-colors duration-200 min-h-[2.75rem]',
            error && 'border-[var(--danger)] focus:ring-[var(--danger)]',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
