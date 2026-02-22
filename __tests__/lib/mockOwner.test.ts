import { describe, it, expect } from "vitest";
import {
  mockOwnerProperties,
  mockDocuments,
  ownerStats,
  getOwnerPropertyDocuments,
} from "@/lib/mockOwner";

describe("mockOwnerProperties", () => {
  it("contains exactly 3 properties", () => {
    expect(mockOwnerProperties).toHaveLength(3);
  });

  it("has at least one FUNDING property", () => {
    expect(mockOwnerProperties.some((p) => p.status === "FUNDING")).toBe(true);
  });

  it("has at least one ACTIVE property", () => {
    expect(mockOwnerProperties.some((p) => p.status === "ACTIVE")).toBe(true);
  });

  it("has at least one DRAFT property", () => {
    expect(mockOwnerProperties.some((p) => p.status === "DRAFT")).toBe(true);
  });

  it("all properties have required fields", () => {
    mockOwnerProperties.forEach((p) => {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.totalTokens).toBeGreaterThan(0);
      expect(p.tokenPrice).toBeGreaterThan(0);
      expect(p.annualYield).toBeGreaterThan(0);
    });
  });

  it("all token prices are exactly $1.00", () => {
    mockOwnerProperties.forEach((p) => {
      expect(p.tokenPrice).toBe(1.0);
    });
  });

  it("totalTokens equals targetRaise for $1 token price", () => {
    mockOwnerProperties.forEach((p) => {
      expect(p.totalTokens).toBe(p.targetRaise / p.tokenPrice);
    });
  });

  it("fundedAmount never exceeds targetRaise", () => {
    mockOwnerProperties.forEach((p) => {
      expect(p.fundedAmount).toBeLessThanOrEqual(p.targetRaise);
    });
  });
});

describe("mockDocuments", () => {
  it("contains at least 6 documents", () => {
    expect(mockDocuments.length).toBeGreaterThanOrEqual(6);
  });

  it("has at least one APPROVED document", () => {
    expect(mockDocuments.some((d) => d.status === "APPROVED")).toBe(true);
  });

  it("has at least one REJECTED document", () => {
    expect(mockDocuments.some((d) => d.status === "REJECTED")).toBe(true);
  });

  it("has at least one PENDING_REVIEW document", () => {
    expect(mockDocuments.some((d) => d.status === "PENDING_REVIEW")).toBe(true);
  });

  it("REJECTED documents have a reviewNote", () => {
    mockDocuments
      .filter((d) => d.status === "REJECTED")
      .forEach((d) => {
        expect(d.reviewNote).toBeTruthy();
      });
  });
});

describe("ownerStats", () => {
  it("totalRaised equals sum of all fundedAmounts", () => {
    const sum = mockOwnerProperties.reduce((acc, p) => acc + p.fundedAmount, 0);
    expect(ownerStats.totalRaised).toBe(sum);
  });

  it("totalInvestors equals sum of all investorCounts", () => {
    const sum = mockOwnerProperties.reduce(
      (acc, p) => acc + p.investorCount,
      0
    );
    expect(ownerStats.totalInvestors).toBe(sum);
  });

  it("documentsNeedingAction equals the count of REJECTED docs", () => {
    const count = mockDocuments.filter((d) => d.status === "REJECTED").length;
    expect(ownerStats.documentsNeedingAction).toBe(count);
  });

  it("totalListings matches the number of properties", () => {
    expect(ownerStats.totalListings).toBe(mockOwnerProperties.length);
  });
});

describe("getOwnerPropertyDocuments", () => {
  it("returns documents for harbor-heights only", () => {
    const docs = getOwnerPropertyDocuments("harbor-heights");
    expect(docs.length).toBeGreaterThan(0);
    docs.forEach((d) => expect(d.propertyId).toBe("harbor-heights"));
  });

  it("returns empty array for unknown property", () => {
    expect(getOwnerPropertyDocuments("does-not-exist")).toHaveLength(0);
  });
});
