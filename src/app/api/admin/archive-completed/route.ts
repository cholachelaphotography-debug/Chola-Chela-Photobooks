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

  const result = await prisma.order.updateMany({
    where: {
      status: { in: ["printing_completed", "shipped", "delivered"] },
    },
    data: { status: "archived" },
  });

  return NextResponse.json({
    ok: true,
    archived: result.count,
    message: `Archived ${result.count} completed order(s). Dashboard counters updated.`,
  });
}
