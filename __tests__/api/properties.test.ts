import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    property: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

import { getServerSession } from "next-auth";
import { GET, POST } from "@/app/api/properties/route";

const mockProperty = {
  id: "lakeside-apartments",
  slug: "lakeside-apartments",
  name: "Lakeside Apartments",
  description: "Test description",
  type: "Multi-Family",
  imageUrl: "https://example.com/img.jpg",
  city: "Austin",
  state: "TX",
  address: "1200 Lake Shore Drive",
  totalValue: 850000,
  totalTokens: 680000,
  tokenPrice: 1.25,
  annualYield: 8.2,
  fundedAmount: 637500,
  status: "FUNDING",
  spvEntity: "Lakeside Austin LLC",
  jurisdiction: "Delaware",
  contractAddr: null,
  ownerId: null,
  highlights: [],
  bedrooms: 48,
  bathrooms: 48,
  sqft: 18400,
  yearBuilt: 2008,
  createdAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/properties", () => {
  it("returns an array of properties from the database", async () => {
    vi.mocked(prisma.property.findMany).mockResolvedValue([mockProperty] as never);

    const req = new Request("http://localhost/api/properties");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].id).toBe("lakeside-apartments");
    expect(data[0].imageUrl).toBe("https://example.com/img.jpg");
  });

  it("returns empty array when no properties exist", async () => {
    vi.mocked(prisma.property.findMany).mockResolvedValue([] as never);

    const req = new Request("http://localhost/api/properties");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual([]);
  });

  it("returns 500 when database throws an error", async () => {
    vi.mocked(prisma.property.findMany).mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/properties");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBeDefined();
  });
});

describe("POST /api/properties", () => {
  const ownerUser = {
    id: "user-owner-1",
    name: "Property Owner",
    email: "owner@test.com",
    role: "OWNER",
  };

  const validBody = {
    name: "New Test Property",
    description: "A great property for testing",
    type: "Residential",
    imageUrl: "https://example.com/new.jpg",
    address: "100 Main St",
    city: "Denver",
    state: "CO",
    totalValue: 500000,
    targetRaise: 500000,
    annualYield: 7.0,
    highlights: ["Great location", "Strong returns"],
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2000,
    yearBuilt: 2020,
    spvEntity: "New Property LLC",
    jurisdiction: "Delaware",
  };

  it("returns 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = new Request("http://localhost/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it("returns 403 when user role is INVESTOR", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: "investor@test.com" },
    } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      ...ownerUser,
      role: "INVESTOR",
    } as never);

    const req = new Request("http://localhost/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });
    const res = await POST(req);

    expect(res.status).toBe(403);
  });

  it("returns 400 when required fields are missing", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: "owner@test.com" },
    } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(ownerUser as never);

    const req = new Request("http://localhost/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Incomplete" }), // missing address, city, state
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it("returns 201 and creates property with DRAFT status for valid OWNER", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: "owner@test.com" },
    } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(ownerUser as never);
    vi.mocked(prisma.property.create).mockResolvedValue({
      id: "new-test-property",
      slug: "new-test-property",
      ...validBody,
      status: "DRAFT",
      fundedAmount: 0,
      ownerId: ownerUser.id,
      createdAt: new Date(),
    } as never);

    const req = new Request("http://localhost/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.propertyId).toBe("new-test-property");
    expect(data.slug).toBeDefined();
  });

  it("creates property with status DRAFT and correct ownerId", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: "owner@test.com" },
    } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(ownerUser as never);
    vi.mocked(prisma.property.create).mockResolvedValue({
      id: "new-test-property",
      slug: "new-test-property",
      status: "DRAFT",
      ownerId: ownerUser.id,
      createdAt: new Date(),
    } as never);

    const req = new Request("http://localhost/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });
    await POST(req);

    expect(prisma.property.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "DRAFT",
          ownerId: ownerUser.id,
        }),
      })
    );
  });
});
