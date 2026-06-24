interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
}

export function MetricCard({ label, value, delta }: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-semibold mt-2">{value}</p>
      {delta ? <p className="text-xs text-emerald-600 mt-1">{delta} مقارنة بالأمس</p> : null}
    </div>
  );
}
