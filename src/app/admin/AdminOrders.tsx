"use client";

import { useState } from "react";
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

export default function AdminOrders({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

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

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center text-stone-500">
        No orders yet.
      </div>
    );
  }

  const awaitingPayment = orders.filter(
    (o) =>
      o.status !== "cancelled" &&
      (o.paymentStatus === "pending" ||
        o.paymentStatus === "awaiting_confirmation")
  );
  const readyToRelease = orders.filter(
    (o) => o.paymentStatus === "paid" && o.status === "payment_confirmed"
  );

  return (
    <div className="space-y-8">
      {awaitingPayment.length > 0 && (
        <section>
          <h2 className="font-semibold text-stone-800 mb-3">
            Awaiting payment confirmation ({awaitingPayment.length})
          </h2>
          <div className="space-y-2">
            {awaitingPayment.map((o) => (
              <div
                key={o.id}
                className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-wrap items-center gap-3 justify-between"
              >
                <div>
                  <div className="font-medium">{o.project.title}</div>
                  <div className="text-xs text-stone-600">
                    {o.user.name} · {formatK(o.amount)} ·{" "}
                    {o.paymentMethod?.replace(/_/g, " ") || "—"} ·{" "}
                    {o.materialName || o.coverType}
                  </div>
                </div>
                <button
                  disabled={updating === o.id}
                  onClick={() => runAction(o.id, "confirm_payment")}
                  className="px-4 py-2 rounded-full bg-green-700 text-white text-sm font-medium hover:bg-green-800 disabled:opacity-50"
                >
                  Confirm payment & issue receipt
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {readyToRelease.length > 0 && (
        <section>
          <h2 className="font-semibold text-stone-800 mb-3">
            Ready to release for printing ({readyToRelease.length})
          </h2>
          <div className="space-y-2">
            {readyToRelease.map((o) => (
              <div
                key={o.id}
                className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-wrap items-center gap-3 justify-between"
              >
                <div>
                  <div className="font-medium">{o.project.title}</div>
                  <div className="text-xs text-stone-600">
                    Paid · {formatK(o.amount)}
                    {o.receiptNumber ? ` · Receipt ${o.receiptNumber}` : ""}
                  </div>
                </div>
                <button
                  disabled={updating === o.id}
                  onClick={() => runAction(o.id, "approve_print")}
                  className="px-4 py-2 rounded-full bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 disabled:opacity-50"
                >
                  Approve & release for printing
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-semibold text-stone-800 mb-3">All orders</h2>
        <div className="space-y-3">
          {orders.map((order) => {
            const isOpen = expanded === order.id;
            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-stone-200 overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-stone-50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {order.project.title}
                    </div>
                    <div className="text-xs text-stone-500">
                      {order.user.name} · {order.user.email}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold">{formatK(order.amount)}</div>
                    <div className="text-xs text-stone-500 capitalize">
                      {order.status.replace(/_/g, " ")} ·{" "}
                      {order.paymentStatus.replace(/_/g, " ")}
                    </div>
                  </div>
                  <span className="text-stone-400 text-sm">
                    {isOpen ? "▲" : "▼"}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-stone-100 p-4 bg-stone-50 space-y-4 text-sm">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-stone-500 mb-1">
                          Specs
                        </div>
                        <div>
                          {order.materialName || "—"} · {order.bookSize} ·{" "}
                          {order.coverType}
                        </div>
                        <div className="text-stone-500">
                          {order.pageCount} pages
                          {order.quantity ? ` · qty ${order.quantity}` : ""}
                        </div>
                        {order.receiptNumber && (
                          <div className="mt-1 font-mono text-xs">
                            Receipt: {order.receiptNumber}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-xs text-stone-500 mb-1">
                          Delivery
                        </div>
                        <div>{order.shippingName}</div>
                        <div>{order.shippingPhone}</div>
                        <div className="text-stone-500">
                          {order.shippingAddress}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(order.paymentStatus === "pending" ||
                        order.paymentStatus === "awaiting_confirmation") && (
                        <button
                          disabled={updating === order.id}
                          onClick={() =>
                            runAction(order.id, "confirm_payment")
                          }
                          className="px-3 py-1.5 rounded-full bg-green-700 text-white text-xs font-medium"
                        >
                          Confirm payment
                        </button>
                      )}
                      {order.paymentStatus === "paid" &&
                        order.status === "payment_confirmed" && (
                          <button
                            disabled={updating === order.id}
                            onClick={() => runAction(order.id, "approve_print")}
                            className="px-3 py-1.5 rounded-full bg-blue-700 text-white text-xs font-medium"
                          >
                            Release for printing
                          </button>
                        )}
                      <Link
                        href={`/admin/books/${order.project.id}`}
                        className="px-3 py-1.5 rounded-full bg-orange-700 text-white text-xs font-medium"
                      >
                        View photo book
                      </Link>
                    </div>

                    <div className="text-xs text-stone-400">
                      {order.id} · {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
