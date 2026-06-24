'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { useAuth } from '@/lib/auth';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const token = useAuth((s) => s.accessToken);

  useEffect(() => {
    if (!token) router.replace('/login');
  }, [router, token]);

  if (!token) return null;

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
