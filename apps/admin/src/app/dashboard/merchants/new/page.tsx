'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Store } from 'lucide-react';

import { api } from '@/lib/api';
import { ImageUploader } from '@/components/image-uploader';

interface OnboardResult {
  merchantId: string;
  slug: string;
  ownerUserId: string;
  ownerEmail: string;
}

export default function OnboardMerchantPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    nameAr: '',
    slug: '',
    vatNumber: '',
    crNumber: '',
    primaryColor: '#1F2937',
    logoUrl: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerPosition: 'Owner',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OnboardResult | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await api.post('/admin/onboarding/merchant', {
        ...form,
        ownerEmail: form.ownerEmail.trim().toLowerCase(),
      });
      setResult(data.data as OnboardResult);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm p-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 grid place-items-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h1 className="text-xl font-semibold">تم إنشاء التاجر بنجاح</h1>
            <p className="text-slate-500 text-sm">شارك بيانات الدخول مع صاحب العلامة التجارية</p>
          </div>
        </div>
        <dl className="divide-y divide-slate-100">
          <Row label="معرّف التاجر" value={result.merchantId} />
          <Row label="الرابط (slug)" value={result.slug} />
          <Row label="معرّف حساب المالك" value={result.ownerUserId} />
          <Row label="البريد الإلكتروني" value={result.ownerEmail} />
          <Row label="كلمة المرور" value={form.ownerPassword} />
        </dl>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/dashboard/merchants')}
            className="bg-brand text-white px-5 py-2 rounded-xl"
          >
            رجوع للقائمة
          </button>
          <button
            onClick={() => {
              setResult(null);
              setForm({
                name: '', nameAr: '', slug: '', vatNumber: '', crNumber: '',
                primaryColor: '#1F2937', logoUrl: '', ownerName: '', ownerEmail: '',
                ownerPassword: '', ownerPosition: 'Owner',
              });
            }}
            className="bg-slate-100 px-5 py-2 rounded-xl"
          >
            إضافة تاجر آخر
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <header className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-brand text-white grid place-items-center">
          <Store size={20} />
        </div>
        <div>
          <h1 className="text-xl font-semibold">إضافة تاجر جديد</h1>
          <p className="text-slate-500 text-sm">
            ينشئ التاجر مع حساب مدير ينطلق منه إلى لوحة التاجر
          </p>
        </div>
      </header>

      <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold">معلومات العلامة التجارية</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="الاسم بالإنجليزية"
            value={form.name}
            onChange={(v) => update('name', v)}
            required
          />
          <Field
            label="الاسم بالعربية"
            value={form.nameAr}
            onChange={(v) => update('nameAr', v)}
            required
          />
          <Field
            label="الرابط (slug)"
            value={form.slug}
            onChange={(v) => update('slug', v.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            placeholder="my-coffee"
            required
            ltr
          />
          <Field
            label="اللون الرئيسي"
            value={form.primaryColor}
            onChange={(v) => update('primaryColor', v)}
            ltr
          />
          <Field
            label="السجل التجاري"
            value={form.crNumber}
            onChange={(v) => update('crNumber', v)}
            ltr
          />
          <Field
            label="الرقم الضريبي"
            value={form.vatNumber}
            onChange={(v) => update('vatNumber', v)}
            ltr
          />
          <div className="md:col-span-2">
            <ImageUploader
              value={form.logoUrl}
              onChange={(url) => update('logoUrl', url)}
              endpoint="merchant-logo"
              label="شعار العلامة التجارية"
              aspect="square"
            />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold">حساب صاحب التاجر</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="الاسم"
            value={form.ownerName}
            onChange={(v) => update('ownerName', v)}
            required
          />
          <Field
            label="المنصب"
            value={form.ownerPosition}
            onChange={(v) => update('ownerPosition', v)}
          />
          <Field
            label="البريد الإلكتروني"
            value={form.ownerEmail}
            onChange={(v) => update('ownerEmail', v)}
            type="email"
            required
            ltr
          />
          <Field
            label="كلمة المرور الأولية"
            value={form.ownerPassword}
            onChange={(v) => update('ownerPassword', v)}
            type="text"
            required
            ltr
            hint="8 أحرف على الأقل"
          />
        </div>
      </section>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-brand text-white px-6 py-3 rounded-xl disabled:opacity-60"
        >
          {submitting ? 'جاري الإنشاء...' : 'إنشاء التاجر'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-slate-100 px-6 py-3 rounded-xl"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  ltr?: boolean;
  hint?: string;
}

function Field({ label, value, onChange, type = 'text', placeholder, required, ltr, hint }: FieldProps) {
  return (
    <label className="block">
      <span className="block text-sm text-slate-600 mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        dir={ltr ? 'ltr' : 'rtl'}
        className="w-full bg-slate-50 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-accent"
      />
      {hint && <span className="block text-xs text-slate-400 mt-1">{hint}</span>}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-3">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className="font-mono text-sm">{value}</span>
    </div>
  );
}
