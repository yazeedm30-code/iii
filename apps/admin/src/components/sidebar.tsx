'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Building2,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Users,
} from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'نظرة عامة', icon: LayoutDashboard },
  { href: '/dashboard/orders', label: 'الطلبات', icon: ShoppingBag },
  { href: '/dashboard/branches', label: 'الفروع', icon: Building2 },
  { href: '/dashboard/products', label: 'المنتجات', icon: Package },
  { href: '/dashboard/coupons', label: 'العروض والكوبونات', icon: Tag },
  { href: '/dashboard/customers', label: 'العملاء', icon: Users },
  { href: '/dashboard/reports', label: 'التقارير', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-brand text-white p-6 hidden md:flex flex-col">
      <Link href="/dashboard" className="text-lg font-semibold mb-8">
        لوحة التحكم
      </Link>
      <nav className="flex-1 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
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
      <p className="text-xs text-white/40 mt-8">v0.1.0</p>
    </aside>
  );
}
