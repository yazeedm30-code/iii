import { MetricCard } from '@/components/metric-card';

const metrics = [
  { label: 'مبيعات اليوم', value: '32,400 ر.س', delta: '+12%' },
  { label: 'عدد الطلبات', value: '482', delta: '+8%' },
  { label: 'متوسط قيمة الطلب', value: '67 ر.س', delta: '+3%' },
  { label: 'الفروع النشطة', value: '14', delta: '+1' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">نظرة عامة</h1>
        <p className="text-slate-500 text-sm mt-1">ملخّص الأداء الفوري للنظام</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            delta={metric.delta}
          />
        ))}
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">الطلبات الأخيرة</h2>
        <p className="text-sm text-slate-500">
          متصل عبر WebSocket بحالة الطلبات اللحظية لكل الفروع.
        </p>
      </div>
    </div>
  );
}
