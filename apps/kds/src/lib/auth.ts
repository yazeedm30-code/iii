'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  id: string;
  kind: string;
  locale: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  branchId: string | null;
  branchNameAr: string | null;
  setSession: (session: { accessToken: string; refreshToken: string; user: AuthUser }) => void;
  setBranch: (branch: { id: string; nameAr: string } | null) => void;
  clear: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      branchId: null,
      branchNameAr: null,
      setSession: ({ accessToken, refreshToken, user }) =>
        set({ accessToken, refreshToken, user }),
      setBranch: (branch) =>
        set({
          branchId: branch?.id ?? null,
          branchNameAr: branch?.nameAr ?? null,
        }),
      clear: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          branchId: null,
          branchNameAr: null,
        }),
    }),
    { name: 'kds-auth' },
  ),
);
