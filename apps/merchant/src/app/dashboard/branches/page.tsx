'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { MapPin, Plus, X } from 'lucide-react';

import { api } from '@/lib/api';

interface Branch {
  id: string;
  name: string;
  nameAr: string;
  code: string;
  latitude: string;
  longitude: string;
  status: string;
  averagePrepMin: number;
  supportsDriveThru: boolean;
  supportsPickup: boolean;
  arrivalRadiusM: number;
  city: { nameAr: string };
  _count: { orders: number; productAvail: number };
}

interface City {
  id: string;
  nameAr: string;
}

export default function BranchesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const branches = useQuery({
    queryKey: ['merchant', 'branches'],
    queryFn: async () => (await api.get('/merchant/branches')).data.data as Branch[],
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">الفروع</h1>
          <p className="text-slate-500 text-sm mt-1">إدارة فروعك ومواقعها على الخريطة</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="bg-brand text-white px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus size={18} />
          إضافة فرع
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.data?.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand grid place-items-center">
                <MapPin size={18} />
              </div>
              <div>
                <h3 className="font-semibold">{b.nameAr}</h3>
                <p className="text-xs text-slate-500">{b.city.nameAr} · {b.code}</p>
              </div>
            </div>
            <dl className="text-sm space-y-1 mt-4">
              <div className="flex justify-between">
                <dt className="text-slate-500">الحالة</dt>
                <dd>{b.status === 'OPEN' ? 'مفتوح' : b.status}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">متوسط التحضير</dt>
                <dd>{b.averagePrepMin} د</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">نصف قطر الوصول</dt>
                <dd>{b.arrivalRadiusM} م</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">طلبات الحياة</dt>
                <dd>{b._count.orders}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">منتجات متاحة</dt>
                <dd>{b._count.productAvail}</dd>
              </div>
            </dl>
            <div className="mt-4 flex gap-2 flex-wrap">
              {b.supportsDriveThru && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs">
                  من السيارة
                </span>
              )}
              {b.supportsPickup && (
                <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs">
                  استلام داخلي
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {open && (
        <CreateBranchModal
          onClose={() => setOpen(false)}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ['merchant', 'branches'] });
            queryClient.invalidateQueries({ queryKey: ['merchant', 'me'] });
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function CreateBranchModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const cities = useQuery({
    queryKey: ['cities'],
    queryFn: async () => (await api.get('/cities')).data.data as City[],
  });

  const [form, setForm] = useState({
    cityId: '',
    name: '',
    nameAr: '',
    code: '',
    latitude: '24.7136',
    longitude: '46.6753',
    address: '',
    arrivalRadiusM: '200',
    averagePrepMin: '8',
    supportsDriveThru: true,
    supportsPickup: true,
  });
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const body = {
        cityId: form.cityId,
        name: form.name,
        nameAr: form.nameAr,
        code: form.code,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        address: form.address || undefined,
        arrivalRadiusM: Number(form.arrivalRadiusM),
        averagePrepMin: Number(form.averagePrepMin),
        supportsDriveThru: form.supportsDriveThru,
        supportsPickup: form.supportsPickup,
      };
      const { data } = await api.post('/merchant/branches', body);
      return data;
    },
    onSuccess: onCreated,
    onError: (err) => setError((err as Error).message),
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    mutation.mutate();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">إضافة فرع جديد</h2>
          <button type="button" onClick={onClose} className="p-1">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="الاسم بالإنجليزية" value={form.name} onChange={(v) => update('name', v)} required />
          <Field label="الاسم بالعربية" value={form.nameAr} onChange={(v) => update('nameAr', v)} required />
          <Field label="رمز الفرع" value={form.code} onChange={(v) => update('code', v.toUpperCase())} ltr required />
          <label className="block">
            <span className="block text-sm text-slate-600 mb-1">المدينة</span>
            <select
              value={form.cityId}
              onChange={(e) => update('cityId', e.target.value)}
              required
              className="w-full bg-slate-50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">اختر مدينة</option>
              {cities.data?.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.nameAr}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="خط العرض (Latitude)"
            value={form.latitude}
            onChange={(v) => update('latitude', v)}
            ltr
            required
          />
          <Field
            label="خط الطول (Longitude)"
            value={form.longitude}
            onChange={(v) => update('longitude', v)}
            ltr
            required
          />
          <Field
            label="نصف قطر التنبيه (م)"
            value={form.arrivalRadiusM}
            onChange={(v) => update('arrivalRadiusM', v)}
            ltr
          />
          <Field
            label="متوسط التحضير (د)"
            value={form.averagePrepMin}
            onChange={(v) => update('averagePrepMin', v)}
            ltr
          />
          <div className="md:col-span-2">
            <Field
              label="العنوان"
              value={form.address}
              onChange={(v) => update('address', v)}
            />
          </div>
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={form.supportsDriveThru}
              onChange={(e) => update('supportsDriveThru', e.target.checked)}
            />
            <span className="text-sm">يدعم الاستلام من السيارة</span>
          </label>
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={form.supportsPickup}
              onChange={(e) => update('supportsPickup', e.target.checked)}
            />
            <span className="text-sm">يدعم الاستلام الداخلي</span>
          </label>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-brand text-white px-6 py-2.5 rounded-xl disabled:opacity-60"
          >
            {mutation.isPending ? 'جاري الحفظ...' : 'حفظ الفرع'}
          </button>
          <button type="button" onClick={onClose} className="bg-slate-100 px-6 py-2.5 rounded-xl">
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  ltr,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  ltr?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-sm text-slate-600 mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        dir={ltr ? 'ltr' : 'rtl'}
        className="w-full bg-slate-50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand"
      />
    </label>
  );
}
