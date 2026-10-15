import type { Metadata, Viewport } from 'next';
import BottomNav from '@/components/BottomNav';
import AppStartup from '@/components/AppStartup';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Православље', template: '%s · Православље' },
  description: 'Православна вера: календар, Свето писмо, Свети оци, храмови и манастири.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#14213d',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr-Cyrl">
      <body>
        <main data-pagefind-body>{children}</main>
        <BottomNav />
        <AppStartup />
      </body>
    </html>
  );
}
