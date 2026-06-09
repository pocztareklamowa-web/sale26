import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year") ? Number(searchParams.get("year")) : new Date().getFullYear();
  const quarter = searchParams.get("quarter") ? Number(searchParams.get("quarter")) : undefined;

  const plans = await prisma.quarterlyPlan.findMany({
    where: { year, ...(quarter ? { quarter } : {}) },
    include: {
      branch: { select: { id: true, name: true, code: true } },
      product: { select: { id: true, name: true, points: true } },
    },
    orderBy: [{ branch: { name: "asc" } }, { product: { name: "asc" } }],
  });
  return NextResponse.json(plans);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { branchId, productId, year, quarter, targetCount } = body;

  if (!branchId || !productId || !year || !quarter) {
    return NextResponse.json({ error: "Wszystkie pola są wymagane" }, { status: 400 });
  }

  const plan = await prisma.quarterlyPlan.upsert({
    where: { branchId_productId_year_quarter: { branchId, productId, year: Number(year), quarter: Number(quarter) } },
    update: { targetCount: Number(targetCount) },
    create: { branchId, productId, year: Number(year), quarter: Number(quarter), targetCount: Number(targetCount) },
    include: {
      branch: { select: { id: true, name: true, code: true } },
      product: { select: { id: true, name: true, points: true } },
    },
  });
  return NextResponse.json(plan, { status: 201 });
}
