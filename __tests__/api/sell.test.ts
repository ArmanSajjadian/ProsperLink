import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    property: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    tokenHolding: {
      findMany: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
    payout: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

import { getServerSession } from "next-auth";
import { POST } from "@/app/api/sell/route";

const mockUser = { id: "user-1", name: "Test Investor", email: "investor@test.com", walletBalance: 0 };

const mockProperty = {
  id: "prop-lakeside",
  slug: "lakeside-apartments",
  name: "Lakeside Apartments",
  totalValue: 850000,
  totalTokens: 680000,
  tokenPrice: 1.25,
  fundedAmount: 637500,
  status: "FUNDING",
};

const holdingOld = {
  id: "hold-1",
  tokenCount: 200,
  purchasePrice: 250,
  ownershipPercent: 0.029412,
  purchasedAt: new Date("2026-01-01"),
};

const holdingNew = {
  id: "hold-2",
  tokenCount: 300,
  purchasePrice: 375,
  ownershipPercent: 0.044118,
  purchasedAt: new Date("2026-02-01"),
};

function makeRequest(body: object) {
  return new Request("http://localhost/api/sell", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  // Default: interactive $transaction executes the callback
  vi.mocked(prisma.$transaction).mockImplementation(async (fn) => {
    if (typeof fn === "function") return fn(prisma as never);
    return fn;
  });
});

describe("POST /api/sell", () => {
  // ---- Authentication ----
  it("returns 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const res = await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 100 }));

    expect(res.status).toBe(401);
  });

  // ---- Input validation ----
  it("returns 400 when tokenCount is 0", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);

    const res = await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 0 }));

    expect(res.status).toBe(400);
  });

  it("returns 400 when tokenCount is negative", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);

    const res = await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: -10 }));

    expect(res.status).toBe(400);
  });

  it("returns 400 when tokenCount is a non-integer", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);

    const res = await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 1.5 }));

    expect(res.status).toBe(400);
  });

  it("returns 400 when propertyId is missing", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);

    const res = await POST(makeRequest({ tokenCount: 100 }));

    expect(res.status).toBe(400);
  });

  // ---- Entity resolution ----
  it("returns 404 when user is not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);
    vi.mocked(prisma.property.findUnique).mockResolvedValue(mockProperty as never);

    const res = await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 100 }));

    expect(res.status).toBe(404);
  });

  it("returns 404 when property is not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findUnique).mockResolvedValue(null as never);

    const res = await POST(makeRequest({ propertyId: "nonexistent", tokenCount: 100 }));

    expect(res.status).toBe(404);
  });

  // ---- Status guard ----
  it("returns 400 when property status is DRAFT", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findUnique).mockResolvedValue({ ...mockProperty, status: "DRAFT" } as never);

    const res = await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 100 }));

    expect(res.status).toBe(400);
  });

  it("returns 400 when property status is CLOSED", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findUnique).mockResolvedValue({ ...mockProperty, status: "CLOSED" } as never);

    const res = await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 100 }));

    expect(res.status).toBe(400);
  });

  it("allows selling from FUNDING status", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findUnique).mockResolvedValue({ ...mockProperty, status: "FUNDING" } as never);
    vi.mocked(prisma.tokenHolding.findMany).mockResolvedValue([holdingOld] as never);

    const res = await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 100 }));

    expect(res.status).toBe(200);
  });

  it("allows selling from FUNDED status", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findUnique).mockResolvedValue({
      ...mockProperty,
      status: "FUNDED",
      fundedAmount: 850000,
    } as never);
    vi.mocked(prisma.tokenHolding.findMany).mockResolvedValue([holdingOld] as never);

    const res = await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 100 }));

    expect(res.status).toBe(200);
  });

  it("allows selling from ACTIVE status", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findUnique).mockResolvedValue({ ...mockProperty, status: "ACTIVE" } as never);
    vi.mocked(prisma.tokenHolding.findMany).mockResolvedValue([holdingOld] as never);

    const res = await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 100 }));

    expect(res.status).toBe(200);
  });

  // ---- Holdings validation ----
  it("returns 400 when user has no holdings for the property", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findUnique).mockResolvedValue(mockProperty as never);
    vi.mocked(prisma.tokenHolding.findMany).mockResolvedValue([] as never);

    const res = await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 100 }));

    expect(res.status).toBe(400);
  });

  it("returns 400 when tokenCount exceeds total owned tokens", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findUnique).mockResolvedValue(mockProperty as never);
    // User owns 200 tokens total
    vi.mocked(prisma.tokenHolding.findMany).mockResolvedValue([holdingOld] as never);

    // Requesting 300 tokens (more than 200 owned)
    const res = await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 300 }));

    expect(res.status).toBe(400);
  });

  // ---- FIFO reduction ----
  it("deletes oldest holding when it is fully consumed", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findUnique).mockResolvedValue(mockProperty as never);
    vi.mocked(prisma.tokenHolding.findMany).mockResolvedValue([holdingOld, holdingNew] as never);

    // Selling exactly 200 tokens — should delete holdingOld entirely, leave holdingNew untouched
    await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 200 }));

    expect(prisma.tokenHolding.delete).toHaveBeenCalledWith({ where: { id: "hold-1" } });
    expect(prisma.tokenHolding.update).not.toHaveBeenCalled();
  });

  it("partially updates oldest holding when partially consumed", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findUnique).mockResolvedValue(mockProperty as never);
    vi.mocked(prisma.tokenHolding.findMany).mockResolvedValue([holdingOld] as never);

    // Selling 100 of 200 tokens from holdingOld → ratio = (200-100)/200 = 0.5
    await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 100 }));

    expect(prisma.tokenHolding.update).toHaveBeenCalledWith({
      where: { id: "hold-1" },
      data: {
        tokenCount: 100,
        purchasePrice: 250 * 0.5,   // 125
        ownershipPercent: 0.029412 * 0.5,
      },
    });
    expect(prisma.tokenHolding.delete).not.toHaveBeenCalled();
  });

  it("deletes first holding and partially updates second for cross-boundary sale", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findUnique).mockResolvedValue(mockProperty as never);
    vi.mocked(prisma.tokenHolding.findMany).mockResolvedValue([holdingOld, holdingNew] as never);

    // Selling 250 tokens: consume all 200 from holdingOld, then 50 from holdingNew
    // holdingNew ratio = (300-50)/300 = 250/300
    await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 250 }));

    expect(prisma.tokenHolding.delete).toHaveBeenCalledWith({ where: { id: "hold-1" } });
    const ratio = 250 / 300;
    expect(prisma.tokenHolding.update).toHaveBeenCalledWith({
      where: { id: "hold-2" },
      data: {
        tokenCount: 250,
        purchasePrice: 375 * ratio,
        ownershipPercent: 0.044118 * ratio,
      },
    });
  });

  it("deletes all holdings when selling all tokens", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findUnique).mockResolvedValue(mockProperty as never);
    vi.mocked(prisma.tokenHolding.findMany).mockResolvedValue([holdingOld, holdingNew] as never);

    // Selling all 500 tokens (200 + 300)
    await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 500 }));

    expect(prisma.tokenHolding.delete).toHaveBeenCalledTimes(2);
    expect(prisma.tokenHolding.update).not.toHaveBeenCalled();
  });

  // ---- Financial calculations ----
  it("creates a Payout record with correct saleProceeds", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findUnique).mockResolvedValue(mockProperty as never);
    vi.mocked(prisma.tokenHolding.findMany).mockResolvedValue([holdingOld] as never);

    // 100 tokens × $1.25 = $125
    await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 100 }));

    expect(prisma.payout.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: 125,
          type: "SALE_PROCEEDS",
          status: "COMPLETED",
        }),
      })
    );
  });

  it("increments user walletBalance by saleProceeds", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findUnique).mockResolvedValue(mockProperty as never);
    vi.mocked(prisma.tokenHolding.findMany).mockResolvedValue([holdingOld] as never);

    // 100 tokens × $1.25 = $125
    await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 100 }));

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { walletBalance: { increment: 125 } },
      })
    );
  });

  it("decrements property fundedAmount by saleProceeds", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findUnique).mockResolvedValue(mockProperty as never);
    vi.mocked(prisma.tokenHolding.findMany).mockResolvedValue([holdingOld] as never);

    await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 100 }));

    expect(prisma.property.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ fundedAmount: { decrement: 125 } }),
      })
    );
  });

  it("reverts FUNDED status to FUNDING when fundedAmount drops below totalValue", async () => {
    const fundedProperty = { ...mockProperty, status: "FUNDED", fundedAmount: 850000 };
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findUnique).mockResolvedValue(fundedProperty as never);
    vi.mocked(prisma.tokenHolding.findMany).mockResolvedValue([holdingOld] as never);

    // 100 tokens × $1.25 = $125 → newFundedAmount = 849875 < 850000 → revert to FUNDING
    await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 100 }));

    expect(prisma.property.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "FUNDING" }),
      })
    );
  });

  it("does not revert ACTIVE status after a sale", async () => {
    const activeProperty = { ...mockProperty, status: "ACTIVE", fundedAmount: 850000 };
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findUnique).mockResolvedValue(activeProperty as never);
    vi.mocked(prisma.tokenHolding.findMany).mockResolvedValue([holdingOld] as never);

    await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 100 }));

    expect(prisma.property.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "ACTIVE" }),
      })
    );
  });

  // ---- Response shape ----
  it("returns 200 with saleProceeds on success", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findUnique).mockResolvedValue(mockProperty as never);
    vi.mocked(prisma.tokenHolding.findMany).mockResolvedValue([holdingOld] as never);

    const res = await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 100 }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.saleProceeds).toBe(125); // 100 × $1.25
  });

  it("returns 500 on unexpected error", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error("DB down"));

    const res = await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 100 }));

    expect(res.status).toBe(500);
  });
});
