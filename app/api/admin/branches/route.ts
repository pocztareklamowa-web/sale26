import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const branches = await prisma.branch.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true } } },
  });
  return NextResponse.json(branches);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { name, code } = body;

  if (!name || !code) {
    return NextResponse.json({ error: "Nazwa i kod są wymagane" }, { status: 400 });
  }

  try {
    const branch = await prisma.branch.create({ data: { name, code: code.toUpperCase() } });
    return NextResponse.json(branch, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Kod placówki już istnieje" }, { status: 400 });
  }
}
