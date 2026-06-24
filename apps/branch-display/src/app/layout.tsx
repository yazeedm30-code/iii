import './globals.css';
import { ReactNode } from 'react';

export const metadata = { title: 'شاشة عرض الفرع' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-black text-white min-h-screen">{children}</body>
    </html>
  );
}
