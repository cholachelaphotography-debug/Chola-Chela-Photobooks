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
    <div className="min-h-screen bg-stone-100">
      <div className="bg-orange-800 text-orange-50 text-xs py-1.5">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-between gap-2">
          <span>Chola Chela Photo Book Studio · Kitwe, Zambia</span>
          <span className="opacity-90">Administrator workspace</span>
        </div>
      </div>

      <header className="bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-orange-700 text-white flex items-center justify-center font-bold text-lg shrink-0">
              CC
            </div>
            <div>
              <div className="font-semibold text-stone-900 leading-tight">
                Chola Chela
              </div>
              <div className="text-[10px] uppercase tracking-widest text-orange-700">
                Photo Book Studio · Admin
              </div>
              <div className="text-sm text-stone-600 mt-0.5">
                Signed in as{" "}
                <span className="font-medium text-stone-900">{user.name}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-sm items-center">
            <Link
              href="/technician"
              className="px-3 py-1.5 rounded-full border border-stone-200 text-stone-700 hover:border-orange-400 hover:text-orange-800"
            >
              Print queue
            </Link>
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-full border border-stone-200 text-stone-700 hover:border-orange-400 hover:text-orange-800"
            >
              Client studio
            </Link>
            <Link
              href="/admin/settings"
              className="px-3 py-1.5 rounded-full border border-stone-200 text-stone-700 hover:border-orange-400 hover:text-orange-800 font-medium"
            >
              Settings
            </Link>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="px-3 py-1.5 rounded-full text-stone-500 hover:text-orange-800 hover:bg-orange-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-900">Admin dashboard</h1>
          <p className="text-sm text-stone-500 mt-1">
            Orders, payments, technicians and print production for Chola Chela
            Photo Book Studio.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl border border-orange-200 shadow-sm p-4">
            <div className="text-xs font-medium text-orange-800 mb-1">
              Revenue (paid)
            </div>
            <div className="text-xl font-bold text-stone-900">
              K{((paidRevenue._sum.amount || 0) / 100).toFixed(2)}
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-200 shadow-sm p-4">
            <div className="text-xs font-medium text-amber-800 mb-1">
              Pending payment
            </div>
            <div className="text-xl font-bold text-amber-700">{pendingPayment}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-200 shadow-sm p-4">
            <div className="text-xs font-medium text-blue-800 mb-1">
              In progress
            </div>
            <div className="text-xl font-bold text-blue-700">{inProgress}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-200 shadow-sm p-4">
            <div className="text-xs font-medium text-green-800 mb-1">
              Completed
            </div>
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

      <footer className="border-t border-stone-200 bg-white mt-8">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-xs text-stone-500">
          <span className="font-medium text-stone-700">
            Chola Chela Photography
          </span>
          {" · "}
          Photo Book Studio · Kitwe, Zambia
        </div>
      </footer>
    </div>
  );
}
