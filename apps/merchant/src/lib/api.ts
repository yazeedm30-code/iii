import axios from 'axios';
import { useAuth } from './auth';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuth.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      useAuth.getState().clear();
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    const message =
      error?.response?.data?.error?.message ?? error.message ?? 'تعذّر إكمال الطلب';
    return Promise.reject(new Error(message));
  },
);

export async function loginWithPassword(email: string, password: string) {
  const { data } = await api.post('/auth/email/login', { email, password });
  return data.data as {
    accessToken: string;
    refreshToken: string;
    user: { id: string; kind: string; locale: string };
  };
}
