'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlarmClock,
  Car,
  CheckCircle2,
  ChefHat,
  LogOut,
  PackageCheck,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';

import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { connectRealtime } from '@/lib/realtime';
import { playArrivalChime, playNewOrderChime, primeAudio } from '@/lib/audio';

type OrderStatus = 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'HANDED_OVER' | 'CANCELLED';

interface OrderItem {
  id: string;
  quantity: number;
  notes: string | null;
  snapshot: {
    nameAr?: string;
    name?: string;
    modifiers?: Array<{ nameAr?: string; name?: string }>;
  };
}

interface Vehicle {
  make: string;
  color: string;
  plateNumber: string;
}

interface Order {
  id: string;
  number: string;
  status: OrderStatus;
  fulfillment: 'DRIVE_THRU' | 'PICKUP' | 'DINE_IN' | 'DELIVERY';
  pickupCode: string | null;
  totalAmount: string;
  placedAt: string;
  customerArrivedAt: string | null;
  branch: { id: string; nameAr: string };
  vehicle: Vehicle | null;
  items: OrderItem[];
}

const COLUMNS: Array<{ status: OrderStatus; label: string; accent: string; bar: string }> = [
  { status: 'PLACED', label: 'جديد', accent: 'bg-amber-500/15 text-amber-300', bar: 'bg-amber-500' },
  { status: 'ACCEPTED', label: 'مقبول', accent: 'bg-sky-500/15 text-sky-300', bar: 'bg-sky-500' },
  { status: 'PREPARING', label: 'قيد التحضير', accent: 'bg-orange-500/15 text-orange-300', bar: 'bg-orange-500' },
  { status: 'READY', label: 'جاهز', accent: 'bg-emerald-500/15 text-emerald-300', bar: 'bg-emerald-500' },
];

const NEXT_STATUS: Record<OrderStatus, { to: OrderStatus; label: string; Icon: typeof ChefHat } | null> = {
  PLACED: { to: 'ACCEPTED', label: 'قبول', Icon: CheckCircle2 },
  ACCEPTED: { to: 'PREPARING', label: 'بدء التحضير', Icon: ChefHat },
  PREPARING: { to: 'READY', label: 'جاهز', Icon: PackageCheck },
  READY: { to: 'HANDED_OVER', label: 'تسليم', Icon: PackageCheck },
  HANDED_OVER: null,
  CANCELLED: null,
};

const SLA_MIN_BY_STATUS: Record<OrderStatus, number> = {
  PLACED: 1,
  ACCEPTED: 3,
  PREPARING: 8,
  READY: 4,
  HANDED_OVER: 0,
  CANCELLED: 0,
};

function elapsedMs(iso: string, now: number): number {
  return Math.max(0, now - new Date(iso).getTime());
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function BoardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = useAuth((s) => s.accessToken);
  const branchId = useAuth((s) => s.branchId);
  const branchNameAr = useAuth((s) => s.branchNameAr);
  const clear = useAuth((s) => s.clear);

  const [now, setNow] = useState(Date.now());
  const [soundOn, setSoundOn] = useState(true);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const arrivalSeenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!token) router.replace('/login');
    else if (!branchId) router.replace('/branch');
  }, [token, branchId, router]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const orders = useQuery({
    queryKey: ['kds', 'orders', branchId],
    queryFn: async () => {
      const response = await api.get('/merchant/orders', {
        params: { branchId, status: 'PLACED,ACCEPTED,PREPARING,READY' },
      });
      return response.data.data as Order[];
    },
    enabled: Boolean(token && branchId),
    refetchInterval: 30_000,
  });

  // Audio on new orders and arrivals
  useEffect(() => {
    if (!orders.data) return;
    const seen = seenIdsRef.current;
    const arrivalSeen = arrivalSeenRef.current;
    let newOrders = 0;
    let newArrivals = 0;

    for (const order of orders.data) {
      if (!seen.has(order.id) && order.status === 'PLACED') {
        newOrders += 1;
      }
      seen.add(order.id);

      if (order.customerArrivedAt && !arrivalSeen.has(order.id)) {
        newArrivals += 1;
        arrivalSeen.add(order.id);
      }
    }

    if (soundOn && seen.size > newOrders) {
      // Only chime after the first poll (so we don't ring on initial load)
      if (newOrders > 0) playNewOrderChime();
      if (newArrivals > 0) playArrivalChime();
    }
  }, [orders.data, soundOn]);

  // Realtime
  useEffect(() => {
    if (!token || !branchId) return;
    const socket = connectRealtime(token);
    socket.emit('subscribe:kds', { branchId });
    socket.emit('subscribe:branch', { branchId });
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['kds', 'orders', branchId] });
    socket.on('order:update', refresh);
    socket.on('order:arrival', refresh);
    return () => {
      socket.off('order:update', refresh);
      socket.off('order:arrival', refresh);
    };
  }, [token, branchId, queryClient]);

  const transition = useMutation({
    mutationFn: async ({ id, to }: { id: string; to: OrderStatus }) => {
      await api.patch(`/merchant/orders/${id}/status`, { toStatus: to });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kds', 'orders', branchId] });
    },
  });

  const grouped = useMemo(() => {
    const map = new Map<OrderStatus, Order[]>();
    for (const col of COLUMNS) map.set(col.status, []);
    (orders.data ?? []).forEach((order) => {
      const bucket = map.get(order.status);
      if (bucket) bucket.push(order);
    });
    for (const list of map.values()) {
      list.sort((a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime());
    }
    return map;
  }, [orders.data]);

  if (!token || !branchId) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500 text-white grid place-items-center">
            <ChefHat size={18} />
          </div>
          <div>
            <h1 className="font-semibold">شاشة المطبخ</h1>
            <p className="text-xs text-slate-400">{branchNameAr}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400 ml-3">
            عدد الطلبات: <span className="text-white font-semibold">{orders.data?.length ?? 0}</span>
          </span>
          <button
            onClick={() => {
              primeAudio();
              setSoundOn((v) => !v);
            }}
            className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1 transition ${
              soundOn ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {soundOn ? 'الصوت يعمل' : 'الصوت مكتوم'}
          </button>
          <button
            onClick={() => router.replace('/branch')}
            className="px-3 py-2 rounded-lg text-sm bg-slate-800 hover:bg-slate-700 transition"
          >
            تبديل الفرع
          </button>
          <button
            onClick={() => {
              clear();
              router.replace('/login');
            }}
            className="px-3 py-2 rounded-lg text-sm bg-slate-800 hover:bg-slate-700 transition flex items-center gap-1"
          >
            <LogOut size={14} />
            خروج
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const list = grouped.get(col.status) ?? [];
          return (
            <section key={col.status} className="bg-slate-900/40 rounded-2xl p-3">
              <header className={`flex items-center justify-between rounded-lg px-3 py-2 ${col.accent}`}>
                <span className="font-semibold">{col.label}</span>
                <span className="text-xs bg-black/30 px-2 py-0.5 rounded-full">{list.length}</span>
              </header>
              <div className="mt-3 space-y-3">
                {list.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    now={now}
                    barColor={col.bar}
                    onTransition={(to) => transition.mutate({ id: order.id, to })}
                  />
                ))}
                {list.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-8">لا يوجد طلبات</p>
                )}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}

