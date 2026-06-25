'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { ImagePlus, Loader2, Upload, X } from 'lucide-react';

import { api } from '@/lib/api';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  endpoint?: 'product-image' | 'category-image' | 'merchant-logo';
  label?: string;
  aspect?: 'square' | 'video' | 'wide';
}

const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';
const MAX_BYTES = 5 * 1024 * 1024;

export function ImageUploader({
  value,
  onChange,
  endpoint = 'product-image',
  label = 'صورة المنتج',
  aspect = 'video',
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار صورة فقط');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`الحد الأقصى للصورة ${(MAX_BYTES / 1024 / 1024).toFixed(0)} ميجابايت`);
      return;
    }

    const data = new FormData();
    data.append('file', file);

    try {
      setUploading(true);
      setProgress(0);
      const response = await api.post(`/uploads/${endpoint}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
      });
      const url = response.data?.data?.url as string;
      if (!url) throw new Error('استجابة غير متوقعة من الخادم');
      onChange(url);
    } catch (err) {
      setError((err as Error).message || 'فشل رفع الصورة');
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const aspectClass =
    aspect === 'square' ? 'aspect-square' : aspect === 'wide' ? 'aspect-[3/1]' : 'aspect-video';

  return (
    <div className="space-y-2">
      <span className="block text-sm text-slate-600">{label}</span>

      {value ? (
        <div className={`relative ${aspectClass} rounded-2xl overflow-hidden bg-slate-100 border border-slate-200`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-white text-slate-900 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"
            >
              <Upload size={14} />
              تبديل
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"
            >
              <X size={14} />
              إزالة
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className={`w-full ${aspectClass} rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition grid place-items-center text-slate-500`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={28} className="animate-spin" />
              <span className="text-sm">جاري الرفع... {progress}%</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImagePlus size={28} />
              <span className="text-sm">انقر لاختيار صورة</span>
              <span className="text-xs text-slate-400">PNG · JPG · WebP حتى 5MB</span>
            </div>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleFile}
        className="hidden"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
