import './globals.css';
import { ReactNode } from 'react';

export const metadata = { title: 'لوحة تحكم التاجر' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-50 text-slate-900 min-h-screen">{children}</body>
    </html>
  );
}
