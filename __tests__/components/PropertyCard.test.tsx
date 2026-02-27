import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PropertyCard from "@/components/PropertyCard";
import type { Property } from "@/lib/data";

const baseProperty: Property = {
  id: "lakeside-apartments",
  slug: "lakeside-apartments",
  name: "Lakeside Apartments",
  description: "A waterfront property",
  type: "Multi-Family",
  imageUrl: "https://example.com/img.jpg",
  address: "123 Lake Shore Dr",
  city: "Austin",
  state: "TX",
  totalValue: 850000,
  totalTokens: 680000,
  tokenPrice: 1.25,
  annualYield: 8.2,
  fundedAmount: 637500,
  status: "FUNDING",
  spvEntity: "Lakeside SPV LLC",
  jurisdiction: "TX",
  highlights: [],
};

describe("PropertyCard", () => {
  it("renders the property name", () => {
    render(<PropertyCard property={baseProperty} />);
    expect(screen.getByText("Lakeside Apartments")).toBeInTheDocument();
  });

  it("shows 'Funding Open' badge for FUNDING status", () => {
    render(<PropertyCard property={baseProperty} />);
    expect(screen.getByText("Funding Open")).toBeInTheDocument();
  });

  it("shows 'Fully Funded' badge for FUNDED status", () => {
    render(<PropertyCard property={{ ...baseProperty, status: "FUNDED" }} />);
    expect(screen.getByText("Fully Funded")).toBeInTheDocument();
  });

  it("shows 'Earning' badge for ACTIVE status", () => {
    render(<PropertyCard property={{ ...baseProperty, status: "ACTIVE" }} />);
    expect(screen.getByText("Earning")).toBeInTheDocument();
  });

  it("falls back to the raw status string for an unknown status", () => {
    render(<PropertyCard property={{ ...baseProperty, status: "REVIEW" }} />);
    // statusLabels["REVIEW"] is undefined → falls back to property.status
    expect(screen.getByText("REVIEW")).toBeInTheDocument();
  });

  it("applies empty string class for an unknown status (no color class crash)", () => {
    // statusColors["REVIEW"] is undefined → ?? "" prevents runtime error
    expect(() =>
      render(<PropertyCard property={{ ...baseProperty, status: "REVIEW" }} />)
    ).not.toThrow();
  });

  it("renders a link to the property detail page", () => {
    render(<PropertyCard property={baseProperty} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/properties/lakeside-apartments");
  });

  it("renders the property type label", () => {
    render(<PropertyCard property={baseProperty} />);
    expect(screen.getByText("Multi-Family")).toBeInTheDocument();
  });
});
