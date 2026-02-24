// Property type matching the Prisma schema (flat structure)
export interface Property {
  id: string;
  slug: string;
  name: string;
  description: string;
  type: string;
  imageUrl: string;
  address: string;
  city: string;
  state: string;
  totalValue: number;
  totalTokens: number;
  tokenPrice: number;
  annualYield: number;
  fundedAmount: number;
  status: string;
  spvEntity: string;
  jurisdiction: string;
  contractAddr?: string | null;
  ownerId?: string | null;
  highlights: string[];
  bedrooms?: number | null;
  bathrooms?: number | null;
  sqft?: number | null;
  yearBuilt?: number | null;
  createdAt?: string | Date;
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toFixed(0)}`;
}

export function getFundedPercent(property: Property): number {
  return Math.round((property.fundedAmount / property.totalValue) * 100);
}
