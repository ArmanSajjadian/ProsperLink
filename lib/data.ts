export interface Property {
  id: string;
  name: string;
  location: {
    address: string;
    city: string;
    state: string;
  };
  type: string;
  image: string;
  totalValue: number;
  totalTokens: number;
  tokenPrice: number;
  annualYield: number;
  fundedAmount: number;
  status: "FUNDING" | "FUNDED" | "ACTIVE";
  description: string;
  highlights: string[];
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  yearBuilt?: number;
  spvDetails: {
    entity: string;
    jurisdiction: string;
  };
}

export const properties: Property[] = [
  {
    id: "lakeside-apartments",
    name: "Lakeside Apartments",
    location: {
      address: "1200 Lake Shore Drive",
      city: "Austin",
      state: "TX",
    },
    type: "Multi-Family",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    totalValue: 850000,
    totalTokens: 680000,
    tokenPrice: 1.25,
    annualYield: 8.2,
    fundedAmount: 637500,
    status: "FUNDING",
    description:
      "A well-maintained 12-unit apartment complex situated on the shores of Lake Travis. This property has delivered consistent rental income for over a decade and is located in one of Austin's fastest-growing neighborhoods. Strong occupancy rates (97% average over 5 years) and below-market rents provide meaningful upside through lease renewals.",
    highlights: [
      "97% average occupancy rate over 5 years",
      "Below-market rents with 15% upside potential",
      "Recently renovated common areas and roof",
      "Walking distance to tech campuses",
      "Professional property management in place",
    ],
    bedrooms: 48,
    bathrooms: 48,
    sqft: 18400,
    yearBuilt: 2008,
    spvDetails: {
      entity: "Lakeside Austin LLC",
      jurisdiction: "Delaware",
    },
  },
  {
    id: "oakwood-lofts",
    name: "Oakwood Lofts",
    location: {
      address: "840 Oak Street",
      city: "Nashville",
      state: "TN",
    },
    type: "Mixed-Use",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    totalValue: 1200000,
    totalTokens: 960000,
    tokenPrice: 1.25,
    annualYield: 7.5,
    fundedAmount: 960000,
    status: "FUNDED",
    description:
      "Oakwood Lofts is a premium mixed-use development in the heart of Nashville's East Side—one of the most sought-after neighborhoods in the country. The ground floor features two long-term commercial tenants (a boutique coffee shop and fitness studio), while the upper floors house 8 luxury loft apartments at premium rents.",
    highlights: [
      "100% funded — now generating rental income",
      "Long-term commercial tenants (5-year leases)",
      "Located in Nashville's hottest neighborhood",
      "Luxury finishes commanding top-tier rents",
      "Monthly payouts distributed to token holders",
    ],
    bedrooms: 8,
    bathrooms: 10,
    sqft: 12800,
    yearBuilt: 2019,
    spvDetails: {
      entity: "Oakwood Nashville LLC",
      jurisdiction: "Delaware",
    },
  },
  {
    id: "marina-vista",
    name: "Marina Vista Condos",
    location: {
      address: "3300 Harbor Blvd",
      city: "Miami",
      state: "FL",
    },
    type: "Residential",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    totalValue: 2100000,
    totalTokens: 1680000,
    tokenPrice: 1.25,
    annualYield: 6.8,
    fundedAmount: 630000,
    status: "FUNDING",
    description:
      "Marina Vista Condos is a 6-unit luxury condominium complex overlooking Miami's Biscayne Bay. Each unit features panoramic water views, designer interiors, and private balconies. The property is positioned in a high-demand vacation and long-term rental market, with strong short-term rental (Airbnb) potential offering significant yield upside.",
    highlights: [
      "Panoramic Biscayne Bay views",
      "High-demand vacation rental market",
      "30% funded — early investor pricing",
      "Short-term rental (STR) license secured",
      "Strong appreciation potential in Miami waterfront",
    ],
    bedrooms: 6,
    bathrooms: 8,
    sqft: 9600,
    yearBuilt: 2021,
    spvDetails: {
      entity: "Marina Vista Miami LLC",
      jurisdiction: "Delaware",
    },
  },
  {
    id: "summit-retail",
    name: "Summit Retail Plaza",
    location: {
      address: "590 Summit Ave",
      city: "Denver",
      state: "CO",
    },
    type: "Commercial",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
    totalValue: 3500000,
    totalTokens: 2800000,
    tokenPrice: 1.25,
    annualYield: 9.1,
    fundedAmount: 2450000,
    status: "FUNDING",
    description:
      "Summit Retail Plaza is a fully-leased 18,000 sq ft neighborhood retail center anchored by a national grocery chain in the fast-growing Denver suburbs. Triple-net (NNN) leases mean tenants cover taxes, insurance, and maintenance—delivering clean, predictable cash flow to investors with minimal management overhead.",
    highlights: [
      "Triple-net (NNN) leases — minimal owner expenses",
      "National grocery anchor tenant (10-year lease)",
      "70% funded with strong momentum",
      "9.1% projected annual yield",
      "Denver metro one of the fastest-growing US markets",
    ],
    sqft: 18000,
    yearBuilt: 2015,
    spvDetails: {
      entity: "Summit Denver LLC",
      jurisdiction: "Delaware",
    },
  },
  {
    id: "riverside-townhomes",
    name: "Riverside Townhomes",
    location: {
      address: "210 River Walk",
      city: "Charlotte",
      state: "NC",
    },
    type: "Residential",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
    totalValue: 650000,
    totalTokens: 520000,
    tokenPrice: 1.25,
    annualYield: 7.8,
    fundedAmount: 520000,
    status: "ACTIVE",
    description:
      "Riverside Townhomes is a 4-unit townhome development steps from the Charlotte Greenway trail system. All units are fully leased to long-term tenants with consistent payment history. This property is in the active income phase, with monthly rental distributions paid directly to token holders.",
    highlights: [
      "Fully leased — currently paying monthly income",
      "Long-term tenants with excellent payment history",
      "Charlotte is a top-10 fastest-growing US city",
      "Steps from popular Greenway trail",
      "Strong appreciation driven by Charlotte's growth",
    ],
    bedrooms: 16,
    bathrooms: 16,
    sqft: 7200,
    yearBuilt: 2017,
    spvDetails: {
      entity: "Riverside Charlotte LLC",
      jurisdiction: "Delaware",
    },
  },
];

export function getProperty(id: string): Property | undefined {
  return properties.find((p) => p.id === id);
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
