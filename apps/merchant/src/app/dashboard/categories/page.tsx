'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { ListTree, Plus, X } from 'lucide-react';

import { api } from '@/lib/api';
import { ImageUploader } from '@/components/image-uploader';

interface Category {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  sortOrder: number;
  _count: { products: number };
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const categories = useQuery({
    queryKey: ['merchant', 'categories'],
    queryFn: async () => (await api.get('/merchant/categories')).data.data as Category[],
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">التصنيفات</h1>
          <p className="text-slate-500 text-sm mt-1">
            رتّب قائمتك بتصنيفات مثل: مشروبات، حلويات، إفطار
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="bg-brand text-white px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus size={18} />
          إضافة تصنيف
        </button>
      </header>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {categories.isLoading && <p className="p-6 text-slate-500">جاري التحميل...</p>}
        {categories.data && categories.data.length === 0 && (
          <p className="p-6 text-slate-500">لا توجد تصنيفات بعد.</p>
        )}
        {categories.data && categories.data.length > 0 && (
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-sm text-slate-600">
              <tr>
                <th className="px-6 py-3 font-medium">الاسم</th>
                <th className="px-6 py-3 font-medium">المعرّف</th>
                <th className="px-6 py-3 font-medium">عدد المنتجات</th>
                <th className="px-6 py-3 font-medium">الترتيب</th>
              </tr>
            </thead>
            <tbody>
              {categories.data.map((c) => (
                <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand/10 text-brand grid place-items-center">
                        <ListTree size={16} />
                      </div>
                      <div>
                        <div className="font-medium">{c.nameAr}</div>
                        <div className="text-xs text-slate-500">{c.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm font-mono">{c.slug}</td>
                  <td className="px-6 py-3 text-sm">{c._count.products}</td>
                  <td className="px-6 py-3 text-sm">{c.sortOrder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <CreateCategoryModal
          onClose={() => setOpen(false)}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ['merchant', 'categories'] });
            queryClient.invalidateQueries({ queryKey: ['merchant', 'me'] });
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function CreateCategoryModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({ name: '', nameAr: '', slug: '', sortOrder: '1', imageUrl: '' });
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/merchant/categories', {
        name: form.name,
        nameAr: form.nameAr,
        slug: form.slug,
        sortOrder: Number(form.sortOrder),
        imageUrl: form.imageUrl || undefined,
      });
      return data;
    },
    onSuccess: onCreated,
    onError: (err) => setError((err as Error).message),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    mutation.mutate();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">إضافة تصنيف</h2>
          <button type="button" onClick={onClose} className="p-1">
            <X size={20} />
          </button>
        </div>
        <label className="block">
          <span className="block text-sm text-slate-600 mb-1">الاسم بالإنجليزية *</span>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
            className="w-full bg-slate-50 rounded-xl px-4 py-2.5"
          />
        </label>
        <label className="block">
          <span className="block text-sm text-slate-600 mb-1">الاسم بالعربية *</span>
          <input
            value={form.nameAr}
            onChange={(e) => setForm((p) => ({ ...p, nameAr: e.target.value }))}
            required
            className="w-full bg-slate-50 rounded-xl px-4 py-2.5"
          />
        </label>
        <label className="block">
          <span className="block text-sm text-slate-600 mb-1">المعرّف (slug) *</span>
          <input
            value={form.slug}
            onChange={(e) =>
              setForm((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))
            }
            required
            dir="ltr"
            className="w-full bg-slate-50 rounded-xl px-4 py-2.5"
          />
        </label>
        <label className="block">
          <span className="block text-sm text-slate-600 mb-1">الترتيب</span>
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
            dir="ltr"
            className="w-full bg-slate-50 rounded-xl px-4 py-2.5"
          />
        </label>
        <ImageUploader
          value={form.imageUrl}
          onChange={(url) => setForm((p) => ({ ...p, imageUrl: url }))}
          endpoint="category-image"
          label="صورة التصنيف (اختياري)"
          aspect="wide"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-brand text-white px-6 py-2.5 rounded-xl disabled:opacity-60"
          >
            {mutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
          </button>
          <button type="button" onClick={onClose} className="bg-slate-100 px-6 py-2.5 rounded-xl">
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
