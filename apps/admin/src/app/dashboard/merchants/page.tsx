'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Store } from 'lucide-react';

import { api } from '@/lib/api';

interface Merchant {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  vatNumber: string | null;
  createdAt: string;
}

export default function MerchantsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'merchants'],
    queryFn: async () => {
      const response = await api.get('/admin/merchants');
      return response.data.data as Merchant[];
    },
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">التجار</h1>
          <p className="text-slate-500 text-sm mt-1">إدارة الكوفيهات والمطاعم المسجلة في المنصة</p>
        </div>
        <Link
          href="/dashboard/merchants/new"
          className="bg-brand text-white px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus size={18} />
          إضافة تاجر جديد
        </Link>
      </header>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {isLoading && <p className="p-6 text-slate-500">جاري التحميل...</p>}
        {error && (
          <div className="p-6 text-red-600">
            تعذّر تحميل البيانات: {(error as Error).message}
            <button
              onClick={() => refetch()}
              className="mr-3 underline"
            >
              إعادة المحاولة
            </button>
          </div>
        )}
        {data && (
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-sm text-slate-600">
              <tr>
                <th className="px-6 py-3 font-medium">الاسم</th>
                <th className="px-6 py-3 font-medium">الرابط</th>
                <th className="px-6 py-3 font-medium">السجل الضريبي</th>
                <th className="px-6 py-3 font-medium">أُنشئ في</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    لا يوجد تجار بعد. أضف أول تاجر للمنصة.
                  </td>
                </tr>
              )}
              {data.map((m) => (
                <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand/10 grid place-items-center">
                      <Store size={16} />
                    </div>
                    <div>
                      <div className="font-medium">{m.nameAr}</div>
                      <div className="text-xs text-slate-500">{m.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm">{m.slug}</td>
                  <td className="px-6 py-3 text-sm">{m.vatNumber ?? '-'}</td>
                  <td className="px-6 py-3 text-sm text-slate-500">
                    {new Date(m.createdAt).toLocaleDateString('ar-SA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
