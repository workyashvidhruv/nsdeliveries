export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="w-full max-w-[var(--content-max-wide)] mx-auto min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}
