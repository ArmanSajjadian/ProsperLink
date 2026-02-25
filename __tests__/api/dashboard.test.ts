import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

import { getServerSession } from "next-auth";
import { GET } from "@/app/api/dashboard/route";

// ─── Shared property fixtures ──────────────────────────────────────────────

const summitProperty = {
  id: "prop-summit",
  slug: "summit-retail-plaza",
  name: "Summit Retail Plaza",
  city: "Denver",
  state: "CO",
  imageUrl: "/images/summit.jpg",
  type: "Commercial",
  tokenPrice: 1.25,
  annualYield: 9.1,
  totalTokens: 2800000,
  status: "FUNDING",
};

const lakesideProperty = {
  id: "prop-lakeside",
  slug: "lakeside-apartments",
  name: "Lakeside Apartments",
  city: "Austin",
  state: "TX",
  imageUrl: "/images/lakeside.jpg",
  type: "Multi-Family",
  tokenPrice: 1.25,
  annualYield: 8.2,
  totalTokens: 680000,
  status: "FUNDING",
};

// ─── TokenHolding fixtures ─────────────────────────────────────────────────
// Ordered newest-first to match Prisma's `orderBy: { purchasedAt: "desc" }`

const summitHolding2 = {
  id: "hold-summit-2",
  tokenCount: 400,
  purchasePrice: 500,
  ownershipPercent: 0.0143,
  purchasedAt: new Date("2026-02-25T10:00:00Z"),
  property: summitProperty,
};

const summitHolding1 = {
  id: "hold-summit-1",
  tokenCount: 80,
  purchasePrice: 100,
  ownershipPercent: 0.0029,
  purchasedAt: new Date("2026-02-24T10:00:00Z"),
  property: summitProperty,
};

const lakesideHolding = {
  id: "hold-lakeside-1",
  tokenCount: 80,
  purchasePrice: 100,
  ownershipPercent: 0.0118,
  purchasedAt: new Date("2026-02-20T10:00:00Z"),
  property: lakesideProperty,
};

// ─── Helper ────────────────────────────────────────────────────────────────

function makeUser(holdings = [summitHolding2, summitHolding1, lakesideHolding], payouts = []) {
  return { tokenHoldings: holdings, payouts };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
});

// ─── Holdings grouping ─────────────────────────────────────────────────────

describe("GET /api/dashboard — holdings grouping", () => {
  it("returns 2 holdings for a user with 3 purchases across 2 properties", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(makeUser() as never);

    const res = await GET();
    const data = await res.json();

    expect(data.holdings).toHaveLength(2);
  });

  it("sums tokenCount for multiple purchases of the same property", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(makeUser() as never);

    const res = await GET();
    const { holdings } = await res.json();
    const summit = holdings.find((h: { propertyId: string }) => h.propertyId === "summit-retail-plaza");

    expect(summit).toBeDefined();
    expect(summit.tokenCount).toBe(480); // 400 + 80
  });

  it("sums currentValue for multiple purchases of the same property", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(makeUser() as never);

    const res = await GET();
    const { holdings } = await res.json();
    const summit = holdings.find((h: { propertyId: string }) => h.propertyId === "summit-retail-plaza");

    expect(summit.currentValue).toBeCloseTo(600); // 480 tokens × $1.25
  });

  it("sums ownershipPercent for multiple purchases of the same property", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(makeUser() as never);

    const res = await GET();
    const { holdings } = await res.json();
    const summit = holdings.find((h: { propertyId: string }) => h.propertyId === "summit-retail-plaza");

    expect(summit.ownershipPercent).toBeCloseTo(0.0172); // 0.0143 + 0.0029
  });

  it("uses the earliest purchasedAt across all purchases for the grouped holding", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(makeUser() as never);

    const res = await GET();
    const { holdings } = await res.json();
    const summit = holdings.find((h: { propertyId: string }) => h.propertyId === "summit-retail-plaza");

    // Earliest Summit purchase was 2026-02-24, not the more recent 2026-02-25
    expect(summit.purchasedAt).toBe("2026-02-24");
  });

  it("does not merge different properties — Lakeside remains its own holding", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(makeUser() as never);

    const res = await GET();
    const { holdings } = await res.json();
    const lakeside = holdings.find((h: { propertyId: string }) => h.propertyId === "lakeside-apartments");

    expect(lakeside).toBeDefined();
    expect(lakeside.tokenCount).toBe(80);
    expect(lakeside.currentValue).toBeCloseTo(100); // 80 × $1.25
  });
});

// ─── Transactions ──────────────────────────────────────────────────────────

describe("GET /api/dashboard — transactions", () => {
  it("returns one transaction per TokenHolding row (not grouped)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(makeUser() as never);

    const res = await GET();
    const { transactions } = await res.json();
    const purchases = transactions.filter((t: { type: string }) => t.type === "PURCHASE");

    expect(purchases).toHaveLength(3);
  });

  it("each purchase transaction includes the property name and token count in its description", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(makeUser() as never);

    const res = await GET();
    const { transactions } = await res.json();
    const purchases = transactions.filter((t: { type: string }) => t.type === "PURCHASE");

    const summitLarge = purchases.find((t: { description: string }) => t.description.includes("400"));
    expect(summitLarge).toBeDefined();
    expect(summitLarge.description).toContain("Summit Retail Plaza");
    expect(summitLarge.description).toContain("400");

    const summitSmall = purchases.find(
      (t: { description: string }) => t.description.includes("80") && t.description.includes("Summit")
    );
    expect(summitSmall).toBeDefined();

    const lakesideTx = purchases.find((t: { description: string }) => t.description.includes("Lakeside"));
    expect(lakesideTx).toBeDefined();
    expect(lakesideTx.description).toContain("80");
  });

  it("transactions are sorted newest-first", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(makeUser() as never);

    const res = await GET();
    const { transactions } = await res.json();

    // The most recent Summit purchase (2026-02-25) should appear before the earlier ones
    const dates = transactions.map((t: { date: string }) => t.date);
    expect(dates[0]).toBe("2026-02-25");
  });
});

// ─── Stats ─────────────────────────────────────────────────────────────────

describe("GET /api/dashboard — stats", () => {
  it("stats.propertiesOwned equals the number of unique properties (not purchases)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(makeUser() as never);

    const res = await GET();
    const { stats } = await res.json();

    expect(stats.propertiesOwned).toBe(2);
  });

  it("stats.totalValue is the sum of all grouped holdings' currentValue", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(makeUser() as never);

    const res = await GET();
    const { stats } = await res.json();

    // Summit grouped: 480 × $1.25 = $600; Lakeside: 80 × $1.25 = $100
    expect(stats.totalValue).toBeCloseTo(700);
  });

  it("holdings array has one entry per property — suitable as pie chart data", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(makeUser() as never);

    const res = await GET();
    const { holdings } = await res.json();

    // Unique propertyIds should equal total holdings count (no duplicates)
    const uniqueIds = new Set(holdings.map((h: { propertyId: string }) => h.propertyId));
    expect(uniqueIds.size).toBe(holdings.length);
    expect(holdings.length).toBe(2);
  });
});
