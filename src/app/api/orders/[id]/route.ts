import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  status: z
    .enum([
      "submitted",
      "awaiting_payment",
      "payment_confirmed",
      "approved_for_print",
      "printing",
      "printing_completed",
      "shipped",
      "delivered",
      "cancelled",
    ])
    .optional(),
  paymentStatus: z
    .enum(["pending", "awaiting_confirmation", "paid", "failed", "refunded"])
    .optional(),
  paymentMethod: z.string().optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
  action: z
    .enum([
      "confirm_payment",
      "approve_print",
      "start_print",
      "complete_print",
      "cancel",
    ])
    .optional(),
});

function receiptNumber() {
  const d = new Date();
  const y = d.getFullYear().toString().slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const r = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CC-${y}${m}-${r}`;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isAdmin = user.role === "admin";
    const isTech = user.role === "technician";
    const isOwner = existing.userId === user.id;

    // Client cancel unpaid only
    if (parsed.data.action === "cancel") {
      if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const unpaid =
        existing.paymentStatus === "pending" ||
        existing.paymentStatus === "awaiting_confirmation";
      const notProcessing = ![
        "approved_for_print",
        "printing",
        "printing_completed",
        "shipped",
        "delivered",
      ].includes(existing.status);

      if (!isAdmin && !(unpaid && notProcessing)) {
        return NextResponse.json(
          {
            error:
              "Only unpaid orders that are not in production can be cancelled",
          },
          { status: 400 }
        );
      }

      const updated = await prisma.order.update({
        where: { id },
        data: { status: "cancelled", paymentStatus: existing.paymentStatus },
      });
      await prisma.project.update({
        where: { id: existing.projectId },
        data: { status: "draft" },
      });
      return NextResponse.json(updated);
    }

    // Admin: confirm payment
    if (parsed.data.action === "confirm_payment") {
      if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const updated = await prisma.order.update({
        where: { id },
        data: {
          paymentStatus: "paid",
          status: "payment_confirmed",
          paymentConfirmedAt: new Date(),
          paymentConfirmedById: user.id,
          receiptNumber: existing.receiptNumber || receiptNumber(),
        },
      });
      return NextResponse.json(updated);
    }

    // Admin: approve for print
    if (parsed.data.action === "approve_print") {
      if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (existing.paymentStatus !== "paid") {
        return NextResponse.json(
          { error: "Payment must be confirmed before releasing for print" },
          { status: 400 }
        );
      }
      const updated = await prisma.order.update({
        where: { id },
        data: {
          status: "approved_for_print",
          approvedForPrintAt: new Date(),
          approvedById: user.id,
        },
      });
      return NextResponse.json(updated);
    }

    // Technician: start / complete print
    if (parsed.data.action === "start_print" || parsed.data.action === "complete_print") {
      if (!isTech && !isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (
        existing.status !== "approved_for_print" &&
        existing.status !== "printing"
      ) {
        return NextResponse.json(
          { error: "Order is not released for printing" },
          { status: 400 }
        );
      }
      if (parsed.data.action === "start_print") {
        const updated = await prisma.order.update({
          where: { id },
          data: { status: "printing", printStartedAt: new Date() },
        });
        return NextResponse.json(updated);
      }
      const updated = await prisma.order.update({
        where: { id },
        data: {
          status: "printing_completed",
          printCompletedAt: new Date(),
        },
      });
      return NextResponse.json(updated);
    }

    // Generic admin status updates
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
        ...(parsed.data.paymentStatus
          ? { paymentStatus: parsed.data.paymentStatus }
          : {}),
        ...(parsed.data.trackingNumber
          ? { trackingNumber: parsed.data.trackingNumber }
          : {}),
        ...(parsed.data.notes ? { notes: parsed.data.notes } : {}),
      },
    });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("Update order error:", error);
    return NextResponse.json(
      {
        error:
          (error instanceof Error ? error.message : null) ||
          "Failed to update order",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const unpaid =
    existing.paymentStatus === "pending" ||
    existing.paymentStatus === "awaiting_confirmation";
  if (!unpaid || existing.status === "cancelled") {
    return NextResponse.json(
      { error: "Only unpaid active orders can be deleted this way" },
      { status: 400 }
    );
  }
  await prisma.order.update({
    where: { id },
    data: { status: "cancelled" },
  });
  return NextResponse.json({ ok: true });
}
