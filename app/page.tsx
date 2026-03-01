import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-[100dvh] w-full flex flex-col items-center justify-center pl-[var(--page-padding-left)] pr-[var(--page-padding-right)] py-12 relative z-10 overflow-x-hidden">
      <div className="text-center w-full max-w-md space-y-14 mx-auto flex flex-col items-center">
        <div className="space-y-6 w-full flex flex-col items-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white text-center w-full">
            NS Deliveries
          </h1>
          <p className="text-[var(--secondary-foreground)] text-lg sm:text-xl leading-relaxed text-center w-full">
            Get food delivered by your neighbors, or earn by delivering for them.
          </p>
        </div>

        <div className="grid gap-5 pt-4 w-full">
          <Link
            href="/request"
            className="flex items-center justify-center min-h-[3.25rem] px-8 py-4 rounded-[var(--radius)] bg-white text-[var(--primary-foreground)] font-semibold text-base hover:bg-[var(--primary-hover)] transition-colors duration-200 active:scale-[0.98]"
          >
            I need food
          </Link>

          <Link
            href="/deliver"
            className="flex items-center justify-center min-h-[3.25rem] px-8 py-4 rounded-[var(--radius)] border-2 border-[var(--border)] text-[var(--foreground)] font-medium text-base hover:bg-[var(--card)] hover:border-[var(--muted)] transition-colors duration-200 active:scale-[0.98]"
          >
            I&apos;ll deliver
          </Link>
        </div>

        <p className="text-sm text-[var(--muted)] pt-6">
          By Network School residents, for Network School residents
        </p>
      </div>
    </main>
  );
}
