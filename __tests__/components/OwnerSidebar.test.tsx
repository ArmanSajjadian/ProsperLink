import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OwnerSidebar from "@/components/OwnerSidebar";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn().mockReturnValue({ push: vi.fn(), replace: vi.fn() }),
  usePathname: vi.fn().mockReturnValue("/owner/dashboard"),
  useSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
  redirect: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  useSession: vi.fn().mockReturnValue({
    data: { user: { name: "Bob Owner", email: "bob@test.com", id: "user-2" } },
    status: "authenticated",
  }),
  signOut: vi.fn(),
}));

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(usePathname).mockReturnValue("/owner/dashboard");
  vi.mocked(useSession).mockReturnValue({
    data: { user: { name: "Bob Owner", email: "bob@test.com", id: "user-2" } },
    status: "authenticated",
    update: vi.fn(),
  });
});

describe("OwnerSidebar", () => {
  it("renders Owner Portal label", () => {
    render(<OwnerSidebar />);
    expect(screen.getByText("Owner Portal")).toBeInTheDocument();
  });

  it("renders all 3 nav items", () => {
    render(<OwnerSidebar />);
    ["My Properties", "List Property", "Documents"].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("My Properties link is active on /owner/dashboard (exact match)", () => {
    vi.mocked(usePathname).mockReturnValue("/owner/dashboard");
    render(<OwnerSidebar />);
    const link = screen.getByRole("link", { name: /my properties/i });
    expect(link.className).toContain("text-accent-gold");
  });

  it("Documents link is active when pathname starts with /owner/documents", () => {
    vi.mocked(usePathname).mockReturnValue("/owner/documents/harbor-heights");
    render(<OwnerSidebar />);
    const link = screen.getByRole("link", { name: /documents/i });
    expect(link.className).toContain("text-accent-gold");
  });

  it("Investor View link points to /dashboard", () => {
    render(<OwnerSidebar />);
    expect(screen.getByRole("link", { name: /investor view/i })).toHaveAttribute("href", "/dashboard");
  });

  it("falls back to 'Property Owner' when session has no name", () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { name: null, email: "bob@test.com", id: "user-2" } },
      status: "authenticated",
      update: vi.fn(),
    });
    render(<OwnerSidebar />);
    expect(screen.getByText("Property Owner")).toBeInTheDocument();
  });

  it("Sign Out button calls signOut with callbackUrl /", async () => {
    const user = userEvent.setup();
    render(<OwnerSidebar />);
    await user.click(screen.getByRole("button", { name: /sign out/i }));
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" });
  });
});
