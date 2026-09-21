import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const slotSchema = z.union([
  z.string().nullable(),
  z.object({
    photoId: z.string().nullable(),
    scale: z.number().optional(),
    x: z.number().optional(),
    y: z.number().optional(),
  }),
]);

const updateSchema = z.object({
  pages: z.array(
    z.object({
      pageNum: z.number(),
      slots: z.array(slotSchema),
    })
  ),
  title: z.string().min(1).max(200).optional(),
  coverText: z.string().max(200).optional().nullable(),
  status: z.string().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: {
      projectPhotos: { include: { photo: true } },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(project);
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

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { pages, title, status, coverText } = parsed.data;

    const updated = await prisma.project.update({
      where: { id },
      data: {
        pages: JSON.stringify(pages),
        ...(title ? { title } : {}),
        ...(status ? { status } : {}),
        ...(coverText !== undefined ? { coverText } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("Update project error:", error);
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : null) || "Failed to update project" },
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
  const existing = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: { order: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (
    existing.order &&
    existing.order.status !== "cancelled" &&
    existing.order.paymentStatus === "paid"
  ) {
    return NextResponse.json(
      { error: "Cannot delete a book with a paid order. Cancel with admin help if needed." },
      { status: 400 }
    );
  }
  if (existing.order && existing.order.status !== "cancelled") {
    await prisma.order.update({
      where: { id: existing.order.id },
      data: { status: "cancelled" },
    });
  }
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
