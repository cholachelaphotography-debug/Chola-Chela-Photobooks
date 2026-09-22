import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "admin") return null;
  return session.user.id;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const techs = await prisma.user.findMany({
    where: { role: "technician" },
    select: {
      id: true,
      name: true,
      email: true,
      active: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(techs);
}

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const exists = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (exists) {
    return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  }
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      passwordHash,
      role: "technician",
      active: true,
      mustChangePassword: true,
    },
    select: { id: true, name: true, email: true, active: true },
  });
  return NextResponse.json(user, { status: 201 });
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const { id, active, resetPassword, newPassword } = body as {
    id?: string;
    active?: boolean;
    resetPassword?: boolean;
    newPassword?: string;
  };
  if (!id) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  if (resetPassword) {
    const temp =
      typeof newPassword === "string" && newPassword.length >= 6
        ? newPassword
        : Math.random().toString(36).slice(-8) + "A1";
    const passwordHash = await bcrypt.hash(temp, 10);
    const user = await prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        mustChangePassword: true,
      },
      select: { id: true, name: true, email: true, active: true },
    });
    return NextResponse.json({
      ...user,
      temporaryPassword: temp,
      message: "Password reset. Share the temporary password with the technician.",
    });
  }

  if (typeof active !== "boolean") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const user = await prisma.user.update({
    where: { id },
    data: { active },
    select: { id: true, name: true, email: true, active: true },
  });
  return NextResponse.json(user);
}
