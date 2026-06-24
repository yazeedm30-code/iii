'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { Sidebar } from '@/components/sidebar';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface MerchantMe {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  counts: { branches: number; products: number; categories: number };
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const token = useAuth((s) => s.accessToken);

  useEffect(() => {
    if (!token) router.replace('/login');
  }, [router, token]);

  const me = useQuery({
    queryKey: ['merchant', 'me'],
    queryFn: async () => {
      const response = await api.get('/merchant/me');
      return response.data.data as MerchantMe;
    },
    enabled: Boolean(token),
  });

  if (!token) return null;

  return (
    <div className="min-h-screen flex">
      <Sidebar merchantName={me.data?.nameAr} />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">{me.data?.nameAr ?? 'لوحة التاجر'}</h1>
            {me.data && (
              <p className="text-xs text-slate-500">
                {me.data.counts.branches} فروع · {me.data.counts.categories} تصنيف ·
                {' '}{me.data.counts.products} منتج
              </p>
            )}
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
