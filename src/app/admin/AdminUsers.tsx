"use client";

import { useEffect, useState } from "react";

type Tech = {
  id: string;
  name: string;
  email: string;
  active: boolean;
  createdAt?: string;
};

export default function AdminUsers() {
  const [techs, setTechs] = useState<Tech[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/technicians");
      if (res.ok) {
        const data = await res.json();
        setTechs(Array.isArray(data) ? data : []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/technicians", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not create technician");
        setSaving(false);
        return;
      }
      setMessage(`Technician created: ${data.email}`);
      setName("");
      setEmail("");
      setPassword("");
      await load();
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id: string, active: boolean) {
    const res = await fetch("/api/admin/technicians", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    });
    if (res.ok) await load();
  }

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="font-semibold text-stone-900 mb-1">Create technician</h2>
        <p className="text-sm text-stone-500 mb-4">
          Technicians log in on the normal login page and are sent to the print
          queue. They cannot access admin settings.
        </p>
        <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-3">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="px-3 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-orange-500"
          />
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="px-3 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-orange-500"
          />
          <input
            required
            type="text"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Temporary password (min 6)"
            className="px-3 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2.5 rounded-xl bg-orange-700 text-white text-sm font-medium hover:bg-orange-800 disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create technician account"}
          </button>
        </form>
        {error && (
          <p className="text-sm text-red-600 mt-3">{error}</p>
        )}
        {message && (
          <p className="text-sm text-green-700 mt-3">{message}</p>
        )}
      </section>

      <section className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="font-semibold text-stone-900 mb-4">Technician accounts</h2>
        {loading ? (
          <p className="text-sm text-stone-500">Loading...</p>
        ) : techs.length === 0 ? (
          <p className="text-sm text-stone-500">No technicians yet.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {techs.map((t) => (
              <li
                key={t.id}
                className="py-3 flex flex-wrap items-center justify-between gap-2"
              >
                <div>
                  <div className="font-medium text-stone-900">{t.name}</div>
                  <div className="text-xs text-stone-500">
                    {t.email} · Role: technician ·{" "}
                    {t.active ? "Active" : "Inactive"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleActive(t.id, t.active)}
                  className="text-xs px-3 py-1.5 rounded-full border border-stone-300 hover:bg-stone-50"
                >
                  {t.active ? "Deactivate" : "Activate"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
