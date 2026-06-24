'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const token = useAuth((s) => s.accessToken);

  useEffect(() => {
    router.replace(token ? '/dashboard' : '/login');
  }, [router, token]);

  return null;
}
