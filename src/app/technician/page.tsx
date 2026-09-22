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
      <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
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
    <div className="min-h-screen bg-stone-100">
      {/* Brand bar */}
      <div className="bg-orange-800 text-orange-50 text-xs py-1.5">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-between gap-2">
          <span>Chola Chela Photo Book Studio · Kitwe, Zambia</span>
          <span className="opacity-90">Production workspace</span>
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
                Photo Book Studio · Technician
              </div>
              <div className="text-sm text-stone-600 mt-0.5">
                Signed in as <span className="font-medium text-stone-900">{user.name}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/technician/settings"
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

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Print production</h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage photo books released for printing by Chola Chela Photo Book
            Studio.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-amber-700">{pending.length}</div>
            <div className="text-xs font-medium text-stone-600 mt-1">
              Photobooks pending
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">
              {inProgress.length}
            </div>
            <div className="text-xs font-medium text-stone-600 mt-1">
              In progress
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-green-700">
              {completed.length}
            </div>
            <div className="text-xs font-medium text-stone-600 mt-1">
              Completed
            </div>
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
          description="Printing finished — visible on the admin dashboard as completed"
          initialOrders={completed}
          emptyText="No completed jobs yet."
        />
      </main>

      <footer className="border-t border-stone-200 bg-white mt-8">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-xs text-stone-500">
          <span className="font-medium text-stone-700">Chola Chela Photography</span>
          {" · "}
          Photo Book Studio · Kitwe, Zambia
          <br />
          <a
            href="https://wa.me/260966080108"
            className="text-orange-700 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp +260 966 080 108
          </a>
        </div>
      </footer>
    </div>
  );
}
