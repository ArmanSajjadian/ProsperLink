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

    if (!propertyId || !tokenCount || tokenCount < 1 || !Number.isInteger(tokenCount)) {
      return NextResponse.json({ error: "Invalid sell data." }, { status: 400 });
    }

    const [user, property] = await Promise.all([
      prisma.user.findUnique({ where: { email: session.user.email } }),
      prisma.property.findUnique({ where: { slug: propertyId } }),
    ]);

    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
    if (!property) return NextResponse.json({ error: "Property not found." }, { status: 404 });

    if (property.status === "DRAFT" || property.status === "CLOSED") {
      return NextResponse.json({ error: "Tokens cannot be sold for this property." }, { status: 400 });
    }

    const holdings = await prisma.tokenHolding.findMany({
      where: { userId: user.id, propertyId: property.id },
      orderBy: { purchasedAt: "asc" },
    });

    const totalOwned = holdings.reduce((s, h) => s + h.tokenCount, 0);
    if (tokenCount > totalOwned) {
      return NextResponse.json({ error: `You only own ${totalOwned} tokens for this property.` }, { status: 400 });
    }

    const saleProceeds = tokenCount * property.tokenPrice;
    const newFundedAmount = property.fundedAmount - saleProceeds;
    const newStatus =
      property.status === "FUNDED" && newFundedAmount < property.totalValue
        ? "FUNDING"
        : property.status;

    await prisma.$transaction(async (tx) => {
      // FIFO reduction of TokenHolding rows
      let remaining = tokenCount;
      for (const holding of holdings) {
        if (remaining <= 0) break;
        if (holding.tokenCount <= remaining) {
          await tx.tokenHolding.delete({ where: { id: holding.id } });
          remaining -= holding.tokenCount;
        } else {
          const ratio = (holding.tokenCount - remaining) / holding.tokenCount;
          await tx.tokenHolding.update({
            where: { id: holding.id },
            data: {
              tokenCount: holding.tokenCount - remaining,
              purchasePrice: holding.purchasePrice * ratio,
              ownershipPercent: holding.ownershipPercent * ratio,
            },
          });
          remaining = 0;
        }
      }

      // Record sale proceeds as Payout
      await tx.payout.create({
        data: {
          userId: user.id,
          propertyId: property.id,
          amount: saleProceeds,
          type: "SALE_PROCEEDS",
          status: "COMPLETED",
          paidAt: new Date(),
        },
      });

      // Update property fundedAmount and conditionally revert status
      await tx.property.update({
        where: { id: property.id },
        data: {
          fundedAmount: { decrement: saleProceeds },
          status: newStatus,
        },
      });

      // Credit sale proceeds to user's wallet
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { increment: saleProceeds } },
      });
    });

    return NextResponse.json({ success: true, saleProceeds }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
