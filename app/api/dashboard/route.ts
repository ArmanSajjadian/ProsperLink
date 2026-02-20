import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      tokenHoldings: {
        include: { property: true },
        orderBy: { purchasedAt: "desc" },
      },
      payouts: {
        include: { property: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  // Build holdings
  const holdings = user.tokenHoldings.map((h) => {
    const currentValue = h.tokenCount * h.property.tokenPrice;
    const monthlyIncome = (currentValue * (h.property.annualYield / 100)) / 12;
    return {
      id: h.id,
      propertyId: h.property.slug,
      propertyName: h.property.name,
      propertyCity: h.property.city,
      propertyState: h.property.state,
      propertyImage: h.property.imageUrl,
      propertyType: h.property.type,
      tokenCount: h.tokenCount,
      tokenPrice: h.property.tokenPrice,
      currentValue,
      ownershipPercent: h.ownershipPercent,
      annualYield: h.property.annualYield,
      monthlyIncome,
      purchasedAt: h.purchasedAt.toISOString().split("T")[0],
      status: h.property.status as "FUNDING" | "FUNDED" | "ACTIVE",
    };
  });

  // Portfolio stats
  const totalInvested = user.tokenHoldings.reduce((s, h) => s + h.purchasePrice, 0);
  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  const monthlyIncome = holdings.reduce((s, h) => s + h.monthlyIncome, 0);
  const annualProjected = monthlyIncome * 12;
  const uniqueProperties = new Set(user.tokenHoldings.map((h) => h.propertyId)).size;
  const totalPayoutsReceived = user.payouts
    .filter((p) => p.status === "COMPLETED")
    .reduce((s, p) => s + p.amount, 0);

  // Transactions: token purchases
  const purchaseTransactions = user.tokenHoldings.map((h) => ({
    id: `buy-${h.id}`,
    date: h.purchasedAt.toISOString().split("T")[0],
    type: "PURCHASE" as const,
    description: `Token Purchase — ${h.property.name} (${h.tokenCount.toLocaleString()} tokens @ $${h.property.tokenPrice.toFixed(2)})`,
    amount: h.purchasePrice,
    status: "COMPLETED" as const,
    sign: "-" as const,
  }));

  // Transactions: payouts
  const payoutTransactions = user.payouts.map((p) => ({
    id: `payout-${p.id}`,
    date: (p.paidAt ?? p.createdAt).toISOString().split("T")[0],
    type: "PAYOUT" as const,
    description: `Rental Income — ${p.property.name}`,
    amount: p.amount,
    status: p.status as "COMPLETED" | "SCHEDULED",
    sign: "+" as const,
  }));

  const transactions = [...purchaseTransactions, ...payoutTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Earnings chart: last 6 months
  const now = new Date();
  const earningsChart = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const month = d.toLocaleString("en-US", { month: "short" });
    // Holdings purchased before the end of this month
    const activeHoldings = user.tokenHoldings.filter(
      (h) => new Date(h.purchasedAt) <= new Date(d.getFullYear(), d.getMonth() + 1, 0)
    );
    const income = activeHoldings.reduce((s, h) => {
      const cv = h.tokenCount * h.property.tokenPrice;
      return s + (cv * (h.property.annualYield / 100)) / 12;
    }, 0);
    return { month, income };
  });

  // Compute cumulative
  let cumulative = 0;
  const earningsChartWithCumulative = earningsChart.map((e) => {
    cumulative += e.income;
    return { ...e, cumulative };
  });

  return NextResponse.json({
    holdings,
    transactions,
    stats: {
      totalValue,
      totalInvested,
      monthlyIncome,
      annualProjected,
      propertiesOwned: uniqueProperties,
      totalPayoutsReceived,
    },
    earningsChart: earningsChartWithCumulative,
  });
}
