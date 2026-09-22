import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import TechnicianOrders from "./TechnicianOrders";

export default async function TechnicianPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true, active: true, mustChangePassword: true },
  });

  if (user?.mustChangePassword) {
    redirect("/change-password");
  }

  if (
    !user ||
    (user.role !== "technician" && user.role !== "admin") ||
    user.active === false
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white border rounded-2xl p-8 max-w-md text-center">
          <h1 className="font-bold text-lg mb-2">Technician access only</h1>
          <Link href="/login" className="text-orange-700 text-sm underline">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: {
      status: {
        in: ["approved_for_print", "printing", "printing_completed"],
      },
      paymentStatus: "paid",
    },
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      project: { select: { id: true, title: true, pageCount: true } },
    },
  });

  const serialized = orders.map((o) => ({
    id: o.id,
    amount: o.amount,
    bookSize: o.bookSize,
    coverType: o.coverType,
    materialName: o.materialName,
    pageCount: o.pageCount,
    status: o.status,
    shippingName: o.shippingName,
    shippingPhone: o.shippingPhone,
    createdAt: o.createdAt.toISOString(),
    user: o.user,
    project: o.project,
  }));

  const pending = serialized.filter((o) => o.status === "approved_for_print");
  const inProgress = serialized.filter((o) => o.status === "printing");
  const completed = serialized.filter(
    (o) => o.status === "printing_completed"
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center gap-4">
          <div>
            <div className="font-semibold text-stone-900 text-lg">
              {user.name}
            </div>
            <div className="text-xs text-stone-500">Technician dashboard</div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/technician/settings"
              className="text-stone-600 hover:text-orange-700 font-medium"
            >
              Settings
            </Link>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-stone-500 hover:text-orange-700"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
            <div className="text-2xl font-bold text-amber-700">{pending.length}</div>
            <div className="text-xs text-stone-500 mt-1">Pending</div>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">
              {inProgress.length}
            </div>
            <div className="text-xs text-stone-500 mt-1">In progress</div>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-700">
              {completed.length}
            </div>
            <div className="text-xs text-stone-500 mt-1">Completed</div>
          </div>
        </div>

        <TechnicianOrders
          title="Photobooks pending"
          description="Released by admin — ready to start printing"
          initialOrders={pending}
          emptyText="No pending photo books."
        />
        <TechnicianOrders
          title="Photobooks in progress"
          description="Currently being printed"
          initialOrders={inProgress}
          emptyText="No jobs in progress."
        />
        <TechnicianOrders
          title="Photobooks completed"
          description="Printing finished"
          initialOrders={completed}
          emptyText="No completed jobs yet."
        />
      </main>
    </div>
  );
}
