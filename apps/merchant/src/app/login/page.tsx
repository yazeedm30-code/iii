'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Store } from 'lucide-react';

import { loginWithPassword } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuth((s) => s.setSession);
  const [email, setEmail] = useState('owner@demo-coffee.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const session = await loginWithPassword(email.trim().toLowerCase(), password);
      if (session.user.kind !== 'MERCHANT') {
        throw new Error('هذا الحساب ليس حساب تاجر');
      }
      setSession(session);
      router.replace('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center bg-brand-muted px-4">
      <div className="bg-white rounded-3xl shadow-sm p-10 w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand text-white grid place-items-center">
            <Store size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold">لوحة تحكم التاجر</h1>
            <p className="text-sm text-slate-500">سجّل دخولك لإدارة فروعك ومنتجاتك</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-sm mb-1">البريد الإلكتروني</span>
            <input
              type="email"
              dir="ltr"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
            />
          </label>
          <label className="block">
            <span className="block text-sm mb-1">كلمة المرور</span>
            <input
              type="password"
              dir="ltr"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand text-white rounded-xl py-3 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <LogIn size={18} />
            {submitting ? 'جاري التسجيل...' : 'دخول'}
          </button>
        </form>
      </div>
    </main>
  );
}
