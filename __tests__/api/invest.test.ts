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
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

import { getServerSession } from "next-auth";
import { POST } from "@/app/api/invest/route";

const mockUser = { id: "user-1", name: "Test Investor", email: "investor@test.com", walletBalance: 10000 };

const mockProperty = {
  id: "lakeside-apartments",
  slug: "lakeside-apartments",
  name: "Lakeside Apartments",
  totalValue: 850000,
  totalTokens: 680000,
  tokenPrice: 1.25,
  fundedAmount: 637500,
  status: "FUNDING",
};

function makeRequest(body: object) {
  return new Request("http://localhost/api/invest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/invest", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const res = await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 100 }));

    expect(res.status).toBe(401);
  });

  it("returns 400 when tokenCount is 0", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);

    const res = await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 0 }));

    expect(res.status).toBe(400);
  });

  it("returns 400 when tokenCount is negative", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);

    const res = await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: -5 }));

    expect(res.status).toBe(400);
  });

  it("returns 404 when user is not found in database", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);
    vi.mocked(prisma.property.findUnique).mockResolvedValue(mockProperty as never);

    const res = await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 100 }));

    expect(res.status).toBe(404);
  });

  it("returns 404 when property is not found in database", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findUnique).mockResolvedValue(null as never);

    const res = await POST(makeRequest({ propertyId: "nonexistent", tokenCount: 100 }));

    expect(res.status).toBe(404);
  });

  it("returns 400 when property status is not FUNDING", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findUnique).mockResolvedValue({
      ...mockProperty,
      status: "FUNDED",
    } as never);

    const res = await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 100 }));

    expect(res.status).toBe(400);
  });

  it("returns 400 when wallet balance is insufficient", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, walletBalance: 0 } as never);
    vi.mocked(prisma.property.findUnique).mockResolvedValue(mockProperty as never);

    // 100 tokens × $1.25 = $125, but wallet has $0
    const res = await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 100 }));

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/wallet/i);
  });

  it("returns 400 when tokenCount exceeds available tokens", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    // Only 170K tokens available: totalTokens(680K) - funded(637500/1.25=510K) = 170K
    vi.mocked(prisma.property.findUnique).mockResolvedValue(mockProperty as never);

    // Request 200K tokens (more than the 170K available)
    const res = await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 200000 }));

    expect(res.status).toBe(400);
  });

  it("returns 201 with holdingId on a successful investment", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findUnique).mockResolvedValue(mockProperty as never);
    vi.mocked(prisma.$transaction).mockResolvedValue([{ id: "holding-123" }, {}] as never);

    const res = await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 100 }));
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.holdingId).toBe("holding-123");
    expect(data.purchasePrice).toBe(100 * 1.25); // 100 tokens × $1.25
  });

  it("calls $transaction when investment is valid", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findUnique).mockResolvedValue(mockProperty as never);
    vi.mocked(prisma.$transaction).mockResolvedValue([{ id: "holding-456" }, {}] as never);

    await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 100 }));

    expect(prisma.$transaction).toHaveBeenCalledOnce();
  });

  it("flips property status to FUNDED when investment completes funding", async () => {
    // Property is almost fully funded: totalValue=850000, fundedAmount=848750
    // 1000 more tokens × $1.25 = $1250 → newFundedAmount = 850000 (exactly full)
    const almostFundedProperty = {
      ...mockProperty,
      fundedAmount: 848750,
    };

    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findUnique).mockResolvedValue(almostFundedProperty as never);
    vi.mocked(prisma.$transaction).mockResolvedValue([{ id: "holding-789" }, {}] as never);

    const res = await POST(makeRequest({ propertyId: "lakeside-apartments", tokenCount: 1000 }));

    expect(res.status).toBe(201);
    // The route calls property.update() inside the $transaction array with status: "FUNDED"
    expect(prisma.property.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "FUNDED" }),
      })
    );
  });
});
