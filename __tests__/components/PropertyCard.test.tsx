import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PropertyCard from "@/components/PropertyCard";
import type { Property } from "@/lib/data";

const mockProperty: Property = {
  id: "lakeside-apartments",
  slug: "lakeside-apartments",
  name: "Lakeside Apartments",
  description: "A well-maintained 12-unit apartment complex",
  type: "Multi-Family",
  imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
  address: "1200 Lake Shore Drive",
  city: "Austin",
  state: "TX",
  totalValue: 850000,
  totalTokens: 680000,
  tokenPrice: 1.25,
  annualYield: 8.2,
  fundedAmount: 637500,
  status: "FUNDING",
  spvEntity: "Lakeside Austin LLC",
  jurisdiction: "Delaware",
  highlights: [],
};

describe("PropertyCard", () => {
  it("renders the property name", () => {
    render(<PropertyCard property={mockProperty} />);
    expect(screen.getByText("Lakeside Apartments")).toBeInTheDocument();
  });

  it("renders imageUrl as the img src (flat Prisma field, not old 'image' field)", () => {
    const { container } = render(<PropertyCard property={mockProperty} />);
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.src).toContain("images.unsplash.com");
  });

  it("renders city and state from flat fields (not location.city)", () => {
    render(<PropertyCard property={mockProperty} />);
    expect(screen.getByText("Austin, TX")).toBeInTheDocument();
  });

  it("renders the correct status badge for FUNDING", () => {
    render(<PropertyCard property={mockProperty} />);
    expect(screen.getByText("Funding Open")).toBeInTheDocument();
  });

  it("renders the correct status badge for ACTIVE", () => {
    const activeProperty = { ...mockProperty, status: "ACTIVE" };
    render(<PropertyCard property={activeProperty} />);
    expect(screen.getByText("Earning")).toBeInTheDocument();
  });

  it("renders the correct status badge for FUNDED", () => {
    const fundedProperty = { ...mockProperty, status: "FUNDED" };
    render(<PropertyCard property={fundedProperty} />);
    expect(screen.getByText("Fully Funded")).toBeInTheDocument();
  });

  it("links to the correct property detail page", () => {
    const { container } = render(<PropertyCard property={mockProperty} />);
    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe("/properties/lakeside-apartments");
  });

  it("renders the annual yield with percent sign", () => {
    render(<PropertyCard property={mockProperty} />);
    expect(screen.getByText("8.2%")).toBeInTheDocument();
  });

  it("renders the token price", () => {
    render(<PropertyCard property={mockProperty} />);
    expect(screen.getByText("$1.25")).toBeInTheDocument();
  });

  it("renders the property type badge", () => {
    render(<PropertyCard property={mockProperty} />);
    expect(screen.getByText("Multi-Family")).toBeInTheDocument();
  });

  it("renders the funding progress percentage", () => {
    render(<PropertyCard property={mockProperty} />);
    // 637500 / 850000 = 75%
    expect(screen.getByText("75%")).toBeInTheDocument();
  });
});
