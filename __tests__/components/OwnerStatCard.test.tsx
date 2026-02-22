import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import OwnerStatCard from "@/components/OwnerStatCard";
import { DollarSign } from "lucide-react";

describe("OwnerStatCard", () => {
  it("renders label and value", () => {
    render(<OwnerStatCard icon={DollarSign} label="Total Raised" value="$1.41M" />);
    expect(screen.getByText("Total Raised")).toBeInTheDocument();
    expect(screen.getByText("$1.41M")).toBeInTheDocument();
  });

  it("renders sub-text when provided", () => {
    render(
      <OwnerStatCard
        icon={DollarSign}
        label="Total"
        value="3"
        sub="Across all listings"
      />
    );
    expect(screen.getByText("Across all listings")).toBeInTheDocument();
  });

  it("does not render sub when omitted", () => {
    render(<OwnerStatCard icon={DollarSign} label="Total" value="3" />);
    expect(screen.queryByText("Across all listings")).not.toBeInTheDocument();
  });

  it("applies text-accent-gold class when gold=true", () => {
    const { container } = render(
      <OwnerStatCard icon={DollarSign} label="Revenue" value="$8,100" gold />
    );
    expect(container.querySelector(".text-accent-gold")).toBeInTheDocument();
  });

  it("applies text-white class when gold=false (default)", () => {
    const { container } = render(
      <OwnerStatCard icon={DollarSign} label="Listings" value="3" />
    );
    const valueEl = screen.getByText("3");
    expect(valueEl.className).toContain("text-white");
  });
});
