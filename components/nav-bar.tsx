'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function NavBar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/request', label: 'Request' },
    { href: '/deliver', label: 'Deliver' },
    { href: '/profile', label: 'Profile' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--border)] pt-[env(safe-area-inset-top,0)]">
      <div className="min-h-[var(--nav-height)] w-full max-w-[1200px] mx-auto px-8 py-4 flex items-center justify-between gap-4 min-w-0 box-border">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-[var(--foreground)] shrink-0 min-w-0 truncate hover:opacity-90 transition-opacity"
        >
          NS Deliveries
        </Link>
        <div className="flex items-center gap-6 flex-wrap justify-end">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'py-3.5 px-6 rounded-[var(--radius)] text-sm font-medium transition-colors duration-200 min-w-[2.5rem] text-center',
                pathname === link.href
                  ? 'text-[var(--foreground)] bg-[var(--card)]'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)]'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
