import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'شاشة المطبخ — KDS',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-950 text-white font-sans min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
