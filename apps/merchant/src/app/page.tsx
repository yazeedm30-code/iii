export default function MerchantHome() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">لوحة تحكم التاجر</h1>
      <p className="mt-2 text-slate-600">إدارة فروعك، منتجاتك، والعروض الخاصة بك.</p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {['الفروع', 'الطلبات', 'المنتجات', 'العروض', 'الموظفون', 'التقارير'].map((label) => (
          <div key={label} className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold">{label}</h2>
            <p className="text-sm text-slate-500 mt-2">اطلع على بياناتك وقم بإدارتها مباشرة.</p>
          </div>
        ))}
      </div>
    </main>
  );
}
