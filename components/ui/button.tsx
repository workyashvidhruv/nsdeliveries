'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-[var(--radius-sm)] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    const variants = {
      primary: 'bg-white text-[#131316] hover:bg-[var(--primary-hover)] focus:ring-white',
      secondary: 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--card-hover)] border border-[var(--border)] focus:ring-[var(--border)]',
      ghost: 'text-[var(--secondary-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]',
      danger: 'bg-[var(--danger)] text-white hover:bg-red-600 focus:ring-[var(--danger)]',
    };

    const sizes = {
      sm: 'py-3 px-4 text-sm min-h-[2.5rem]',
      md: 'py-3.5 px-6 text-sm min-h-[2.75rem]',
      lg: 'py-3.5 px-6 text-base min-h-[3.25rem]',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
