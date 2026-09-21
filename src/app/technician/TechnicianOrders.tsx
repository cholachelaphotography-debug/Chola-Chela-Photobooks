"use client";

import { useState } from "react";
import Link from "next/link";

type Order = {
  id: string;
  amount: number;
  bookSize: string;
  coverType: string;
  materialName: string | null;
  pageCount: number;
  status: string;
  shippingName: string | null;
  shippingPhone: string | null;
  createdAt: string;
  user: { name: string; email: string };
  project: { id: string; title: string; pageCount: number };
};

export default function TechnicianOrders({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [busy, setBusy] = useState<string | null>(null);

  async function action(id: string, action: string) {
    setBusy(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const u = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: u.status } : o))
        );
      } else {
        const d = await res.json();
        alert(d.error || "Failed");
      }
    } finally {
      setBusy(null);
    }
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white border border-dashed rounded-2xl p-12 text-center text-stone-500">
        No books in the print queue.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div
          key={o.id}
          className="bg-white border border-stone-200 rounded-xl p-4 flex flex-wrap gap-4 justify-between items-center"
        >
          <div>
            <div className="font-medium">{o.project.title}</div>
            <div className="text-xs text-stone-500">
              {o.materialName || o.coverType} · {o.bookSize} · {o.pageCount}{" "}
              pages · {o.user.name}
            </div>
            <div className="text-xs capitalize text-orange-700 mt-0.5">
              {o.status.replace(/_/g, " ")}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/books/${o.project.id}`}
              className="px-3 py-1.5 rounded-full border text-xs font-medium"
            >
              Preview book
            </Link>
            {o.status === "approved_for_print" && (
              <button
                disabled={busy === o.id}
                onClick={() => action(o.id, "start_print")}
                className="px-3 py-1.5 rounded-full bg-blue-700 text-white text-xs font-medium"
              >
                Start printing
              </button>
            )}
            {o.status === "printing" && (
              <button
                disabled={busy === o.id}
                onClick={() => action(o.id, "complete_print")}
                className="px-3 py-1.5 rounded-full bg-green-700 text-white text-xs font-medium"
              >
                Mark printing completed
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
