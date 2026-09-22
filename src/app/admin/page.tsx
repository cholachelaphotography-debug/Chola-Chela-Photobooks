import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AdminOrders from "./AdminOrders";
import AdminUsers from "./AdminUsers";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true, email: true },
  });

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-stone-900 mb-2">Access denied</h1>
          <p className="text-stone-500 text-sm mb-6">
            This page is only for administrators.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-5 py-2.5 rounded-full bg-orange-700 text-white text-sm font-medium"
          >
            Back to Studio
          </Link>
        </div>
      </div>
    );
  }

  const [orders, stats] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        project: { select: { id: true, title: true, pageCount: true } },
      },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const totalRevenue = await prisma.order.aggregate({
    where: { paymentStatus: "paid" },
    _sum: { amount: true },
  });

  const statusCounts = Object.fromEntries(
    stats.map((s) => [s.status, s._count])
  );

  // Serialize for client
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
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-orange-700 text-white flex items-center justify-center font-bold text-sm">
                CC
              </div>
              <div>
                <div className="font-semibold text-stone-900 leading-tight">
                  Chola Chela
                </div>
                <div className="text-[10px] uppercase tracking-widest text-orange-700">
                  Admin
                </div>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-stone-600">{user.name}</span>
            <Link
              href="/technician"
              className="text-sm text-stone-500 hover:text-orange-700"
            >
              Technician
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-stone-500 hover:text-orange-700"
            >
              Client Studio
            </Link>
            <Link
              href="/api/auth/signout"
              className="text-sm text-stone-500 hover:text-stone-800"
            >
              Log out
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-6">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <div className="text-2xl font-bold text-stone-900">
              {orders.length}
            </div>
            <div className="text-xs text-stone-500">Total orders</div>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <div className="text-2xl font-bold text-orange-700">
              {statusCounts["pending"] || 0}
            </div>
            <div className="text-xs text-stone-500">Pending</div>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <div className="text-2xl font-bold text-blue-700">
              {(statusCounts["printing"] || 0) + (statusCounts["paid"] || 0)}
            </div>
            <div className="text-xs text-stone-500">In progress</div>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <div className="text-2xl font-bold text-green-700">
              K{((totalRevenue._sum.amount || 0) / 100).toFixed(0)}
            </div>
            <div className="text-xs text-stone-500">Paid revenue</div>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">User management</h2>
          <AdminUsers />
        </section>
        <AdminOrders initialOrders={serializedOrders} />
      </main>
    </div>
  );
}
