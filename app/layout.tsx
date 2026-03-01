import type { Metadata, Viewport } from 'next';
import { Web3Provider } from '@/components/web3-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'NS Community Deliveries',
  description: 'Peer-to-peer food delivery for Network School',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen min-h-[100dvh] w-full flex flex-col antialiased relative">
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
