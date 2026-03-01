import { NavBar } from '@/components/nav-bar';

export const dynamic = 'force-dynamic';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      <main className="flex-1 w-full min-w-0 min-h-0 pt-[var(--main-pt)] pb-20 sm:pb-24 pl-[var(--page-padding-left)] pr-[var(--page-padding-right)] relative z-10 flex flex-col items-center justify-center box-border">
        {children}
      </main>
    </>
  );
}
