// Simulated owner/seller portfolio data for Phase 3 MVP demo
// In production this comes from the database + blockchain

export type OwnerPropertyStatus =
  | "DRAFT"
  | "REVIEW"
  | "FUNDING"
  | "FUNDED"
  | "ACTIVE"
  | "CLOSED";

export type DocumentCategory = "FINANCIAL" | "LEGAL" | "PROPERTY" | "COMPLIANCE";

export type DocumentStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "DRAFT";

export interface OwnerDocument {
  id: string;
  propertyId: string;
  fileName: string;
  fileType: "PDF" | "DOCX" | "XLSX" | "JPG" | "PNG";
  fileSizeKb: number;
  category: DocumentCategory;
  status: DocumentStatus;
  uploadedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
  fileUrl?: string; // blob URL for in-session preview/download; absent for seeded mock docs
}

export interface FundingMilestone {
  percent: number;
  date: string;
  reached: boolean;
}

export interface MonthlyInquiry {
  month: string;
  count: number;
}

export interface MonthlyRevenue {
  month: string;
  amount: number;
}

export interface OwnerProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: "Residential" | "Multi-Family" | "Mixed-Use" | "Commercial";
  image: string;
  totalValue: number;
  targetRaise: number;
  fundedAmount: number;
  totalTokens: number;
  tokenPrice: number;
  annualYield: number;
  status: OwnerPropertyStatus;
  listedAt: string;
  investorCount: number;
  spvEntity: string;
  spvJurisdiction: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  yearBuilt?: number;
  description: string;
  highlights: string[];
  fundingMilestones: FundingMilestone[];
  monthlyInquiries: MonthlyInquiry[];
  monthlyRevenue: MonthlyRevenue[];
}

export const mockDocuments: OwnerDocument[] = [
  {
    id: "doc-1",
    propertyId: "harbor-heights",
    fileName: "HarborHeights_TitleDeed.pdf",
    fileType: "PDF",
    fileSizeKb: 1240,
    category: "LEGAL",
    status: "APPROVED",
    uploadedAt: "2026-01-08",
    reviewedAt: "2026-01-09",
  },
  {
    id: "doc-2",
    propertyId: "harbor-heights",
    fileName: "HarborHeights_InspectionReport_2025.pdf",
    fileType: "PDF",
    fileSizeKb: 4800,
    category: "PROPERTY",
    status: "APPROVED",
    uploadedAt: "2026-01-08",
    reviewedAt: "2026-01-09",
  },
  {
    id: "doc-3",
    propertyId: "harbor-heights",
    fileName: "HarborHeights_PnL_2025.xlsx",
    fileType: "XLSX",
    fileSizeKb: 320,
    category: "FINANCIAL",
    status: "PENDING_REVIEW",
    uploadedAt: "2026-02-15",
  },
  {
    id: "doc-4",
    propertyId: "harbor-heights",
    fileName: "LLC_OperatingAgreement.pdf",
    fileType: "PDF",
    fileSizeKb: 880,
    category: "LEGAL",
    status: "REJECTED",
    uploadedAt: "2026-01-08",
    reviewedAt: "2026-01-10",
    reviewNote:
      "Document is missing notarized signature on page 4. Please resubmit.",
  },
  {
    id: "doc-5",
    propertyId: "harbor-heights",
    fileName: "Appraisal_Oct2025.pdf",
    fileType: "PDF",
    fileSizeKb: 2100,
    category: "PROPERTY",
    status: "APPROVED",
    uploadedAt: "2026-01-10",
    reviewedAt: "2026-01-11",
  },
  {
    id: "doc-6",
    propertyId: "westside-warehouse",
    fileName: "WestsideLofts_TitleDeed.pdf",
    fileType: "PDF",
    fileSizeKb: 1100,
    category: "LEGAL",
    status: "APPROVED",
    uploadedAt: "2025-08-20",
    reviewedAt: "2025-08-22",
  },
];

