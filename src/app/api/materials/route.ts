import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_MATERIALS } from "@/lib/pricing";
import { z } from "zod";

export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    if (materials.length === 0) {
      return NextResponse.json(DEFAULT_MATERIALS);
    }
    return NextResponse.json(
      materials.map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description || "",
        basePrice: m.basePrice,
      }))
    );
  } catch {
    return NextResponse.json(DEFAULT_MATERIALS);
  }
}

const materialSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  basePrice: z.number().min(0),
  active: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export async function POST(req: Request) {
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
  const body = await req.json();
  const parsed = materialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const created = await prisma.material.create({ data: parsed.data });
  return NextResponse.json(created, { status: 201 });
}
