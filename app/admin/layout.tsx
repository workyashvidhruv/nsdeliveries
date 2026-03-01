export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col p-8">
      <div className="w-full max-w-[var(--content-max-wide)] mx-auto min-w-0 flex-1 mt-8">
        {children}
      </div>
    </div>
  );
}
