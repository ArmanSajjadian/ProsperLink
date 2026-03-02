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

  const { action, adminComment } = await req.json();

  if (action !== "approve" && action !== "deny") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  if (action === "deny" && !adminComment?.trim()) {
    return NextResponse.json(
      { error: "A comment is required when denying a listing" },
      { status: 400 }
    );
  }

  const property = await prisma.property.update({
    where: { id: params.id },
    data:
      action === "approve"
        ? { status: "FUNDING", adminComment: null }
        : { status: "DRAFT", adminComment: adminComment.trim() },
  });

  return NextResponse.json({ property });
}
