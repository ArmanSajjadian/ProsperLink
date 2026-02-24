import { describe, it, expect } from "vitest";
import { formatCurrency, getFundedPercent } from "@/lib/data";
import type { Property } from "@/lib/data";

const baseProperty: Property = {
  id: "test",
  slug: "test",
  name: "Test Property",
  description: "",
  type: "Residential",
  imageUrl: "",
  address: "",
  city: "",
  state: "",
  totalValue: 1000000,
  totalTokens: 800000,
  tokenPrice: 1.25,
  annualYield: 7.5,
  fundedAmount: 750000,
  status: "FUNDING",
  spvEntity: "",
  jurisdiction: "",
  highlights: [],
};

describe("formatCurrency", () => {
  it("formats values under $1K as a plain dollar amount", () => {
    expect(formatCurrency(850)).toBe("$850");
  });

  it("formats values under $1K with zero decimal", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  it("formats values in the thousands as K notation", () => {
    expect(formatCurrency(637500)).toBe("$638K");
  });

  it("formats exactly $1K as K notation", () => {
    expect(formatCurrency(1000)).toBe("$1K");
  });

  it("formats values in the millions as M notation with one decimal", () => {
    expect(formatCurrency(1200000)).toBe("$1.2M");
  });

  it("formats $2.1M correctly", () => {
    expect(formatCurrency(2100000)).toBe("$2.1M");
  });
});

describe("getFundedPercent", () => {
  it("returns 75 when 75% funded", () => {
    const property = { ...baseProperty, totalValue: 1000000, fundedAmount: 750000 };
    expect(getFundedPercent(property)).toBe(75);
  });

  it("returns 100 when fully funded", () => {
    const property = { ...baseProperty, totalValue: 1000000, fundedAmount: 1000000 };
    expect(getFundedPercent(property)).toBe(100);
  });

  it("returns 0 when nothing is funded", () => {
    const property = { ...baseProperty, totalValue: 1000000, fundedAmount: 0 };
    expect(getFundedPercent(property)).toBe(0);
  });

  it("rounds to nearest integer", () => {
    const property = { ...baseProperty, totalValue: 850000, fundedAmount: 637500 };
    expect(getFundedPercent(property)).toBe(75);
  });

  it("returns correct percent for the seeded properties", () => {
    const property = { ...baseProperty, totalValue: 3500000, fundedAmount: 2450000 };
    expect(getFundedPercent(property)).toBe(70);
  });
});
