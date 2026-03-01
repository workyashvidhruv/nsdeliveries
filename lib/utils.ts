import { OTP_LENGTH, COMMISSION_RATE } from './constants';

export function generateOtp(): string {
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export function calculateCommission(grossCents: number): { commission: number; netPayout: number } {
  const commission = Math.round(grossCents * COMMISSION_RATE);
  const netPayout = grossCents - commission;
  return { commission, netPayout };
}

export function getDeadlineFromNow(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function getTimeRemaining(deadline: Date): { minutes: number; seconds: number; expired: boolean } {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return { minutes: 0, seconds: 0, expired: true };
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { minutes, seconds, expired: false };
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
