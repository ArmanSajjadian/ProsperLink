// Simulated investor portfolio data for Phase 2 MVP demo
// In production this comes from the database + blockchain

export interface HoldingEntry {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyCity: string;
  propertyState: string;
  propertyImage: string;
  propertyType: string;
  tokenCount: number;
  tokenPrice: number;
  currentValue: number;
  ownershipPercent: number;
  annualYield: number;
  monthlyIncome: number;
  purchasedAt: string;
  status: "FUNDING" | "ACTIVE" | "FUNDED";
}

export interface PayoutEntry {
  id: string;
  propertyName: string;
  amount: number;
  type: "RENTAL_INCOME" | "DISTRIBUTION";
  date: string;
  status: "COMPLETED" | "SCHEDULED";
}

export interface EarningsPoint {
  month: string;
  income: number;
  cumulative: number;
}

export const mockHoldings: HoldingEntry[] = [
  {
    id: "h1",
    propertyId: "oakwood-lofts",
    propertyName: "Oakwood Lofts",
    propertyCity: "Nashville",
    propertyState: "TN",
    propertyImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80",
    propertyType: "Mixed-Use",
    tokenCount: 2000,
    tokenPrice: 1.25,
    currentValue: 2700,
    ownershipPercent: 0.208,
    annualYield: 7.5,
    monthlyIncome: 16.88,
    purchasedAt: "2025-11-14",
    status: "ACTIVE",
  },
  {
    id: "h2",
    propertyId: "riverside-townhomes",
    propertyName: "Riverside Townhomes",
    propertyCity: "Charlotte",
    propertyState: "NC",
    propertyImage: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80",
    propertyType: "Residential",
    tokenCount: 1600,
    tokenPrice: 1.25,
    currentValue: 2100,
    ownershipPercent: 0.308,
    annualYield: 7.8,
    monthlyIncome: 13.65,
    purchasedAt: "2025-12-02",
    status: "ACTIVE",
  },
  {
    id: "h3",
    propertyId: "lakeside-apartments",
    propertyName: "Lakeside Apartments",
    propertyCity: "Austin",
    propertyState: "TX",
    propertyImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80",
    propertyType: "Multi-Family",
    tokenCount: 800,
    tokenPrice: 1.25,
    currentValue: 1020,
    ownershipPercent: 0.118,
    annualYield: 8.2,
    monthlyIncome: 6.97,
    purchasedAt: "2026-01-20",
    status: "FUNDING",
  },
];

export const mockPayouts: PayoutEntry[] = [
  { id: "p1", propertyName: "Oakwood Lofts", amount: 16.88, type: "RENTAL_INCOME", date: "2026-02-01", status: "COMPLETED" },
  { id: "p2", propertyName: "Riverside Townhomes", amount: 13.65, type: "RENTAL_INCOME", date: "2026-02-01", status: "COMPLETED" },
  { id: "p3", propertyName: "Oakwood Lofts", amount: 16.88, type: "RENTAL_INCOME", date: "2026-01-01", status: "COMPLETED" },
  { id: "p4", propertyName: "Riverside Townhomes", amount: 13.65, type: "RENTAL_INCOME", date: "2026-01-01", status: "COMPLETED" },
  { id: "p5", propertyName: "Oakwood Lofts", amount: 16.88, type: "RENTAL_INCOME", date: "2025-12-01", status: "COMPLETED" },
  { id: "p6", propertyName: "Riverside Townhomes", amount: 13.65, type: "RENTAL_INCOME", date: "2025-12-01", status: "COMPLETED" },
  { id: "p7", propertyName: "Oakwood Lofts", amount: 16.88, type: "RENTAL_INCOME", date: "2025-11-01", status: "COMPLETED" },
  { id: "p8", propertyName: "Oakwood Lofts", amount: 16.88, type: "RENTAL_INCOME", date: "2026-03-01", status: "SCHEDULED" },
  { id: "p9", propertyName: "Riverside Townhomes", amount: 13.65, type: "RENTAL_INCOME", date: "2026-03-01", status: "SCHEDULED" },
];

export const mockEarnings: EarningsPoint[] = [
  { month: "Oct", income: 0, cumulative: 0 },
  { month: "Nov", income: 16.88, cumulative: 16.88 },
  { month: "Dec", income: 30.53, cumulative: 47.41 },
  { month: "Jan", income: 30.53, cumulative: 77.94 },
  { month: "Feb", income: 30.53, cumulative: 108.47 },
  { month: "Mar", income: 37.5, cumulative: 145.97 },
];

export const portfolioStats = {
  totalValue: 5820,
  totalInvested: 5500,
  monthlyIncome: 37.5,
  annualProjected: 450,
  propertiesOwned: 3,
  totalPayoutsReceived: 108.47,
  nextPayoutDate: "March 1, 2026",
  nextPayoutAmount: 37.5,
};
