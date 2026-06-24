import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'لوحة تحكم التاجر',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-brand-muted text-slate-900 font-sans antialiased min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
