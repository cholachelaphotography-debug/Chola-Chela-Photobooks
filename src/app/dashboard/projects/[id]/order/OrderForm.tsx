"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  calculateOrderAmount,
  formatKwacha,
  SHIPPING_NOTICE,
  DEFAULT_MATERIALS,
  type MaterialOption,
} from "@/lib/pricing";

const SIZES = [
  { id: "20x20", label: "20 × 20 cm" },
  { id: "25x25", label: "25 × 25 cm" },
  { id: "30x30", label: "30 × 30 cm" },
  { id: "A4", label: "A4 (21 × 29.7 cm)" },
];

const COVERS = [
  { id: "softcover", label: "Softcover", extra: 0 },
  { id: "hardcover", label: "Hardcover", extra: 150 },
  { id: "layflat", label: "Layflat", extra: 250 },
];

export default function OrderForm({
  project,
  userName,
}: {
  project: {
    id: string;
    title: string;
    pageCount: number;
    templateName: string;
    hasOrder: boolean;
    existingOrder: {
      id: string;
      amount: number;
      status: string;
      paymentStatus: string;
      bookSize: string;
      coverType: string;
      materialName?: string | null;
      receiptNumber?: string | null;
      paymentMethod?: string | null;
    } | null;
  };
  userName: string;
}) {
  const [materials, setMaterials] = useState<MaterialOption[]>(DEFAULT_MATERIALS);
  const [materialId, setMaterialId] = useState(DEFAULT_MATERIALS[0].id);
  const [bookSize, setBookSize] = useState("25x25");
  const [coverType, setCoverType] = useState("hardcover");
  const [quantity, setQuantity] = useState(1);
  const [paymentChoice, setPaymentChoice] = useState<"pay_now" | "pay_later">(
    "pay_later"
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "mastercard" | "mobile_money"
  >("mobile_money");
  const [shippingName, setShippingName] = useState(userName);
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    payLater: boolean;
    amount: number;
    orderId: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/materials")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          setMaterials(data);
          setMaterialId(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const selectedMaterial =
    materials.find((m) => m.id === materialId) || materials[0];

  const total = calculateOrderAmount({
    materialBasePrice: selectedMaterial?.basePrice ?? 40000,
    bookSize,
    coverType,
    pageCount: project.pageCount,
    quantity,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          bookSize,
          coverType,
          paperType: "matte",
          materialId: selectedMaterial.id,
          materialName: selectedMaterial.name,
          materialBasePrice: selectedMaterial.basePrice,
          quantity,
          paymentChoice,
          paymentMethod:
            paymentChoice === "pay_later" ? "pay_later" : paymentMethod,
          shippingName,
          shippingPhone,
          shippingAddress,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to place order");
        setLoading(false);
        return;
      }
      setSuccess({
        payLater: paymentChoice === "pay_later",
        amount: data.amount,
        orderId: data.id,
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function cancelOrder(orderId: string) {
    if (!confirm("Cancel this unpaid order?")) return;
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    if (res.ok) window.location.href = "/dashboard";
    else {
      const data = await res.json();
      alert(data.error || "Could not cancel");
    }
  }

  if (project.hasOrder && project.existingOrder) {
    const order = project.existingOrder;
    const canCancel =
      (order.paymentStatus === "pending" ||
        order.paymentStatus === "awaiting_confirmation") &&
      order.status !== "cancelled" &&
      !["approved_for_print", "printing", "printing_completed"].includes(
        order.status
      );

    return (
      <div className="min-h-screen bg-stone-50">
        <header className="bg-white border-b border-stone-200">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <Link
              href={`/dashboard/projects/${project.id}`}
              className="text-sm text-stone-500 hover:text-orange-700"
            >
              ← Back to book
            </Link>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl border border-stone-200 p-8">
            <h1 className="text-2xl font-bold text-stone-900 mb-4">
              Existing order
            </h1>
            <div className="space-y-2 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-stone-500">Status</span>
                <span className="capitalize font-medium">
                  {order.status.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Payment</span>
                <span className="capitalize">
                  {order.paymentStatus.replace(/_/g, " ")}
                </span>
              </div>
              {order.materialName && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Material</span>
                  <span>{order.materialName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-500">Amount</span>
                <span className="font-semibold">
                  {formatKwacha(order.amount)}
                </span>
              </div>
              {order.receiptNumber && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Receipt</span>
                  <span className="font-mono text-xs">{order.receiptNumber}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-stone-500 mb-6">{SHIPPING_NOTICE}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-full bg-orange-700 text-white text-sm font-medium"
              >
                Back to Studio
              </Link>
              {canCancel && (
                <button
                  type="button"
                  onClick={() => cancelOrder(order.id)}
                  className="px-5 py-2.5 rounded-full border border-red-300 text-red-700 text-sm font-medium hover:bg-red-50"
                >
                  Cancel order
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-stone-50">
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl border border-stone-200 p-8">
            <div className="text-5xl mb-4">{success.payLater ? "📋" : "💳"}</div>
            <h1 className="text-2xl font-bold text-stone-900 mb-2">
              {success.payLater
                ? "Order saved — pay later"
                : "Order submitted — payment pending confirmation"}
            </h1>
            <p className="text-stone-500 mb-2">
              “{project.title}” · {formatKwacha(success.amount)}
            </p>
            <p className="text-sm text-stone-500 mb-4">
              {success.payLater
                ? "Your order is awaiting payment. An administrator will confirm once payment is received. It will not go to printing until payment is confirmed and approved."
                : paymentMethod === "mobile_money"
                  ? "Please complete Mobile Money payment using the details we share with you. An administrator must confirm receipt before the order is approved for printing."
                  : "Please complete Mastercard payment. An administrator must confirm receipt before the order is approved for printing."}
            </p>
            <p className="text-xs text-stone-500 mb-8">{SHIPPING_NOTICE}</p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-2.5 rounded-full bg-orange-700 text-white font-medium"
            >
              Back to Studio
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between">
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="text-sm text-stone-500 hover:text-orange-700"
          >
            ← Back to editor
          </Link>
          <span className="text-sm text-stone-500">{userName}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Order Photo Book</h1>
        <p className="text-stone-500 mb-6">
          “{project.title}” · {project.templateName} · {project.pageCount} pages
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Material */}
          <section className="bg-white rounded-2xl border border-stone-200 p-5">
            <h2 className="font-semibold text-stone-800 mb-3">Material</h2>
            <div className="space-y-2">
              {materials.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                    materialId === m.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-stone-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="material"
                      checked={materialId === m.id}
                      onChange={() => setMaterialId(m.id)}
                      className="accent-orange-600"
                    />
                    <div>
                      <div className="font-medium text-sm">{m.name}</div>
                      <div className="text-xs text-stone-500">{m.description}</div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">
                    from {formatKwacha(m.basePrice)}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Size */}
          <section className="bg-white rounded-2xl border border-stone-200 p-5">
            <h2 className="font-semibold text-stone-800 mb-3">Book size</h2>
            <div className="grid grid-cols-2 gap-2">
              {SIZES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setBookSize(s.id)}
                  className={`text-left p-3 rounded-xl border text-sm ${
                    bookSize === s.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-stone-200"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          {/* Cover */}
          <section className="bg-white rounded-2xl border border-stone-200 p-5">
            <h2 className="font-semibold text-stone-800 mb-3">Cover type</h2>
            <div className="space-y-2">
              {COVERS.map((c) => (
                <label
                  key={c.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                    coverType === c.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-stone-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="cover"
                      checked={coverType === c.id}
                      onChange={() => setCoverType(c.id)}
                      className="accent-orange-600"
                    />
                    <span className="font-medium text-sm">{c.label}</span>
                  </div>
                  <span className="text-xs text-stone-500">
                    {c.extra === 0 ? "Included" : `+K${c.extra}`}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Quantity */}
          <section className="bg-white rounded-2xl border border-stone-200 p-5">
            <h2 className="font-semibold text-stone-800 mb-3">Quantity</h2>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-full border border-stone-300"
              >
                −
              </button>
              <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                className="w-10 h-10 rounded-full border border-stone-300"
              >
                +
              </button>
            </div>
          </section>

          {/* Delivery */}
          <section className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
            <h2 className="font-semibold text-stone-800">Delivery details</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Full name</label>
              <input
                required
                value={shippingName}
                onChange={(e) => setShippingName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                required
                type="tel"
                value={shippingPhone}
                onChange={(e) => setShippingPhone(e.target.value)}
                placeholder="e.g. 0977123456"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                required
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows={3}
                placeholder="Street, area, Kitwe or other city"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 outline-none focus:border-orange-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes (optional)</label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 outline-none focus:border-orange-500"
              />
            </div>
          </section>

          {/* Pay now / later */}
          <section className="bg-white rounded-2xl border border-stone-200 p-5">
            <h2 className="font-semibold text-stone-800 mb-3">Payment</h2>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setPaymentChoice("pay_now")}
                className={`p-3 rounded-xl border text-sm font-medium ${
                  paymentChoice === "pay_now"
                    ? "border-orange-500 bg-orange-50"
                    : "border-stone-200"
                }`}
              >
                Pay Now
              </button>
              <button
                type="button"
                onClick={() => setPaymentChoice("pay_later")}
                className={`p-3 rounded-xl border text-sm font-medium ${
                  paymentChoice === "pay_later"
                    ? "border-orange-500 bg-orange-50"
                    : "border-stone-200"
                }`}
              >
                Pay Later
              </button>
            </div>

            {paymentChoice === "pay_now" && (
              <div className="space-y-2">
                <p className="text-xs text-stone-500 mb-2">
                  Choose a payment method. An administrator must confirm receipt
                  before the order is released for printing.
                </p>
                <label
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${
                    paymentMethod === "mobile_money"
                      ? "border-orange-500 bg-orange-50"
                      : "border-stone-200"
                  }`}
                >
                  <input
                    type="radio"
                    checked={paymentMethod === "mobile_money"}
                    onChange={() => setPaymentMethod("mobile_money")}
                    className="accent-orange-600"
                  />
                  <span className="text-sm font-medium">Mobile Money</span>
                </label>
                <label
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${
                    paymentMethod === "mastercard"
                      ? "border-orange-500 bg-orange-50"
                      : "border-stone-200"
                  }`}
                >
                  <input
                    type="radio"
                    checked={paymentMethod === "mastercard"}
                    onChange={() => setPaymentMethod("mastercard")}
                    className="accent-orange-600"
                  />
                  <span className="text-sm font-medium">Mastercard</span>
                </label>
              </div>
            )}
            {paymentChoice === "pay_later" && (
              <p className="text-xs text-stone-500">
                Your order will be saved with pending payment. It will not be
                printed until payment is confirmed by an administrator.
              </p>
            )}
          </section>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-stone-200 p-5 sticky bottom-4 shadow-lg">
            <div className="flex justify-between mb-1">
              <span className="text-stone-600">Material</span>
              <span className="text-sm">{selectedMaterial?.name}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-stone-600">Total (printing)</span>
              <span className="text-2xl font-bold">{formatKwacha(total)}</span>
            </div>
            <p className="text-xs text-amber-800 bg-amber-50 rounded-lg px-3 py-2 mb-4">
              {SHIPPING_NOTICE}
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-orange-700 text-white font-semibold hover:bg-orange-800 disabled:opacity-60"
            >
              {loading
                ? "Placing order..."
                : paymentChoice === "pay_now"
                  ? "Place order & proceed to payment"
                  : "Place order (pay later)"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