export const mockOwnerProperties: OwnerProperty[] = [
  {
    id: "harbor-heights",
    name: "Harbor Heights Duplex",
    address: "441 Bayview Terrace",
    city: "Tampa",
    state: "FL",
    zipCode: "33602",
    propertyType: "Residential",
    image:
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
    totalValue: 480000,
    targetRaise: 320000,
    fundedAmount: 211200,
    totalTokens: 320000,
    tokenPrice: 1.0,
    annualYield: 7.4,
    status: "FUNDING",
    listedAt: "2026-01-10",
    investorCount: 38,
    spvEntity: "Harbor Heights Tampa LLC",
    spvJurisdiction: "Delaware",
    bedrooms: 4,
    bathrooms: 3,
    sqft: 3200,
    yearBuilt: 2016,
    description:
      "A well-maintained duplex in Tampa's Channelside district with strong short-term rental history and excellent access to downtown amenities.",
    highlights: [
      "Strong short-term rental history (87% occupancy)",
      "Walking distance to Amalie Arena",
      "Recently renovated kitchens in both units",
      "Off-street parking for 4 vehicles",
    ],
    fundingMilestones: [
      { percent: 25, date: "2026-01-22", reached: true },
      { percent: 50, date: "2026-02-08", reached: true },
      { percent: 75, date: "", reached: false },
      { percent: 100, date: "", reached: false },
    ],
    monthlyInquiries: [
      { month: "Oct", count: 4 },
      { month: "Nov", count: 9 },
      { month: "Dec", count: 14 },
      { month: "Jan", count: 22 },
      { month: "Feb", count: 31 },
    ],
    monthlyRevenue: [],
  },
  {
    id: "westside-warehouse",
    name: "Westside Warehouse Lofts",
    address: "190 Industrial Way",
    city: "Portland",
    state: "OR",
    zipCode: "97209",
    propertyType: "Mixed-Use",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    totalValue: 1800000,
    targetRaise: 1200000,
    fundedAmount: 1200000,
    totalTokens: 1200000,
    tokenPrice: 1.0,
    annualYield: 8.1,
    status: "ACTIVE",
    listedAt: "2025-09-01",
    investorCount: 124,
    spvEntity: "Westside Portland LLC",
    spvJurisdiction: "Delaware",
    bedrooms: 12,
    bathrooms: 14,
    sqft: 22000,
    yearBuilt: 2018,
    description:
      "Converted warehouse with 12 loft units and two ground-floor commercial spaces in Portland's Pearl District.",
    highlights: [
      "Fully funded — income-generating since Oct 2025",
      "100% occupancy across all residential units",
      "Commercial tenants on 3-year leases",
      "LEED-certified building, lower operating costs",
    ],
    fundingMilestones: [
      { percent: 25, date: "2025-09-15", reached: true },
      { percent: 50, date: "2025-09-28", reached: true },
      { percent: 75, date: "2025-10-10", reached: true },
      { percent: 100, date: "2025-10-22", reached: true },
    ],
    monthlyInquiries: [
      { month: "Sep", count: 45 },
      { month: "Oct", count: 28 },
      { month: "Nov", count: 12 },
      { month: "Dec", count: 8 },
      { month: "Jan", count: 6 },
    ],
    monthlyRevenue: [
      { month: "Nov", amount: 8100 },
      { month: "Dec", amount: 8100 },
      { month: "Jan", amount: 8100 },
      { month: "Feb", amount: 8100 },
    ],
  },
  {
    id: "pine-ridge-draft",
    name: "Pine Ridge Family Home",
    address: "88 Pine Ridge Road",
    city: "Boise",
    state: "ID",
    zipCode: "83702",
    propertyType: "Residential",
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    totalValue: 390000,
    targetRaise: 260000,
    fundedAmount: 0,
    totalTokens: 260000,
    tokenPrice: 1.0,
    annualYield: 6.9,
    status: "DRAFT",
    listedAt: "",
    investorCount: 0,
    spvEntity: "",
    spvJurisdiction: "",
    bedrooms: 4,
    bathrooms: 2,
    sqft: 2400,
    yearBuilt: 2012,
    description:
      "Single-family home in Boise's North End with strong appreciation potential and easy access to schools and parks.",
    highlights: [
      "Quiet residential neighborhood with low vacancy",
      "New roof installed 2023",
    ],
    fundingMilestones: [
      { percent: 25, date: "", reached: false },
      { percent: 50, date: "", reached: false },
      { percent: 75, date: "", reached: false },
      { percent: 100, date: "", reached: false },
    ],
    monthlyInquiries: [],
    monthlyRevenue: [],
  },
];

export const ownerStats = {
  totalListings: 3,
  activeListings: 1,
  totalRaised: mockOwnerProperties.reduce((acc, p) => acc + p.fundedAmount, 0),
  totalInvestors: mockOwnerProperties.reduce((acc, p) => acc + p.investorCount, 0),
  monthlyRevenue: 8100,
  documentsNeedingAction: mockDocuments.filter((d) => d.status === "REJECTED").length,
};

export function getOwnerPropertyDocuments(propertyId: string): OwnerDocument[] {
  return mockDocuments.filter((d) => d.propertyId === propertyId);
}
