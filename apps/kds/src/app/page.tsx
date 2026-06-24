'use client';

import { useEffect, useState } from 'react';

interface OrderTicket {
  id: string;
  number: string;
  status: 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY';
  placedAt: string;
  items: { name: string; quantity: number; notes?: string }[];
}

const seedTickets: OrderTicket[] = [
  {
    id: '1',
    number: 'O-9F4-A1',
    status: 'PREPARING',
    placedAt: new Date(Date.now() - 90_000).toISOString(),
    items: [
      { name: 'لاتيه إسباني (كبير)', quantity: 1, notes: 'سكر قليل' },
      { name: 'كرواسون شوكولاتة', quantity: 2 },
    ],
  },
  {
    id: '2',
    number: 'O-9F4-B2',
    status: 'PLACED',
    placedAt: new Date(Date.now() - 30_000).toISOString(),
    items: [{ name: 'V60 إثيوبي', quantity: 1 }],
  },
];

function elapsed(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const min = Math.floor(seconds / 60);
  const rem = seconds % 60;
  return `${min}:${rem.toString().padStart(2, '0')}`;
}

const statusLabel: Record<OrderTicket['status'], string> = {
  PLACED: 'جديد',
  ACCEPTED: 'تم القبول',
  PREPARING: 'جاري التحضير',
  READY: 'جاهز',
};

const statusColor: Record<OrderTicket['status'], string> = {
  PLACED: 'bg-amber-500',
  ACCEPTED: 'bg-sky-500',
  PREPARING: 'bg-orange-500',
  READY: 'bg-emerald-500',
};

export default function KdsPage() {
  const [tickets, setTickets] = useState<OrderTicket[]>(seedTickets);
  const [, force] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => force((x) => x + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">شاشة المطبخ</h1>
          <p className="text-sm text-slate-400">فرع الرياض - طريق الملك فهد</p>
        </div>
        <div className="text-sm text-slate-400">
          عدد الطلبات الفعّالة: <span className="text-white font-semibold">{tickets.length}</span>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {tickets.map((ticket) => (
          <article key={ticket.id} className="bg-slate-900 rounded-2xl p-5 flex flex-col">
            <header className="flex items-center justify-between">
              <span className="text-lg font-semibold">{ticket.number}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${statusColor[ticket.status]}`}>
                {statusLabel[ticket.status]}
              </span>
            </header>
            <div className="mt-3 text-3xl font-mono">{elapsed(ticket.placedAt)}</div>
            <ul className="mt-4 space-y-2 flex-1">
              {ticket.items.map((item, i) => (
                <li key={i} className="flex justify-between border-b border-slate-800 pb-1">
                  <span>{item.name}</span>
                  <span className="text-slate-300">×{item.quantity}</span>
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={() =>
                  setTickets((all) =>
                    all.map((t) =>
                      t.id === ticket.id ? { ...t, status: nextStatus(t.status) } : t,
                    ),
                  )
                }
                className="bg-emerald-600 hover:bg-emerald-500 transition py-2 rounded-lg"
              >
                ترقية الحالة
              </button>
              <button
                onClick={() => setTickets((all) => all.filter((t) => t.id !== ticket.id))}
                className="bg-slate-800 hover:bg-slate-700 transition py-2 rounded-lg"
              >
                إخفاء
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function nextStatus(s: OrderTicket['status']): OrderTicket['status'] {
  return s === 'PLACED' ? 'ACCEPTED' : s === 'ACCEPTED' ? 'PREPARING' : 'READY';
}
