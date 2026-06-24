'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Building2,
  LayoutDashboard,
  ListTree,
  LogOut,
  Package,
  ShoppingBag,
} from 'lucide-react';

import { useAuth } from '@/lib/auth';

const NAV = [
  { href: '/dashboard', label: 'نظرة عامة', icon: LayoutDashboard },
  { href: '/dashboard/orders', label: 'الطلبات', icon: ShoppingBag },
  { href: '/dashboard/branches', label: 'الفروع', icon: Building2 },
  { href: '/dashboard/categories', label: 'التصنيفات', icon: ListTree },
  { href: '/dashboard/products', label: 'المنتجات', icon: Package },
  { href: '/dashboard/reports', label: 'التقارير', icon: BarChart3 },
];

export function Sidebar({ merchantName }: { merchantName?: string }) {
  const pathname = usePathname();
  const clear = useAuth((s) => s.clear);

  return (
    <aside className="w-64 bg-slate-900 text-white p-6 hidden md:flex flex-col">
      <Link href="/dashboard" className="mb-8">
        <div className="text-xs text-slate-400 mb-1">لوحة التاجر</div>
        <div className="text-lg font-semibold">{merchantName ?? '...'}</div>
      </Link>
      <nav className="flex-1 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                active ? 'bg-white/15' : 'hover:bg-white/10'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <button
        onClick={() => {
          clear();
          window.location.href = '/login';
        }}
        className="mt-8 flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-white/10 text-white/80"
      >
        <LogOut size={18} />
        <span>تسجيل خروج</span>
      </button>
    </aside>
  );
}
