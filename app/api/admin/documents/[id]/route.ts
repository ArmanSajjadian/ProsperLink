import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { action, reviewNote } = await req.json();

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  if (action === "reject" && !reviewNote?.trim()) {
    return NextResponse.json(
      { error: "A review note is required when rejecting a document" },
      { status: 400 }
    );
  }

  const document = await prisma.document.update({
    where: { id: params.id },
    data:
      action === "approve"
        ? { status: "APPROVED", reviewedAt: new Date(), reviewNote: null }
        : { status: "REJECTED", reviewedAt: new Date(), reviewNote: reviewNote.trim() },
  });

  return NextResponse.json({ document });
}
