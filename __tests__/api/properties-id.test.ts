import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    property: {
      findFirst: vi.fn(),
    },
  },
}));

import { GET } from "@/app/api/properties/[id]/route";

const mockProperty = {
  id: "lakeside-apartments",
  slug: "lakeside-apartments",
  name: "Lakeside Apartments",
  description: "A well-maintained 12-unit apartment complex",
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
  highlights: ["97% occupancy", "Below-market rents"],
  bedrooms: 48,
  bathrooms: 48,
  sqft: 18400,
  yearBuilt: 2008,
  createdAt: new Date(),
};

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/properties/[id]", () => {
  it("returns a property when found by id", async () => {
    vi.mocked(prisma.property.findFirst).mockResolvedValue(mockProperty as never);

    const req = new Request("http://localhost/api/properties/lakeside-apartments");
    const res = await GET(req, makeParams("lakeside-apartments"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.id).toBe("lakeside-apartments");
    expect(data.name).toBe("Lakeside Apartments");
    expect(data.imageUrl).toBe("https://example.com/img.jpg");
  });

  it("returns a property when found by slug", async () => {
    vi.mocked(prisma.property.findFirst).mockResolvedValue(mockProperty as never);

    const req = new Request("http://localhost/api/properties/lakeside-apartments");
    const res = await GET(req, makeParams("lakeside-apartments"));
    const data = await res.json();

    expect(res.status).toBe(200);
    // Verify the query used OR (id or slug)
    expect(prisma.property.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { id: "lakeside-apartments" },
            { slug: "lakeside-apartments" },
          ]),
        }),
      })
    );
    expect(data.slug).toBe("lakeside-apartments");
  });

  it("returns 404 when property is not found", async () => {
    vi.mocked(prisma.property.findFirst).mockResolvedValue(null as never);

    const req = new Request("http://localhost/api/properties/nonexistent");
    const res = await GET(req, makeParams("nonexistent"));
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBeDefined();
  });

  it("returns highlights array with the property", async () => {
    vi.mocked(prisma.property.findFirst).mockResolvedValue(mockProperty as never);

    const req = new Request("http://localhost/api/properties/lakeside-apartments");
    const res = await GET(req, makeParams("lakeside-apartments"));
    const data = await res.json();

    expect(Array.isArray(data.highlights)).toBe(true);
    expect(data.highlights).toContain("97% occupancy");
  });
});
