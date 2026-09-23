import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const completed = await prisma.order.findMany({
    where: {
      status: { in: ["printing_completed", "shipped", "delivered"] },
    },
    select: { id: true, amount: true, paymentStatus: true },
  });

  if (completed.length === 0) {
    return NextResponse.json({
      ok: true,
      archived: 0,
      revenueArchived: 0,
      message: "No completed orders to archive.",
    });
  }

  const paidAmount = completed
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.amount, 0);

  const paidCount = completed.filter((o) => o.paymentStatus === "paid").length;

  await prisma.$transaction([
    prisma.revenueSnapshot.create({
      data: {
        amount: paidAmount,
        orderCount: paidCount,
        note: `Archived ${completed.length} completed order(s) (${paidCount} paid)`,
        createdById: session.user.id,
      },
    }),
    prisma.order.updateMany({
      where: {
        id: { in: completed.map((o) => o.id) },
      },
      data: { status: "archived" },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    archived: completed.length,
    revenueArchived: paidAmount,
    message: `Archived ${completed.length} order(s). K${(paidAmount / 100).toFixed(2)} moved to past revenue.`,
  });
}
