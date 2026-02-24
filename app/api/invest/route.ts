import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const { propertyId, tokenCount } = await req.json();

    if (!propertyId || !tokenCount || tokenCount < 1) {
      return NextResponse.json({ error: "Invalid investment data." }, { status: 400 });
    }

    const [user, property] = await Promise.all([
      prisma.user.findUnique({ where: { email: session.user.email } }),
      prisma.property.findUnique({ where: { id: propertyId } }),
    ]);

    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
    if (!property) return NextResponse.json({ error: "Property not found." }, { status: 404 });
    if (property.status !== "FUNDING") {
      return NextResponse.json({ error: "This property is not currently accepting investments." }, { status: 400 });
    }

    const tokensAvailable = property.totalTokens - Math.round(property.fundedAmount / property.tokenPrice);
    if (tokenCount > tokensAvailable) {
      return NextResponse.json({ error: `Only ${tokensAvailable} tokens remaining.` }, { status: 400 });
    }

    const purchasePrice = tokenCount * property.tokenPrice;
    const ownershipPercent = (tokenCount / property.totalTokens) * 100;
    const newFundedAmount = property.fundedAmount + purchasePrice;
    const nowFullyFunded = newFundedAmount >= property.totalValue;

    const [holding] = await prisma.$transaction([
      prisma.tokenHolding.create({
        data: {
          userId: user.id,
          propertyId: property.id,
          tokenCount,
          purchasePrice,
          ownershipPercent,
        },
      }),
      prisma.property.update({
        where: { id: property.id },
        data: {
          fundedAmount: { increment: purchasePrice },
          status: nowFullyFunded ? "FUNDED" : property.status,
        },
      }),
    ]);

    return NextResponse.json({ success: true, holdingId: holding.id, purchasePrice }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
