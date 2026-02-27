import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FundingProgressBar from "@/components/FundingProgressBar";

describe("FundingProgressBar", () => {
  it("renders the funded amount and goal text when showLabel is true (default)", () => {
    render(<FundingProgressBar funded={250000} total={500000} />);
    expect(screen.getByText(/250,000 raised/)).toBeInTheDocument();
    expect(screen.getByText(/500,000 goal/)).toBeInTheDocument();
  });

  it("shows 50% when funded is half of total", () => {
    render(<FundingProgressBar funded={250000} total={500000} />);
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("caps at 100% when funded exceeds total", () => {
    render(<FundingProgressBar funded={600000} total={500000} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("shows 0% and does not divide by zero when total is 0", () => {
    render(<FundingProgressBar funded={0} total={0} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("does not render label text when showLabel is false", () => {
    render(<FundingProgressBar funded={100000} total={500000} showLabel={false} />);
    expect(screen.queryByText(/raised/)).not.toBeInTheDocument();
    expect(screen.queryByText(/goal/)).not.toBeInTheDocument();
  });

  it("renders the progress fill bar with correct width", () => {
    const { container } = render(<FundingProgressBar funded={100000} total={500000} />);
    const fill = container.querySelector(".progress-fill") as HTMLElement;
    expect(fill).toBeInTheDocument();
    expect(fill.style.width).toBe("20%");
  });
});
