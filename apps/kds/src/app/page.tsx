'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function Index() {
  const router = useRouter();
  const token = useAuth((s) => s.accessToken);
  const branchId = useAuth((s) => s.branchId);

  useEffect(() => {
    if (!token) router.replace('/login');
    else if (!branchId) router.replace('/branch');
    else router.replace('/board');
  }, [router, token, branchId]);

  return null;
}
