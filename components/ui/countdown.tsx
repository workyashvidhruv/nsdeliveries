'use client';

import { useEffect, useState } from 'react';
import { getTimeRemaining } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CountdownProps {
  deadline: string;
  onExpire?: () => void;
  className?: string;
}

export function Countdown({ deadline, onExpire, className }: CountdownProps) {
  const [time, setTime] = useState(getTimeRemaining(new Date(deadline)));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(new Date(deadline));
      setTime(remaining);
      if (remaining.expired) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline, onExpire]);

  const isUrgent = time.minutes < 2 && !time.expired;

  return (
    <div className={cn('font-mono text-2xl font-bold tabular-nums', className)}>
      <span className={cn(
        time.expired ? 'text-[var(--danger)]' : isUrgent ? 'text-[var(--warning)] animate-pulse' : 'text-[var(--foreground)]'
      )}>
        {time.expired ? 'EXPIRED' : `${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`}
      </span>
    </div>
  );
}
