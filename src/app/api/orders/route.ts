import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { calculateOrderAmount, DEFAULT_MATERIALS } from "@/lib/pricing";

const createOrderSchema = z.object({
  projectId: z.string(),
  bookSize: z.enum(["20x20", "25x25", "30x30", "A4"]),
  coverType: z.enum(["softcover", "hardcover", "layflat"]),
  paperType: z.enum(["matte", "lustre", "glossy"]).optional().default("matte"),
  materialId: z.string().optional(),
  materialName: z.string().optional(),
  materialBasePrice: z.number().optional(),
  quantity: z.number().min(1).max(20).default(1),
  paymentChoice: z.enum(["pay_now", "pay_later"]),
  paymentMethod: z.enum(["mastercard", "mobile_money", "pay_later"]).optional(),
  shippingName: z.string().min(2).max(120),
  shippingPhone: z.string().min(9).max(20),
  shippingAddress: z.string().min(5).max(500),
  notes: z.string().max(500).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      project: {
        select: { id: true, title: true, templateId: true, pageCount: true },
      },
      material: true,
    },
  });

  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const project = await prisma.project.findFirst({
      where: { id: data.projectId, userId: session.user.id },
      include: { order: true },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (project.order && project.order.status !== "cancelled") {
      return NextResponse.json(
        { error: "This book already has an active order" },
        { status: 400 }
      );
    }

    let materialBase = data.materialBasePrice ?? 40000;
    let materialName = data.materialName ?? "Standard";
    let materialId: string | null = data.materialId ?? null;

    if (data.materialId) {
      const mat = await prisma.material.findUnique({
        where: { id: data.materialId },
      });
      if (mat) {
        materialBase = mat.basePrice;
        materialName = mat.name;
        materialId = mat.id;
      } else {
        const def = DEFAULT_MATERIALS.find((m) => m.id === data.materialId);
        if (def) {
          materialBase = def.basePrice;
          materialName = def.name;
          materialId = null;
        }
      }
    }

    const amount = calculateOrderAmount({
      materialBasePrice: materialBase,
      bookSize: data.bookSize,
      coverType: data.coverType,
      pageCount: project.pageCount,
      quantity: data.quantity,
    });

    const payLater = data.paymentChoice === "pay_later";
    const paymentMethod = payLater
      ? "pay_later"
      : data.paymentMethod || "mobile_money";

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        projectId: project.id,
        amount,
        currency: "ZMW",
        bookSize: data.bookSize,
        coverType: data.coverType,
        paperType: data.paperType || "matte",
        materialId,
        materialName,
        pageCount: project.pageCount,
        quantity: data.quantity,
        paymentStatus: payLater ? "pending" : "awaiting_confirmation",
        paymentMethod,
        status: "awaiting_payment",
        shippingName: data.shippingName,
        shippingPhone: data.shippingPhone,
        shippingAddress: data.shippingAddress,
        notes: data.notes || null,
      },
    });

    await prisma.project.update({
      where: { id: project.id },
      data: { status: "ordered" },
    });

    return NextResponse.json(
      {
        ...order,
        payLater,
        message: payLater
          ? "Order saved. Pay later — admin will confirm when payment is received."
          : "Order submitted. Complete payment; admin will confirm receipt.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Create order error:", error);
    return NextResponse.json(
      {
        error:
          (error instanceof Error ? error.message : null) ||
          "Failed to create order",
      },
      { status: 500 }
    );
  }
}
