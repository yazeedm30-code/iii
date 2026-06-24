'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  ChefHat,
  Clock,
  PackageCheck,
  XCircle,
} from 'lucide-react';

import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { connectRealtime } from '@/lib/realtime';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  snapshot: { nameAr?: string; name?: string; modifiers?: Array<{ nameAr?: string }> };
  notes: string | null;
}

interface Branch {
  id: string;
  nameAr: string;
}

interface Order {
  id: string;
  number: string;
  status: 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'HANDED_OVER' | 'CANCELLED';
  fulfillment: 'DRIVE_THRU' | 'PICKUP' | 'DINE_IN' | 'DELIVERY';
  totalAmount: string;
  pickupCode: string | null;
  placedAt: string;
  customerArrivedAt: string | null;
  branch: Branch;
  vehicle: { color: string; plateNumber: string; make: string } | null;
  items: OrderItem[];
}

const COLUMNS: Array<{ status: Order['status']; label: string; color: string }> = [
  { status: 'PLACED', label: 'جديد', color: 'border-amber-400' },
  { status: 'ACCEPTED', label: 'مقبول', color: 'border-sky-400' },
  { status: 'PREPARING', label: 'قيد التحضير', color: 'border-orange-400' },
  { status: 'READY', label: 'جاهز', color: 'border-emerald-400' },
];

function nextStatus(s: Order['status']): Order['status'] | null {
  switch (s) {
    case 'PLACED':
      return 'ACCEPTED';
    case 'ACCEPTED':
      return 'PREPARING';
    case 'PREPARING':
      return 'READY';
    case 'READY':
      return 'HANDED_OVER';
    default:
      return null;
  }
}

function nextStatusLabel(s: Order['status']): string {
  switch (s) {
    case 'PLACED':
      return 'قبول';
    case 'ACCEPTED':
      return 'بدء التحضير';
    case 'PREPARING':
      return 'جاهز للاستلام';
    case 'READY':
      return 'تسليم';
    default:
      return '';
  }
}

function elapsedMinutes(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
}

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const token = useAuth((s) => s.accessToken);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const orders = useQuery({
    queryKey: ['merchant', 'orders'],
    queryFn: async () =>
      (await api.get('/merchant/orders', { params: { status: 'PLACED,ACCEPTED,PREPARING,READY' } }))
        .data.data as Order[],
    refetchInterval: 30_000,
  });

  // realtime: invalidate the list on any order:update event
  useEffect(() => {
    if (!token) return;
    const socket = connectRealtime(token);
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['merchant', 'orders', 'live'] });
    };
    socket.on('order:update', handler);
    socket.on('order:arrival', handler);
    return () => {
      socket.off('order:update', handler);
      socket.off('order:arrival', handler);
    };
  }, [token, queryClient]);

  const transition = useMutation({
    mutationFn: async ({ id, to }: { id: string; to: Order['status'] }) => {
      await api.patch(`/merchant/orders/${id}/status`, { toStatus: to });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'orders'] });
    },
  });

  const grouped = useMemo(() => {
    const map = new Map<Order['status'], Order[]>();
    for (const col of COLUMNS) map.set(col.status, []);
    (orders.data ?? []).forEach((o) => {
      const bucket = map.get(o.status);
      if (bucket) bucket.push(o);
    });
    return map;
  }, [orders.data, now]);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">طلبات لحظية</h1>
          <p className="text-slate-500 text-sm mt-1">يتم تحديث الشاشة لحظياً عبر WebSocket</p>
        </div>
        <span className="text-xs text-slate-500">
          الإجمالي: {(orders.data ?? []).length}
        </span>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const items = grouped.get(col.status) ?? [];
          return (
            <section key={col.status} className="space-y-3">
              <header
                className={`bg-white rounded-xl border-t-4 ${col.color} shadow-sm px-4 py-3 flex items-center justify-between`}
              >
                <span className="font-semibold">{col.label}</span>
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              </header>
              {items.map((order) => {
                const elapsed = elapsedMinutes(order.placedAt);
                const next = nextStatus(order.status);
                return (
                  <article key={order.id} className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
                    <header className="flex items-center justify-between">
                      <span className="font-mono text-sm">#{order.number}</span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock size={12} />
                        {elapsed} د
                      </span>
                    </header>
                    <p className="text-xs text-slate-500">{order.branch.nameAr}</p>
                    {order.fulfillment === 'DRIVE_THRU' && order.vehicle && (
                      <div className="text-xs bg-amber-50 border border-amber-200 rounded-lg p-2">
                        🚗 {order.vehicle.make} · {order.vehicle.color} · {order.vehicle.plateNumber}
                        {order.customerArrivedAt && (
                          <p className="text-emerald-700 mt-1">✓ العميل وصل</p>
                        )}
                      </div>
                    )}
                    {order.pickupCode && (
                      <p className="text-xs">
                        رمز الاستلام: <span className="font-mono font-bold">{order.pickupCode}</span>
                      </p>
                    )}
                    <ul className="text-sm divide-y divide-slate-100">
                      {order.items.map((item) => (
                        <li key={item.id} className="py-1.5 flex items-start justify-between gap-2">
                          <div>
                            <span className="font-medium">{item.snapshot.nameAr ?? item.snapshot.name}</span>
                            {item.snapshot.modifiers && item.snapshot.modifiers.length > 0 && (
                              <p className="text-xs text-slate-500">
                                {item.snapshot.modifiers.map((m) => m.nameAr).join(' · ')}
                              </p>
                            )}
                            {item.notes && (
                              <p className="text-xs text-amber-700">ملاحظة: {item.notes}</p>
                            )}
                          </div>
                          <span className="text-xs">×{item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="text-sm font-semibold">
                      الإجمالي: {Number(order.totalAmount).toFixed(2)} ر.س
                    </div>
                    <div className="flex gap-2 pt-2">
                      {next && (
                        <button
                          onClick={() => transition.mutate({ id: order.id, to: next })}
                          className="flex-1 bg-brand text-white rounded-xl py-2 text-sm flex items-center justify-center gap-1"
                        >
                          {order.status === 'READY' ? <PackageCheck size={14} /> :
                           order.status === 'PREPARING' ? <CheckCircle2 size={14} /> :
                           <ChefHat size={14} />}
                          {nextStatusLabel(order.status)}
                        </button>
                      )}
                      <button
                        onClick={() => transition.mutate({ id: order.id, to: 'CANCELLED' })}
                        className="bg-red-50 text-red-700 rounded-xl py-2 px-3 text-sm flex items-center gap-1"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  </article>
                );
              })}
              {items.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">لا يوجد طلبات</p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
