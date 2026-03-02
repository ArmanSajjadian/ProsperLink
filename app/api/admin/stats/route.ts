import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession();
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [pendingListings, pendingDocuments, totalUsers, totalProperties] =
    await Promise.all([
      prisma.property.count({ where: { status: "REVIEW" } }),
      prisma.document.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.user.count(),
      prisma.property.count(),
    ]);

  return NextResponse.json({
    pendingListings,
    pendingDocuments,
    totalUsers,
    totalProperties,
  });
}
