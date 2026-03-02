import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    property: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { GET } from "@/app/api/owner/properties/route";

const mockUser = { id: "owner-user-1", email: "owner@test.com" };

const mockProperties = [
  {
    id: "prop-1",
    name: "Harbor Heights",
    ownerId: "owner-user-1",
    createdAt: new Date("2026-02-01"),
    _count: { tokenHoldings: 38 },
  },
  {
    id: "prop-2",
    name: "Westside Lofts",
    ownerId: "owner-user-1",
    createdAt: new Date("2025-09-01"),
    _count: { tokenHoldings: 124 },
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/owner/properties", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 401 when session has no email", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: {} } as never);

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 404 when user is not found in the database", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "owner@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);

    const res = await GET();
    expect(res.status).toBe(404);
  });

  it("returns 200 with an empty array when the owner has no properties", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "owner@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findMany).mockResolvedValue([] as never);

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
  });

  it("returns 200 with the owner's properties", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "owner@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findMany).mockResolvedValue(mockProperties as never);

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(2);
    expect(data[0].name).toBe("Harbor Heights");
  });

  it("queries with ownerId filter and descending createdAt order", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "owner@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findMany).mockResolvedValue(mockProperties as never);

    await GET();

    expect(prisma.property.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ownerId: "owner-user-1" },
        orderBy: { createdAt: "desc" },
      })
    );
  });

  it("includes _count.tokenHoldings in the query", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "owner@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findMany).mockResolvedValue(mockProperties as never);

    await GET();

    expect(prisma.property.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: { _count: { select: { tokenHoldings: true } } },
      })
    );
  });

  it("returns 500 when the database throws an error", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "owner@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.property.findMany).mockRejectedValue(new Error("DB failure"));

    const res = await GET();
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBeTruthy();
  });
});
