import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    include: { branch: { select: { id: true, name: true, code: true } } },
  });

  return NextResponse.json(
    users.map(({ password: _, ...u }) => u)
  );
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { name, email, password, role, branchId } = body;

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Imię, email, hasło i rola są wymagane" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role, branchId: branchId || null, active: true },
      include: { branch: { select: { id: true, name: true, code: true } } },
    });
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Email już istnieje w systemie" }, { status: 400 });
  }
}
