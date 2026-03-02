import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PropertyListingCard from "@/components/PropertyListingCard";
import type { OwnerProperty } from "@/lib/mockOwner";

// Use vi.hoisted to define mock functions that are referenced in vi.mock factories
const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn().mockReturnValue({ push: mockPush, replace: vi.fn() }),
  usePathname: vi.fn().mockReturnValue("/owner/dashboard"),
  useSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
  redirect: vi.fn(),
}));

const baseProperty: OwnerProperty = {
  id: "harbor-heights",
  name: "Harbor Heights",
  address: "123 Harbor Blvd",
  city: "Miami",
  state: "FL",
  zipCode: "33101",
  propertyType: "Residential",
  image: "https://images.unsplash.com/photo-1234?w=400",
  totalValue: 320000,
  targetRaise: 320000,
  fundedAmount: 211200,
  totalTokens: 256000,
  tokenPrice: 1.25,
  annualYield: 8.5,
  status: "FUNDING",
  listedAt: "2026-01-01",
  investorCount: 38,
  spvEntity: "Harbor Heights LLC",
  spvJurisdiction: "FL",
  description: "A great coastal property",
  highlights: ["Pool", "Gym"],
  fundingMilestones: [],
  monthlyInquiries: [],
  monthlyRevenue: [],
};

const draftProperty: OwnerProperty = {
  ...baseProperty,
  id: "pine-ridge",
  name: "Pine Ridge Estates",
  status: "DRAFT",
  fundedAmount: 0,
  totalTokens: 0,
  investorCount: 0,
};

const activeProperty: OwnerProperty = {
  ...baseProperty,
  id: "westside-lofts",
  name: "Westside Lofts",
  status: "ACTIVE",
  fundedAmount: 320000,
  investorCount: 124,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PropertyListingCard", () => {
  it("renders property name", () => {
    render(<PropertyListingCard property={baseProperty} />);
    expect(screen.getByText("Harbor Heights")).toBeInTheDocument();
  });

  it("renders city, state, and property type", () => {
    render(<PropertyListingCard property={baseProperty} />);
    expect(screen.getByText(/Miami, FL · Residential/)).toBeInTheDocument();
  });

  it("shows Funding Open badge for FUNDING status", () => {
    render(<PropertyListingCard property={baseProperty} />);
    expect(screen.getByText("Funding Open")).toBeInTheDocument();
  });

  it("shows Active badge for ACTIVE status", () => {
    render(<PropertyListingCard property={activeProperty} />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("shows Draft badge for DRAFT status", () => {
    render(<PropertyListingCard property={draftProperty} />);
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("shows investor count for FUNDING properties", () => {
    render(<PropertyListingCard property={baseProperty} />);
    expect(screen.getByText("38 investors")).toBeInTheDocument();
  });

  it("does NOT show investor count for DRAFT properties", () => {
    render(<PropertyListingCard property={draftProperty} />);
    expect(screen.queryByText(/investors/)).not.toBeInTheDocument();
  });

  it("shows FundingProgressBar for FUNDING status", () => {
    render(<PropertyListingCard property={baseProperty} />);
    // FundingProgressBar renders the funded/total amounts
    expect(screen.getByText(/\$211/)).toBeInTheDocument();
  });

  it("does NOT show FundingProgressBar for DRAFT status", () => {
    render(<PropertyListingCard property={draftProperty} />);
    // No funding amounts visible for draft
    expect(screen.queryByText("$0")).not.toBeInTheDocument();
  });

  it("renders Annual Yield metric", () => {
    render(<PropertyListingCard property={baseProperty} />);
    expect(screen.getByText("8.5%")).toBeInTheDocument();
    expect(screen.getByText("Annual Yield")).toBeInTheDocument();
  });

  it("renders Token Price metric", () => {
    render(<PropertyListingCard property={baseProperty} />);
    expect(screen.getByText("$1.25")).toBeInTheDocument();
    expect(screen.getByText("Token Price")).toBeInTheDocument();
  });

  it("shows '—' for Total Tokens when totalTokens is 0 (draft)", () => {
    render(<PropertyListingCard property={draftProperty} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("Manage Documents button calls router.push with correct path", async () => {
    const user = userEvent.setup();
    render(<PropertyListingCard property={baseProperty} />);
    await user.click(screen.getByRole("button", { name: /manage documents/i }));
    expect(mockPush).toHaveBeenCalledWith("/owner/documents/harbor-heights");
  });

  it("View Listing link points to the correct property URL", () => {
    render(<PropertyListingCard property={baseProperty} />);
    expect(screen.getByRole("link", { name: /view listing/i })).toHaveAttribute("href", "/properties/harbor-heights");
  });

  it("Continue Editing link appears only for DRAFT status", () => {
    render(<PropertyListingCard property={draftProperty} />);
    expect(screen.getByRole("link", { name: /continue editing/i })).toBeInTheDocument();
  });

  it("Continue Editing link does NOT appear for FUNDING status", () => {
    render(<PropertyListingCard property={baseProperty} />);
    expect(screen.queryByRole("link", { name: /continue editing/i })).not.toBeInTheDocument();
  });
});
