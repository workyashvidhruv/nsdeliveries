'use client';

interface OtpDisplayProps {
  code: string;
}

export function OtpDisplay({ code }: OtpDisplayProps) {
  return (
    <div className="text-center space-y-6">
      <p className="text-sm text-[var(--secondary-foreground)]">
        Show this code to your deliverer
      </p>
      <div className="flex justify-center gap-3 sm:gap-4">
        {code.split('').map((digit, i) => (
          <div
            key={i}
            className="w-14 h-20 sm:w-16 sm:h-20 flex items-center justify-center rounded-[var(--radius-sm)] bg-white/5 border-2 border-white/20 text-3xl sm:text-4xl font-bold text-white"
          >
            {digit}
          </div>
        ))}
      </div>
      <p className="text-xs text-[var(--muted)]">
        Do not share this code until your food arrives
      </p>
    </div>
  );
}
