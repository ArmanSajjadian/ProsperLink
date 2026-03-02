import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const properties = await prisma.property.findMany({
    where: status ? { status } : undefined,
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { documents: true, tokenHoldings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ properties });
}
