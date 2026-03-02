import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET /api/owner/documents — returns all documents belonging to the authenticated owner's properties
export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const documents = await prisma.document.findMany({
      where: { property: { ownerId: user.id } },
      include: {
        property: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ documents });
  } catch {
    return NextResponse.json({ error: "Failed to fetch documents." }, { status: 500 });
  }
}
