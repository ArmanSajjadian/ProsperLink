import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

describe("Footer", () => {
  it("renders ProsperLink brand name", () => {
    render(<Footer />);
    expect(screen.getByText(/ProsperLink/)).toBeInTheDocument();
  });

  it("renders the democratizing real estate tagline", () => {
    render(<Footer />);
    expect(screen.getByText(/Democratizing real estate investment/i)).toBeInTheDocument();
  });

  it("renders 'Invest smarter, starting from $25'", () => {
    render(<Footer />);
    expect(screen.getByText(/invest smarter, starting from \$25/i)).toBeInTheDocument();
  });

  it("renders Browse Properties link pointing to /properties", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: /browse properties/i })).toHaveAttribute("href", "/properties");
  });

  it("renders How It Works link pointing to /how-it-works", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: /how it works/i })).toHaveAttribute("href", "/how-it-works");
  });

  it("renders About Us link pointing to /about", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: /about us/i })).toHaveAttribute("href", "/about");
  });

  it("renders Terms of Service text", () => {
    render(<Footer />);
    expect(screen.getByText("Terms of Service")).toBeInTheDocument();
  });

  it("renders Privacy Policy text", () => {
    render(<Footer />);
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
  });

  it("renders copyright notice", () => {
    render(<Footer />);
    expect(screen.getByText(/© 2026 ProsperLink/i)).toBeInTheDocument();
  });

  it("renders risk disclaimer", () => {
    render(<Footer />);
    expect(screen.getByText(/investments in tokenized real estate involve risk/i)).toBeInTheDocument();
  });
});