function OrderCard({
  order,
  now,
  barColor,
  onTransition,
}: {
  order: Order;
  now: number;
  barColor: string;
  onTransition: (to: OrderStatus) => void;
}) {
  const next = NEXT_STATUS[order.status];
  const elapsed = elapsedMs(order.placedAt, now);
  const sla = SLA_MIN_BY_STATUS[order.status] * 60_000;
  const isOverdue = sla > 0 && elapsed > sla;

  return (
    <article
      className={`bg-slate-900 rounded-2xl border ${
        isOverdue ? 'border-red-500/60' : 'border-slate-800'
      } overflow-hidden`}
    >
      <div className={`${barColor} h-1`} />
      <div className="p-4 space-y-3">
        <header className="flex items-center justify-between">
          <span className="font-mono text-sm">#{order.number}</span>
          <span
            className={`flex items-center gap-1 text-sm font-mono ${
              isOverdue ? 'text-red-400 font-bold' : 'text-slate-300'
            }`}
          >
            <AlarmClock size={14} />
            {formatElapsed(elapsed)}
          </span>
        </header>

        {order.fulfillment === 'DRIVE_THRU' && order.vehicle && (
          <div
            className={`flex items-start gap-2 text-xs rounded-lg p-2 ${
              order.customerArrivedAt
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200'
                : 'bg-amber-500/10 border border-amber-500/30 text-amber-200'
            }`}
          >
            <Car size={14} className="mt-0.5 shrink-0" />
            <div>
              <p>
                {order.vehicle.make} · {order.vehicle.color}
              </p>
              <p className="font-mono">{order.vehicle.plateNumber}</p>
              {order.customerArrivedAt && <p className="mt-1 font-semibold">✓ العميل وصل</p>}
            </div>
          </div>
        )}

        {order.pickupCode && (
          <p className="text-xs text-slate-400">
            رمز الاستلام: <span className="font-mono font-bold text-white">{order.pickupCode}</span>
          </p>
        )}

        <ul className="text-sm space-y-1.5">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-2 border-b border-slate-800 pb-1.5">
              <div>
                <span className="font-medium">{item.snapshot.nameAr ?? item.snapshot.name}</span>
                {item.snapshot.modifiers && item.snapshot.modifiers.length > 0 && (
                  <p className="text-xs text-slate-400">
                    {item.snapshot.modifiers.map((m) => m.nameAr ?? m.name).join(' · ')}
                  </p>
                )}
                {item.notes && <p className="text-xs text-amber-300">📝 {item.notes}</p>}
              </div>
              <span className="text-xs bg-slate-800 px-1.5 py-0.5 rounded">×{item.quantity}</span>
            </li>
          ))}
        </ul>

        <div className="flex gap-2 pt-1">
          {next && (
            <button
              onClick={() => onTransition(next.to)}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-2 text-sm flex items-center justify-center gap-1 transition"
            >
              <next.Icon size={14} />
              {next.label}
            </button>
          )}
          <button
            onClick={() => {
              if (confirm('هل تريد إلغاء هذا الطلب؟')) onTransition('CANCELLED');
            }}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-xl py-2 px-3 text-sm transition"
          >
            <XCircle size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}
