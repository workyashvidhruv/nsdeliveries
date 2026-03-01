import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="w-full flex flex-col items-center justify-center p-8 py-12 sm:py-16 relative z-10 overflow-x-hidden">
      <div className="text-center w-full max-w-[var(--content-max)] mx-auto flex flex-col items-center space-y-8">
        <div className="space-y-4 w-full flex flex-col items-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white text-center w-full mb-4">
            NS Deliveries
          </h1>
          <p className="text-[var(--secondary-foreground)] text-lg sm:text-xl leading-relaxed text-center w-full mb-2">
            Get food delivered by your neighbors, or earn by delivering for them.
          </p>
        </div>

        <div className="grid gap-5 pt-4 w-full max-w-md">
          <Link
            href="/request"
            className="flex items-center justify-center min-h-[3.25rem] py-3.5 px-6 rounded-[12px] bg-white text-[var(--primary-foreground)] font-semibold text-base hover:bg-[var(--primary-hover)] transition-colors duration-200 active:scale-[0.98]"
          >
            I need food
          </Link>

          <Link
            href="/deliver"
            className="flex items-center justify-center min-h-[3.25rem] py-3.5 px-6 rounded-[12px] border-2 border-[var(--border)] text-[var(--foreground)] font-medium text-base hover:bg-[var(--card)] hover:border-[var(--muted)] transition-colors duration-200 active:scale-[0.98]"
          >
            I&apos;ll deliver
          </Link>
        </div>

        <p className="text-sm text-[var(--muted)] pt-6 mb-2">
          By Network School residents, for Network School residents
        </p>
      </div>
    </main>
  );
}
