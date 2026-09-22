"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Order = {
  id: string;
  amount: number;
  currency: string;
  bookSize: string;
  coverType: string;
  paperType: string;
  pageCount: number;
  quantity?: number;
  materialName?: string | null;
  paymentStatus: string;
  paymentMethod?: string | null;
  receiptNumber?: string | null;
  status: string;
  shippingName: string | null;
  shippingPhone: string | null;
  shippingAddress: string | null;
  notes: string | null;
  createdAt: string;
  paymentConfirmedAt?: string | null;
  user: { name: string; email: string };
  project: { id: string; title: string; pageCount: number };
};

function formatK(n: number) {
  return `K${(n / 100).toFixed(2)}`;
}

function isCompleted(status: string) {
  return ["printing_completed", "shipped", "delivered"].includes(status);
}

export default function AdminOrders({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [hideCompleted, setHideCompleted] = useState(false);

  const visible = useMemo(() => {
    if (!hideCompleted) return orders;
    return orders.filter((o) => !isCompleted(o.status));
  }, [orders, hideCompleted]);

  async function runAction(orderId: string, action: string) {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: updated.status,
                  paymentStatus: updated.paymentStatus,
                  receiptNumber: updated.receiptNumber ?? o.receiptNumber,
                  paymentConfirmedAt:
                    updated.paymentConfirmedAt ?? o.paymentConfirmedAt,
                }
              : o
          )
        );
      } else {
        const data = await res.json();
        alert(data.error || "Action failed");
      }
    } finally {
      setUpdating(null);
    }
  }

  function clearCompletedFromView() {
    if (
      !confirm(
        "Hide all completed orders from this list? They are not deleted — refresh the page or turn the filter off to see them again."
      )
    )
      return;
    setHideCompleted(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500">
          Showing {visible.length} of {orders.length} orders
          {hideCompleted ? " (completed hidden)" : ""}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setHideCompleted((v) => !v)}
            className="text-xs px-3 py-1.5 rounded-full border border-stone-300 hover:bg-stone-50"
          >
            {hideCompleted ? "Show completed" : "Hide completed"}
          </button>
          <button
            type="button"
            onClick={clearCompletedFromView}
            className="text-xs px-3 py-1.5 rounded-full border border-orange-200 text-orange-800 hover:bg-orange-50"
          >
            Clear completed from view
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center text-stone-500">
          {orders.length === 0
            ? "No orders yet."
            : "No orders match this view. Show completed to see more."}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((o) => (
            <div
              key={o.id}
              className="bg-white border border-stone-200 rounded-xl p-4"
            >
              <div className="flex flex-wrap gap-3 justify-between items-start">
                <div>
                  <div className="font-medium text-stone-900">
                    {o.project?.title || "Photo book"}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {o.user.name} · {o.user.email}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {o.materialName || o.coverType} · {o.bookSize} ·{" "}
                    {o.pageCount} pages · {formatK(o.amount)}
                  </div>
                  <div className="text-xs mt-1">
                    <span className="capitalize text-orange-700">
                      {o.status.replace(/_/g, " ")}
                    </span>
                    {" · "}
                    <span className="capitalize text-stone-600">
                      payment: {o.paymentStatus.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/books/${o.project.id}`}
                    className="px-3 py-1.5 rounded-full border text-xs font-medium"
                  >
                    Preview
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded(expanded === o.id ? null : o.id)
                    }
                    className="px-3 py-1.5 rounded-full border text-xs font-medium"
                  >
                    {expanded === o.id ? "Less" : "Actions"}
                  </button>
                </div>
              </div>
              {expanded === o.id && (
                <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap gap-2">
                  {o.paymentStatus !== "paid" && o.status !== "cancelled" && (
                    <button
                      disabled={updating === o.id}
                      onClick={() => runAction(o.id, "confirm_payment")}
                      className="px-3 py-1.5 rounded-full bg-green-700 text-white text-xs font-medium disabled:opacity-50"
                    >
                      Confirm payment
                    </button>
                  )}
                  {o.paymentStatus === "paid" &&
                    o.status === "payment_confirmed" && (
                      <button
                        disabled={updating === o.id}
                        onClick={() => runAction(o.id, "approve_print")}
                        className="px-3 py-1.5 rounded-full bg-blue-700 text-white text-xs font-medium disabled:opacity-50"
                      >
                        Release for print
                      </button>
                    )}
                  {o.status !== "cancelled" &&
                    !isCompleted(o.status) && (
                      <button
                        disabled={updating === o.id}
                        onClick={() => runAction(o.id, "cancel")}
                        className="px-3 py-1.5 rounded-full border border-red-200 text-red-600 text-xs font-medium disabled:opacity-50"
                      >
                        Cancel order
                      </button>
                    )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
