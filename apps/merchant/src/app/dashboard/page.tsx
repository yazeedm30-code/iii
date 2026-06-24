'use client';

import { useQuery } from '@tanstack/react-query';
import { Building2, ListTree, Package, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

import { api } from '@/lib/api';

interface MerchantMe {
  id: string;
  nameAr: string;
  counts: { branches: number; products: number; categories: number };
}

interface OrderRow {
  id: string;
  number: string;
  status: string;
  totalAmount: string;
  branch: { nameAr: string };
  placedAt: string;
}

const statusLabel: Record<string, string> = {
  PLACED: 'جديد',
  ACCEPTED: 'تم القبول',
  PREPARING: 'جاري التحضير',
  READY: 'جاهز',
};

export default function MerchantDashboard() {
  const me = useQuery({
    queryKey: ['merchant', 'me'],
    queryFn: async () => (await api.get('/merchant/me')).data.data as MerchantMe,
  });

  const orders = useQuery({
    queryKey: ['merchant', 'orders', 'live'],
    queryFn: async () =>
      (await api.get('/merchant/orders', { params: { status: 'PLACED,ACCEPTED,PREPARING,READY' } }))
        .data.data as OrderRow[],
    refetchInterval: 10_000,
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">نظرة عامة</h1>
        <p className="text-slate-500 text-sm mt-1">ملخّص أداء أعمالك في الوقت الحقيقي</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          label="الطلبات الفعّالة"
          value={orders.data?.length ?? 0}
          icon={<ShoppingBag size={18} />}
          href="/dashboard/orders"
        />
        <KpiCard
          label="عدد الفروع"
          value={me.data?.counts.branches ?? 0}
          icon={<Building2 size={18} />}
          href="/dashboard/branches"
        />
        <KpiCard
          label="عدد التصنيفات"
          value={me.data?.counts.categories ?? 0}
          icon={<ListTree size={18} />}
          href="/dashboard/categories"
        />
        <KpiCard
          label="عدد المنتجات"
          value={me.data?.counts.products ?? 0}
          icon={<Package size={18} />}
          href="/dashboard/products"
        />
      </div>

      <section className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">آخر الطلبات</h2>
          <Link href="/dashboard/orders" className="text-sm text-brand">
            عرض الكل
          </Link>
        </div>
        {orders.isLoading && <p className="text-slate-500">جاري التحميل...</p>}
        {orders.data && orders.data.length === 0 && (
          <p className="text-slate-500">لا توجد طلبات حالياً.</p>
        )}
        {orders.data && orders.data.length > 0 && (
          <table className="w-full text-right">
            <thead className="text-xs text-slate-500">
              <tr>
                <th className="py-2 font-medium">الطلب</th>
                <th className="py-2 font-medium">الفرع</th>
                <th className="py-2 font-medium">الحالة</th>
                <th className="py-2 font-medium">المبلغ</th>
                <th className="py-2 font-medium">الوقت</th>
              </tr>
            </thead>
            <tbody>
              {orders.data.slice(0, 8).map((o) => (
                <tr key={o.id} className="border-t border-slate-100">
                  <td className="py-3 font-mono text-sm">#{o.number}</td>
                  <td className="py-3 text-sm">{o.branch.nameAr}</td>
                  <td className="py-3 text-sm">
                    <span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand-dark text-xs">
                      {statusLabel[o.status] ?? o.status}
                    </span>
                  </td>
                  <td className="py-3 text-sm">{Number(o.totalAmount).toFixed(2)} ر.س</td>
                  <td className="py-3 text-sm text-slate-500">
                    {new Date(o.placedAt).toLocaleTimeString('ar-SA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  href,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition flex items-start gap-3"
    >
      <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand grid place-items-center">
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
      </div>
    </Link>
  );
}
