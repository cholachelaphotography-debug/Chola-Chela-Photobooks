"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function TechnicianSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
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
    <div className="min-h-screen bg-stone-50">
      <div className="bg-orange-800 text-orange-50 text-xs py-1.5 text-center">
        Chola Chela Photo Book Studio
      </div>
      <header className="bg-white border-b">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href="/technician"
            className="text-sm text-stone-500 hover:text-orange-700"
          >
            ← Print production
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-stone-500 hover:text-orange-700"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-full bg-orange-700 text-white flex items-center justify-center font-bold text-sm">CC</div>
          <div>
            <div className="font-semibold text-stone-900 text-sm">Chola Chela</div>
            <div className="text-[10px] uppercase tracking-widest text-orange-700">Technician settings</div>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Account settings</h1>
        <p className="text-sm text-stone-500 mb-8">
          Change your password. You must enter your current password first.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4"
        >
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

        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-900">
          <p className="font-medium mb-1">Forgot your password?</p>
          <p className="text-amber-800/90">
            Contact your administrator and ask them to reset your password from
            the admin dashboard (User management). You will receive a temporary
            password and must change it on the next login.
          </p>
        </div>
      </main>
    </div>
  );
}
