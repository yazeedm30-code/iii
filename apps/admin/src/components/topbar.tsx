'use client';

import { Bell, Search } from 'lucide-react';

export function Topbar() {
  return (
    <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-4">
      <div className="relative flex-1 max-w-md">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full bg-slate-50 rounded-xl pr-9 pl-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-accent"
          placeholder="بحث..."
        />
      </div>
      <button className="relative p-2 rounded-lg hover:bg-slate-100" aria-label="إشعارات">
        <Bell size={18} />
        <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-red-500" />
      </button>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-brand text-white grid place-items-center text-xs">AD</div>
        <span className="text-sm">المسؤول</span>
      </div>
    </header>
  );
}
