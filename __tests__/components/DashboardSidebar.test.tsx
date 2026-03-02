import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardSidebar from "@/components/DashboardSidebar";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn().mockReturnValue({ push: vi.fn(), replace: vi.fn() }),
  usePathname: vi.fn().mockReturnValue("/dashboard"),
  useSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
  redirect: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  useSession: vi.fn().mockReturnValue({
    data: { user: { name: "Alice Investor", email: "alice@test.com", id: "user-1" } },
    status: "authenticated",
  }),
  signOut: vi.fn(),
}));

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(usePathname).mockReturnValue("/dashboard");
  vi.mocked(useSession).mockReturnValue({
    data: { user: { name: "Alice Investor", email: "alice@test.com", id: "user-1" } },
    status: "authenticated",
    update: vi.fn(),
  });
});

describe("DashboardSidebar", () => {
  it("renders the user's name from session", () => {
    render(<DashboardSidebar />);
    expect(screen.getByText("Alice Investor")).toBeInTheDocument();
  });

  it("renders the user's email from session", () => {
    render(<DashboardSidebar />);
    expect(screen.getByText("alice@test.com")).toBeInTheDocument();
  });

  it("falls back to 'Investor' when session has no name", () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { name: null, email: "alice@test.com", id: "user-1" } },
      status: "authenticated",
      update: vi.fn(),
    });
    render(<DashboardSidebar />);
    expect(screen.getByText("Investor")).toBeInTheDocument();
  });

  it("renders all 5 nav items", () => {
    render(<DashboardSidebar />);
    ["Portfolio", "My Properties", "Income", "Transactions", "Settings"].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("active nav link has gold class when pathname matches /dashboard", () => {
    vi.mocked(usePathname).mockReturnValue("/dashboard");
    render(<DashboardSidebar />);
    const portfolioLink = screen.getByRole("link", { name: /portfolio/i });
    expect(portfolioLink.className).toContain("text-accent-gold");
  });

  it("non-active link does not have gold class", () => {
    vi.mocked(usePathname).mockReturnValue("/dashboard");
    render(<DashboardSidebar />);
    const transactionsLink = screen.getByRole("link", { name: /transactions/i });
    expect(transactionsLink.className).not.toContain("text-accent-gold");
  });

  it("each nav link has the correct href", () => {
    render(<DashboardSidebar />);
    expect(screen.getByRole("link", { name: /portfolio/i })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: /my properties/i })).toHaveAttribute("href", "/dashboard/properties");
    expect(screen.getByRole("link", { name: /income/i })).toHaveAttribute("href", "/dashboard/income");
    expect(screen.getByRole("link", { name: /transactions/i })).toHaveAttribute("href", "/dashboard/transactions");
    expect(screen.getByRole("link", { name: /settings/i })).toHaveAttribute("href", "/dashboard/settings");
  });

  it("Sign Out button calls signOut with callbackUrl /", async () => {
    const user = userEvent.setup();
    render(<DashboardSidebar />);
    await user.click(screen.getByRole("button", { name: /sign out/i }));
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" });
  });
});
