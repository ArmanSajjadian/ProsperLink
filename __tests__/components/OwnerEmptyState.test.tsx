import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import OwnerEmptyState from "@/components/OwnerEmptyState";
import { Building2 } from "lucide-react";

describe("OwnerEmptyState", () => {
  const defaultProps = {
    icon: Building2,
    title: "No listings yet",
    description: "List your first property to get started.",
    ctaLabel: "List a Property",
    ctaHref: "/owner/list",
  };

  it("renders title and description", () => {
    render(<OwnerEmptyState {...defaultProps} />);
    expect(screen.getByText("No listings yet")).toBeInTheDocument();
    expect(
      screen.getByText("List your first property to get started.")
    ).toBeInTheDocument();
  });

  it("renders CTA link with correct href", () => {
    render(<OwnerEmptyState {...defaultProps} />);
    const link = screen.getByRole("link", { name: "List a Property" });
    expect(link).toHaveAttribute("href", "/owner/list");
  });

  it("renders the CTA label text", () => {
    render(<OwnerEmptyState {...defaultProps} ctaLabel="Get Started" ctaHref="/start" />);
    expect(screen.getByText("Get Started")).toBeInTheDocument();
  });
});
