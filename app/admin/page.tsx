import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [userCount, branchCount, productCount, planCount] = await Promise.all([
    prisma.user.count({ where: { active: true } }),
    prisma.branch.count({ where: { active: true } }),
    prisma.product.count({ where: { active: true } }),
    prisma.quarterlyPlan.count(),
  ]);

  const now = new Date();
  const currentQuarter = Math.ceil((now.getMonth() + 1) / 3);
  const currentYear = now.getFullYear();

  const stats = [
    { label: "Aktywni użytkownicy", value: userCount, color: "bg-blue-500", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { label: "Placówki bankowe", value: branchCount, color: "bg-green-500", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { label: "Produkty bankowe", value: productCount, color: "bg-purple-500", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    { label: "Plany kwartalne", value: planCount, color: "bg-orange-500", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Panel Administratora</h1>
        <p className="text-gray-500 mt-1">
          {currentYear} — Q{currentQuarter} (kwartał {currentQuarter})
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
            <div className={`${s.color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Szybkie akcje</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { href: "/admin/users", label: "Dodaj użytkownika", desc: "Utwórz konto sprzedawcy lub dyrektora" },
            { href: "/admin/branches", label: "Zarządzaj placówkami", desc: "Dodaj lub edytuj oddziały banku" },
            { href: "/admin/products", label: "Zarządzaj produktami", desc: "Ustaw produkty i punkty" },
            { href: "/admin/plans", label: "Ustaw plany kwartalne", desc: "Planuj cele dla oddziałów" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition"
            >
              <p className="font-medium text-gray-900 text-sm">{item.label}</p>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
