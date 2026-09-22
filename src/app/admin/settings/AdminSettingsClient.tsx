"use client";

import { useState } from "react";

export default function AdminSettingsClient({
  name,
  email,
  role,
  memberSince,
}: {
  name: string;
  email: string;
  role: string;
  memberSince: string;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirm) {
      setError("New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not update password");
        setLoading(false);
        return;
      }
      setMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Account info */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <h2 className="font-semibold text-stone-900 mb-4">Account</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">Name</dt>
            <dd className="font-medium text-stone-900 text-right">{name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">Email</dt>
            <dd className="font-medium text-stone-900 text-right break-all">
              {email}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">Role</dt>
            <dd className="font-medium text-orange-800 capitalize">{role}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">Member since</dt>
            <dd className="font-medium text-stone-900">
              {new Date(memberSince).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </section>

      {/* Password */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <h2 className="font-semibold text-stone-900 mb-1">Change password</h2>
        <p className="text-sm text-stone-500 mb-4">
          Enter your current password, then choose a new one.
        </p>
        <form onSubmit={handlePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Current password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New password</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm new password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 outline-none focus:border-orange-500"
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
          {message && (
            <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
              {message}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-orange-700 text-white font-semibold hover:bg-orange-800 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Update password"}
          </button>
        </form>
      </section>

      {/* Studio info */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <h2 className="font-semibold text-stone-900 mb-3">Studio contact</h2>
        <ul className="text-sm text-stone-600 space-y-2">
          <li>
            Email:{" "}
            <a
              href="mailto:cholachelaphotography@gmail.com"
              className="text-orange-700 hover:underline"
            >
              cholachelaphotography@gmail.com
            </a>
          </li>
          <li>
            WhatsApp:{" "}
            <a
              href="https://wa.me/260966080108"
              target="_blank"
              rel="noreferrer"
              className="text-orange-700 hover:underline"
            >
              +260 966 080 108
            </a>
          </li>
          <li>Location: Kitwe, Zambia</li>
        </ul>
      </section>

      <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-900">
        <p className="font-medium mb-1">Security tips</p>
        <ul className="list-disc pl-5 space-y-1 text-amber-900/90">
          <li>Use a strong unique password for this admin account.</li>
          <li>Do not share your login with technicians.</li>
          <li>Reset technician passwords from User management when needed.</li>
        </ul>
      </section>
    </div>
  );
}
