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

  // Build holdings — group by property so multiple purchases of the same
  // property appear as a single aggregated card (tokenCount, value, income summed;
  // purchasedAt = earliest purchase date). Keyed on the Prisma property PK.
  const holdingMap = new Map<string, {
    id: string; propertyId: string; propertyName: string; propertyCity: string;
    propertyState: string; propertyImage: string; propertyType: string;
    tokenCount: number; tokenPrice: number; currentValue: number;
    ownershipPercent: number; annualYield: number; monthlyIncome: number;
    purchasedAt: string; status: "FUNDING" | "FUNDED" | "ACTIVE";
  }>();

  for (const h of user.tokenHoldings) {
    const currentValue = h.tokenCount * h.property.tokenPrice;
    const monthlyIncome = (currentValue * (h.property.annualYield / 100)) / 12;
    const purchasedAt = h.purchasedAt.toISOString().split("T")[0];

    const existing = holdingMap.get(h.property.id);
    if (existing) {
      existing.tokenCount += h.tokenCount;
      existing.currentValue += currentValue;
      existing.monthlyIncome += monthlyIncome;
      existing.ownershipPercent += h.ownershipPercent;
      if (purchasedAt < existing.purchasedAt) existing.purchasedAt = purchasedAt;
    } else {
      holdingMap.set(h.property.id, {
        id: h.property.slug,
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
        purchasedAt,
        status: h.property.status as "FUNDING" | "FUNDED" | "ACTIVE",
      });
    }
  }

  const holdings = Array.from(holdingMap.values());

  // Portfolio stats
  const totalInvested = user.tokenHoldings.reduce((s, h) => s + h.purchasePrice, 0);
  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  const monthlyIncome = holdings.reduce((s, h) => s + h.monthlyIncome, 0);
  const annualProjected = monthlyIncome * 12;
  const uniqueProperties = holdings.length;
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

  // Transactions: payouts + sales
  const payoutTransactions = user.payouts.map((p) => {
    const isSale = p.type === "SALE_PROCEEDS";
    return {
      id: `payout-${p.id}`,
      date: (p.paidAt ?? p.createdAt).toISOString().split("T")[0],
      type: isSale ? ("SALE" as const) : ("PAYOUT" as const),
      description: isSale
        ? `Token Sale — ${p.property.name}`
        : `Rental Income — ${p.property.name}`,
      amount: p.amount,
      status: p.status as "COMPLETED" | "SCHEDULED",
      sign: "+" as const,
    };
  });

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
      walletBalance: user.walletBalance,
    },
    earningsChart: earningsChartWithCumulative,
  });
}
