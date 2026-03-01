'use client';

import { useRef, useState, KeyboardEvent } from 'react';
import { OTP_LENGTH } from '@/lib/constants';
import { Button } from '@/components/ui/button';

interface OtpInputProps {
  onSubmit: (code: string) => void;
  loading?: boolean;
  error?: string;
}

export function OtpInput({ onSubmit, loading, error }: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const code = digits.join('');
    if (code.length === OTP_LENGTH) {
      onSubmit(code);
    }
  };

  const isComplete = digits.every((d) => d !== '');

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--secondary-foreground)] text-center">
        Enter the code from the requester
      </p>
      <div className="flex justify-center gap-3 sm:gap-4">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-14 h-16 sm:w-16 sm:h-20 text-center text-2xl sm:text-3xl font-bold rounded-[var(--radius-sm)] bg-[var(--secondary)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-colors duration-200"
          />
        ))}
      </div>
      {error && <p className="text-sm text-[var(--danger)] text-center">{error}</p>}
      <Button
        onClick={handleSubmit}
        disabled={!isComplete}
        loading={loading}
        className="w-full"
        size="lg"
      >
        Verify Delivery
      </Button>
    </div>
  );
}
