export const dynamic = 'force-dynamic';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="w-full max-w-[var(--content-max)] mx-auto min-w-0">
        {children}
      </div>
    </div>
  );
}
