import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AdminOrders from "./AdminOrders";
import AdminUsers from "./AdminUsers";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true, email: true },
  });

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-stone-900 mb-2">Access denied</h1>
          <Link
            href="/dashboard"
            className="inline-block mt-4 px-5 py-2.5 rounded-full bg-orange-700 text-white text-sm font-medium"
          >
            Back to Studio
          </Link>
        </div>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      project: { select: { id: true, title: true, pageCount: true } },
    },
  });

  const paidRevenue = await prisma.order.aggregate({
    where: { paymentStatus: "paid" },
    _sum: { amount: true },
  });

  const pendingPayment = orders.filter(
    (o) =>
      o.status !== "cancelled" &&
      (o.paymentStatus === "pending" ||
        o.paymentStatus === "awaiting_confirmation")
  ).length;

  const inProgress = orders.filter((o) =>
    ["approved_for_print", "printing"].includes(o.status)
  ).length;

  const completed = orders.filter((o) =>
    ["printing_completed", "shipped", "delivered"].includes(o.status)
  ).length;

  const serializedOrders = orders.map((o) => ({
    id: o.id,
    amount: o.amount,
    currency: o.currency,
    bookSize: o.bookSize,
    coverType: o.coverType,
    paperType: o.paperType,
    pageCount: o.pageCount,
    quantity: o.quantity,
    materialName: o.materialName,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    receiptNumber: o.receiptNumber,
    paymentConfirmedAt: o.paymentConfirmedAt?.toISOString() ?? null,
    status: o.status,
    shippingName: o.shippingName,
    shippingPhone: o.shippingPhone,
    shippingAddress: o.shippingAddress,
    notes: o.notes,
    createdAt: o.createdAt.toISOString(),
    user: o.user,
    project: o.project,
  }));

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center gap-4">
          <div>
            <div className="font-semibold text-stone-900">{user.name}</div>
            <div className="text-xs text-stone-500">Administrator</div>
          </div>
          <div className="flex gap-4 text-sm">
            <Link href="/technician" className="text-stone-500 hover:text-orange-700">
              Print queue
            </Link>
            <Link href="/dashboard" className="text-stone-500 hover:text-orange-700">
              Client studio
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-6">Admin dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <div className="text-xs text-stone-500 mb-1">Revenue (paid)</div>
            <div className="text-xl font-bold text-stone-900">
              K{((paidRevenue._sum.amount || 0) / 100).toFixed(2)}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <div className="text-xs text-stone-500 mb-1">Pending payment</div>
            <div className="text-xl font-bold text-amber-700">{pendingPayment}</div>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <div className="text-xs text-stone-500 mb-1">In progress</div>
            <div className="text-xl font-bold text-blue-700">{inProgress}</div>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <div className="text-xs text-stone-500 mb-1">Completed</div>
            <div className="text-xl font-bold text-green-700">{completed}</div>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">
            User management
          </h2>
          <AdminUsers />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Orders</h2>
          <AdminOrders initialOrders={serializedOrders} />
        </section>
      </main>
    </div>
  );
}
