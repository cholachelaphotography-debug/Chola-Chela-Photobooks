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

  if (!user || (user.role !== "technician" && user.role !== "admin") || user.active === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white border rounded-2xl p-8 max-w-md text-center">
          <h1 className="font-bold text-lg mb-2">Technician access only</h1>
          <Link href="/dashboard" className="text-orange-700 text-sm underline">
            Back to Studio
          </Link>
        </div>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: {
      status: { in: ["approved_for_print", "printing", "printing_completed"] },
      paymentStatus: "paid",
    },
    orderBy: { approvedForPrintAt: "asc" },
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

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <div className="font-semibold">Chola Chela · Technician</div>
            <div className="text-xs text-stone-500">{user.name}</div>
          </div>
          <Link href="/dashboard" className="text-sm text-stone-500 hover:text-orange-700">
            Client Studio
          </Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Print queue</h1>
        <p className="text-sm text-stone-500 mb-6">
          Only paid orders released by an administrator appear here.
        </p>
        <TechnicianOrders initialOrders={serialized} />
      </main>
    </div>
  );
}
