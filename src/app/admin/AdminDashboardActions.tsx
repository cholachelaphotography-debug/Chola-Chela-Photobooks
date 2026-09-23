"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminDashboardActions() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function resetCompleted() {
    if (
      !confirm(
        "Archive all completed orders and move their paid totals into Past revenue? Current Revenue (paid) and Completed counts will reset for those jobs."
      )
    )
      return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/archive-completed", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed");
        return;
      }
      alert(data.message || "Done");
      router.refresh();
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={resetCompleted}
      disabled={loading}
      className="px-4 py-2 rounded-full border border-stone-300 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50 whitespace-nowrap"
    >
      {loading ? "Working…" : "Reset completed & revenue"}
    </button>
  );
}
