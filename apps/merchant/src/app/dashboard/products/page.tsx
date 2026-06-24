'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { Package, Plus, X } from 'lucide-react';

import { api } from '@/lib/api';

interface Category {
  id: string;
  nameAr: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  nameAr: string;
  basePrice: string;
  taxRate: string;
  imageUrl: string | null;
  isActive: boolean;
  prepSeconds: number;
  calories: number | null;
  category: Category;
  _count: { availability: number };
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const products = useQuery({
    queryKey: ['merchant', 'products'],
    queryFn: async () => (await api.get('/merchant/products')).data.data as Product[],
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">المنتجات</h1>
          <p className="text-slate-500 text-sm mt-1">
            كل ما تضيفه هنا سيظهر تلقائياً لعملاء التطبيق
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="bg-brand text-white px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus size={18} />
          إضافة منتج
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.data?.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center shadow-sm">
            <Package size={32} className="mx-auto text-slate-400 mb-2" />
            <p className="text-slate-500">لم تضف منتجات بعد. ابدأ بإضافة أول منتج.</p>
          </div>
        )}
        {products.data?.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl shadow-sm p-5">
            <div className="aspect-video rounded-xl bg-slate-100 mb-3 grid place-items-center text-slate-300">
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imageUrl}
                  alt={p.nameAr}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <Package size={36} />
              )}
            </div>
            <h3 className="font-semibold">{p.nameAr}</h3>
            <p className="text-xs text-slate-500 mb-2">{p.category.nameAr} · {p.sku}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">
                {Number(p.basePrice).toFixed(2)} ر.س
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  p.isActive
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {p.isActive ? 'نشط' : 'متوقف'}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              متاح في {p._count.availability} فرع
            </div>
          </div>
        ))}
      </div>

      {open && (
        <CreateProductModal
          onClose={() => setOpen(false)}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ['merchant', 'products'] });
            queryClient.invalidateQueries({ queryKey: ['merchant', 'me'] });
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function CreateProductModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const categories = useQuery({
    queryKey: ['merchant', 'categories'],
    queryFn: async () => (await api.get('/merchant/categories')).data.data as Category[],
  });

  const [form, setForm] = useState({
    categoryId: '',
    sku: '',
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    imageUrl: '',
    basePrice: '',
    taxRate: '0.15',
    calories: '',
    prepSeconds: '180',
  });
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const body = {
        categoryId: form.categoryId,
        sku: form.sku,
        name: form.name,
        nameAr: form.nameAr,
        description: form.description || undefined,
        descriptionAr: form.descriptionAr || undefined,
        imageUrl: form.imageUrl || undefined,
        basePrice: Number(form.basePrice),
        taxRate: form.taxRate ? Number(form.taxRate) : undefined,
        calories: form.calories ? Number(form.calories) : undefined,
        prepSeconds: Number(form.prepSeconds),
      };
      const { data } = await api.post('/merchant/products', body);
      return data;
    },
    onSuccess: onCreated,
    onError: (err) => setError((err as Error).message),
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
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
          <h2 className="text-lg font-semibold">إضافة منتج جديد</h2>
          <button type="button" onClick={onClose} className="p-1">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block md:col-span-2">
            <span className="block text-sm text-slate-600 mb-1">التصنيف *</span>
            <select
              value={form.categoryId}
              onChange={(e) => update('categoryId', e.target.value)}
              required
              className="w-full bg-slate-50 rounded-xl px-4 py-2.5"
            >
              <option value="">اختر تصنيف</option>
              {categories.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameAr}
                </option>
              ))}
            </select>
          </label>
          <Field label="رمز SKU" value={form.sku} onChange={(v) => update('sku', v)} required ltr />
          <Field label="السعر الأساسي" value={form.basePrice} onChange={(v) => update('basePrice', v)} required ltr />
          <Field label="الاسم بالإنجليزية" value={form.name} onChange={(v) => update('name', v)} required />
          <Field label="الاسم بالعربية" value={form.nameAr} onChange={(v) => update('nameAr', v)} required />
          <Field label="الوصف بالإنجليزية" value={form.description} onChange={(v) => update('description', v)} />
          <Field label="الوصف بالعربية" value={form.descriptionAr} onChange={(v) => update('descriptionAr', v)} />
          <Field label="السعرات الحرارية" value={form.calories} onChange={(v) => update('calories', v)} ltr />
          <Field label="مدة التحضير (ثانية)" value={form.prepSeconds} onChange={(v) => update('prepSeconds', v)} ltr />
          <Field label="رابط الصورة" value={form.imageUrl} onChange={(v) => update('imageUrl', v)} ltr />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-brand text-white px-6 py-2.5 rounded-xl disabled:opacity-60"
          >
            {mutation.isPending ? 'جاري الحفظ...' : 'حفظ المنتج'}
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
