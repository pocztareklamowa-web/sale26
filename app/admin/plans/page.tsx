"use client";

import { useState, useEffect, useCallback } from "react";

type Branch = { id: string; name: string; code: string; active: boolean };
type Product = { id: string; name: string; points: number; active: boolean };
type Plan = {
  id: string;
  branchId: string;
  productId: string;
  year: number;
  quarter: number;
  targetCount: number;
  branch: { id: string; name: string; code: string };
  product: { id: string; name: string; points: number };
};

const currentYear = new Date().getFullYear();
const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(currentYear);
  const [quarter, setQuarter] = useState(currentQuarter);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ branchId: "", productId: "", targetCount: "0" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/plans?year=${year}&quarter=${quarter}`);
    setPlans(await res.json());
    setLoading(false);
  }, [year, quarter]);

  const fetchBranchesProducts = useCallback(async () => {
    const [br, pr] = await Promise.all([fetch("/api/admin/branches"), fetch("/api/admin/products")]);
    setBranches(await br.json());
    setProducts(await pr.json());
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);
  useEffect(() => { fetchBranchesProducts(); }, [fetchBranchesProducts]);

  function openAdd() {
    setEditingPlan(null);
    setForm({ branchId: "", productId: "", targetCount: "0" });
    setError("");
    setShowForm(true);
  }

  function openEdit(p: Plan) {
    setEditingPlan(p);
    setForm({ branchId: p.branchId, productId: p.productId, targetCount: String(p.targetCount) });
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/admin/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branchId: form.branchId, productId: form.productId, year, quarter, targetCount: Number(form.targetCount) }),
    });

    if (res.ok) {
      setShowForm(false);
      fetchPlans();
    } else {
      const data = await res.json();
      setError(data.error ?? "Wystąpił błąd");
    }
    setSaving(false);
  }

  async function quickEdit(plan: Plan, newValue: number) {
    await fetch("/api/admin/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branchId: plan.branchId, productId: plan.productId, year, quarter, targetCount: newValue }),
    });
    fetchPlans();
  }

  const activeBranches = branches.filter((b) => b.active);
  const activeProducts = products.filter((p) => p.active);

  const groupedByBranch = activeBranches.map((branch) => ({
    branch,
    plans: activeProducts.map((product) => {
      const existing = plans.find((p) => p.branchId === branch.id && p.productId === product.id);
      return { product, targetCount: existing?.targetCount ?? 0, plan: existing };
    }),
  }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plany kwartalne</h1>
          <p className="text-gray-500 text-sm mt-1">Ustaw cele sprzedażowe dla każdej placówki</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ustaw plan
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Rok:</label>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white">
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Kwartał:</label>
          <select value={quarter} onChange={(e) => setQuarter(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white">
            <option value={1}>Q1 (sty-mar)</option>
            <option value={2}>Q2 (kwi-cze)</option>
            <option value={3}>Q3 (lip-wrz)</option>
            <option value={4}>Q4 (paź-gru)</option>
          </select>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-1">Ustaw plan kwartalny</h2>
            <p className="text-sm text-gray-500 mb-4">{year} — Q{quarter}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placówka *</label>
                <select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="">— Wybierz placówkę —</option>
                  {activeBranches.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.code})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produkt *</label>
                <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="">— Wybierz produkt —</option>
                  {activeProducts.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.points} pkt)</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cel (liczba sztuk) *</label>
                <input type="number" value={form.targetCount} onChange={(e) => setForm({ ...form, targetCount: e.target.value })}
                  required min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                  Anuluj
                </button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium">
                  {saving ? "Zapisywanie..." : "Zapisz"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500">Ładowanie...</div>
      ) : activeBranches.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500">
          <p className="font-medium">Brak placówek</p>
          <p className="text-sm mt-1">Najpierw dodaj placówki bankowe.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByBranch.map(({ branch, plans: branchPlans }) => (
            <div key={branch.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                <span className="font-mono text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{branch.code}</span>
                <h3 className="font-semibold text-gray-900">{branch.name}</h3>
                <span className="text-sm text-gray-500 ml-auto">
                  Łącznie: {branchPlans.reduce((s, p) => s + p.targetCount, 0)} sztuk
                </span>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500">Produkt</th>
                    <th className="px-6 py-2 text-center text-xs font-medium text-gray-500">Punkty/szt.</th>
                    <th className="px-6 py-2 text-center text-xs font-medium text-gray-500">Cel (szt.)</th>
                    <th className="px-6 py-2 text-center text-xs font-medium text-gray-500">Cel (pkt)</th>
                    <th className="px-6 py-2 text-right text-xs font-medium text-gray-500">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {branchPlans.map(({ product, targetCount, plan }) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{product.name}</td>
                      <td className="px-6 py-3 text-center text-sm text-gray-500">{product.points}</td>
                      <td className="px-6 py-3 text-center">
                        <span className={`text-sm font-medium ${targetCount > 0 ? "text-gray-900" : "text-gray-400"}`}>
                          {targetCount}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`text-sm ${targetCount > 0 ? "text-blue-700 font-medium" : "text-gray-400"}`}>
                          {targetCount * product.points}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => {
                            setForm({ branchId: branch.id, productId: product.id, targetCount: String(targetCount) });
                            setError("");
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {plan ? "Edytuj" : "Ustaw"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
