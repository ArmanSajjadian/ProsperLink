import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-password-xyz"),
  },
}));

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { POST } from "@/app/api/auth/signup/route";

function makeRequest(body: object) {
  return new Request("http://localhost/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/auth/signup", () => {
  it("returns 400 when name is missing", async () => {
    const res = await POST(makeRequest({ email: "user@test.com", password: "password123" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/required/i);
  });

  it("returns 400 when email is missing", async () => {
    const res = await POST(makeRequest({ name: "Alice", password: "password123" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/required/i);
  });

  it("returns 400 when password is missing", async () => {
    const res = await POST(makeRequest({ name: "Alice", email: "user@test.com" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/required/i);
  });

  it("returns 400 when password is shorter than 8 characters", async () => {
    const res = await POST(makeRequest({ name: "Alice", email: "user@test.com", password: "abc123" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/8 characters/i);
  });

  it("returns 400 when password is exactly 7 characters (boundary)", async () => {
    const res = await POST(makeRequest({ name: "Alice", email: "user@test.com", password: "abc1234" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/8 characters/i);
  });

  it("returns 409 when email already exists", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "existing-user" } as never);

    const res = await POST(makeRequest({ name: "Alice", email: "taken@test.com", password: "password123" }));
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toMatch(/already exists/i);
  });

  it("returns 201 with success:true on valid registration", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);
    vi.mocked(prisma.user.create).mockResolvedValue({ id: "new-user" } as never);

    const res = await POST(makeRequest({ name: "Alice", email: "alice@test.com", password: "password123" }));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it("calls bcrypt.hash with the plain password and 12 rounds on success", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);
    vi.mocked(prisma.user.create).mockResolvedValue({ id: "new-user" } as never);

    await POST(makeRequest({ name: "Alice", email: "alice@test.com", password: "password123" }));

    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 12);
  });

  it("calls prisma.user.create with name, email, and passwordHash on success", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);
    vi.mocked(prisma.user.create).mockResolvedValue({ id: "new-user" } as never);

    await POST(makeRequest({ name: "Alice", email: "alice@test.com", password: "password123" }));

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: { name: "Alice", email: "alice@test.com", passwordHash: "hashed-password-xyz" },
    });
  });

  it("does NOT call prisma.user.create when email already exists", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "existing-user" } as never);

    await POST(makeRequest({ name: "Alice", email: "taken@test.com", password: "password123" }));

    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("returns 500 when prisma.user.findUnique throws", async () => {
    vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error("DB connection failed"));

    const res = await POST(makeRequest({ name: "Alice", email: "alice@test.com", password: "password123" }));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBeTruthy();
  });

  it("returns 500 when prisma.user.create throws", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);
    vi.mocked(prisma.user.create).mockRejectedValue(new Error("Constraint violation"));

    const res = await POST(makeRequest({ name: "Alice", email: "alice@test.com", password: "password123" }));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBeTruthy();
  });
});
