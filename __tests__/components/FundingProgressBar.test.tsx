import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FundingProgressBar from "@/components/FundingProgressBar";

describe("FundingProgressBar", () => {
  it("renders funded and total labels", () => {
    render(<FundingProgressBar funded={211200} total={320000} />);
    expect(screen.getByText(/211,200/)).toBeInTheDocument();
    expect(screen.getByText(/320,000/)).toBeInTheDocument();
  });

  it("calculates approximately 66% width for harbor heights values", () => {
    const { container } = render(
      <FundingProgressBar funded={211200} total={320000} />
    );
    const fill = container.querySelector(".progress-fill") as HTMLElement;
    // 211200/320000 = 66.0%
    expect(fill.style.width).toBe("66%");
  });

  it("shows 0% for unfunded property", () => {
    const { container } = render(
      <FundingProgressBar funded={0} total={260000} />
    );
    const fill = container.querySelector(".progress-fill") as HTMLElement;
    expect(fill.style.width).toBe("0%");
  });

  it("caps at 100% for fully funded property", () => {
    const { container } = render(
      <FundingProgressBar funded={1200000} total={1200000} />
    );
    const fill = container.querySelector(".progress-fill") as HTMLElement;
    expect(fill.style.width).toBe("100%");
  });

  it("hides labels when showLabel=false", () => {
    render(<FundingProgressBar funded={100} total={200} showLabel={false} />);
    expect(screen.queryByText(/100/)).not.toBeInTheDocument();
    expect(screen.queryByText(/200/)).not.toBeInTheDocument();
  });

  it("still renders the bar track when showLabel=false", () => {
    const { container } = render(
      <FundingProgressBar funded={50} total={100} showLabel={false} />
    );
    expect(container.querySelector(".progress-bar")).toBeInTheDocument();
    expect(container.querySelector(".progress-fill")).toBeInTheDocument();
  });
});
