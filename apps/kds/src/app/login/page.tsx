'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, LogIn } from 'lucide-react';

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
      if (session.user.kind !== 'MERCHANT' && session.user.kind !== 'EMPLOYEE') {
        throw new Error('هذا الحساب غير مصرّح له بالدخول إلى شاشة المطبخ');
      }
      setSession(session);
      router.replace('/branch');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center px-4">
      <div className="bg-slate-900 rounded-3xl p-10 w-full max-w-md border border-slate-800">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white grid place-items-center">
            <ChefHat size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold">شاشة المطبخ</h1>
            <p className="text-sm text-slate-400">دخول الموظفين</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-sm mb-1 text-slate-300">البريد الإلكتروني</span>
            <input
              type="email"
              dir="ltr"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </label>
          <label className="block">
            <span className="block text-sm mb-1 text-slate-300">كلمة المرور</span>
            <input
              type="password"
              dir="ltr"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-3 flex items-center justify-center gap-2 disabled:opacity-60 transition"
          >
            <LogIn size={18} />
            {submitting ? 'جاري التسجيل...' : 'دخول'}
          </button>
        </form>
      </div>
    </main>
  );
}
