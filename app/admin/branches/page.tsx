"use client";

import { useState, useEffect, useCallback } from "react";

type Branch = {
  id: string;
  name: string;
  code: string;
  active: boolean;
  _count: { users: number };
};

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState({ name: "", code: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchBranches = useCallback(async () => {
    const res = await fetch("/api/admin/branches");
    const data = await res.json();
    setBranches(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchBranches(); }, [fetchBranches]);

  function openAdd() {
    setEditing(null);
    setForm({ name: "", code: "" });
    setError("");
    setShowForm(true);
  }

  function openEdit(b: Branch) {
    setEditing(b);
    setForm({ name: b.name, code: b.code });
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = editing ? `/api/admin/branches/${editing.id}` : "/api/admin/branches";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, code: form.code }),
    });

    if (res.ok) {
      setShowForm(false);
      fetchBranches();
    } else {
      const data = await res.json();
      setError(data.error ?? "Wystąpił błąd");
    }
    setSaving(false);
  }

  async function toggleActive(b: Branch) {
    await fetch(`/api/admin/branches/${b.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !b.active }),
    });
    fetchBranches();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Placówki bankowe</h1>
          <p className="text-gray-500 text-sm mt-1">Zarządzaj oddziałami i filiami banku</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Dodaj placówkę
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{editing ? "Edytuj placówkę" : "Nowa placówka"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa placówki *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                  placeholder="np. Oddział Centrum Warszawa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kod placówki *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  required
                  maxLength={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  placeholder="np. WRS-01"
                />
                <p className="text-xs text-gray-400 mt-1">Unikalny kod identyfikacyjny (max. 10 znaków)</p>
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

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Ładowanie...</div>
        ) : branches.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="font-medium">Brak placówek</p>
            <p className="text-sm mt-1">Dodaj pierwszą placówkę bankową.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nazwa placówki</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kod</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Użytkownicy</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {branches.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{b.name}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{b.code}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">{b._count.users}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${b.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                      {b.active ? "Aktywna" : "Nieaktywna"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => openEdit(b)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Edytuj
                    </button>
                    <button onClick={() => toggleActive(b)} className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                      {b.active ? "Dezaktywuj" : "Aktywuj"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
