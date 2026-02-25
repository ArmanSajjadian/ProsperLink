import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET /api/owner/properties — returns all properties belonging to the authenticated owner
export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    if (user.role !== "OWNER" && user.role !== "BOTH") {
      return NextResponse.json({ error: "Only property owners can access this endpoint." }, { status: 403 });
    }

    const properties = await prisma.property.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { tokenHoldings: true } },
      },
    });

    return NextResponse.json(properties);
  } catch {
    return NextResponse.json({ error: "Failed to fetch properties." }, { status: 500 });
  }
}
