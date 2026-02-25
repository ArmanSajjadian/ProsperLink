import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

import { getServerSession } from "next-auth";
import { GET } from "@/app/api/wallet/route";

function makeRequest() {
  return new Request("http://localhost/api/wallet", { method: "GET" });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/wallet", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const res = await GET();

    expect(res.status).toBe(401);
  });

  it("returns 404 when user is not found", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);

    const res = await GET();

    expect(res.status).toBe(404);
  });

  it("returns 200 with walletBalance when user exists", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "investor@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ walletBalance: 5000 } as never);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.walletBalance).toBe(5000);
  });

  it("returns walletBalance of 0 for a new user", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "new@test.com" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ walletBalance: 0 } as never);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.walletBalance).toBe(0);
  });
});
