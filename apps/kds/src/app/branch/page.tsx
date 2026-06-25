'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Building2 } from 'lucide-react';

import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Branch {
  id: string;
  name: string;
  nameAr: string;
  code: string;
  city: { nameAr: string };
}

export default function BranchPickerPage() {
  const router = useRouter();
  const token = useAuth((s) => s.accessToken);
  const setBranch = useAuth((s) => s.setBranch);

  useEffect(() => {
    if (!token) router.replace('/login');
  }, [token, router]);

  const branches = useQuery({
    queryKey: ['kds', 'branches'],
    queryFn: async () => (await api.get('/merchant/branches')).data.data as Branch[],
    enabled: Boolean(token),
  });

  function pick(branch: Branch) {
    setBranch({ id: branch.id, nameAr: branch.nameAr });
    router.replace('/board');
  }

  if (!token) return null;

  return (
    <main className="min-h-screen p-10">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">اختر الفرع</h1>
        <p className="text-slate-400 mt-1">ستظهر فقط الطلبات الواردة على هذا الفرع</p>
      </header>

      {branches.isLoading && <p className="text-slate-400">جاري التحميل...</p>}
      {branches.error && (
        <p className="text-red-400">{(branches.error as Error).message}</p>
      )}
      {branches.data && branches.data.length === 0 && (
        <p className="text-slate-400">لا توجد فروع بعد. أضف فروعك من لوحة التاجر أولاً.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.data?.map((b) => (
          <button
            key={b.id}
            onClick={() => pick(b)}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl p-6 text-right transition group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500/15 text-orange-400 grid place-items-center">
                <Building2 size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{b.nameAr}</h3>
                <p className="text-xs text-slate-400">{b.city.nameAr} · {b.code}</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 group-hover:text-orange-400 transition">
              ابدأ الاستلام →
            </p>
          </button>
        ))}
      </div>
    </main>
  );
}
