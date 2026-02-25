import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const properties = [
  {
    id: "lakeside-apartments",
    slug: "lakeside-apartments",
    name: "Lakeside Apartments",
    description: "A well-maintained 12-unit apartment complex situated on the shores of Lake Travis. This property has delivered consistent rental income for over a decade and is located in one of Austin's fastest-growing neighborhoods.",
    type: "Multi-Family",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    address: "1200 Lake Shore Drive",
    city: "Austin",
    state: "TX",
    totalValue: 850000,
    totalTokens: 680000,
    tokenPrice: 1.25,
    annualYield: 8.2,
    fundedAmount: 637500,
    status: "FUNDING",
    spvEntity: "Lakeside Austin LLC",
    jurisdiction: "Delaware",
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
  },
  {
    id: "oakwood-lofts",
    slug: "oakwood-lofts",
    name: "Oakwood Lofts",
    description: "Oakwood Lofts is a premium mixed-use development in the heart of Nashville's East Side. The ground floor features two long-term commercial tenants, while the upper floors house 8 luxury loft apartments.",
    type: "Mixed-Use",
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    address: "840 Oak Street",
    city: "Nashville",
    state: "TN",
    totalValue: 1200000,
    totalTokens: 960000,
    tokenPrice: 1.25,
    annualYield: 7.5,
    fundedAmount: 960000,
    status: "FUNDED",
    spvEntity: "Oakwood Nashville LLC",
    jurisdiction: "Delaware",
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
  },
  {
    id: "marina-vista",
    slug: "marina-vista",
    name: "Marina Vista Condos",
    description: "Marina Vista Condos is a 6-unit luxury condominium complex overlooking Miami's Biscayne Bay. Each unit features panoramic water views, designer interiors, and private balconies.",
    type: "Residential",
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    address: "3300 Harbor Blvd",
    city: "Miami",
    state: "FL",
    totalValue: 2100000,
    totalTokens: 1680000,
    tokenPrice: 1.25,
    annualYield: 6.8,
    fundedAmount: 630000,
    status: "FUNDING",
    spvEntity: "Marina Vista Miami LLC",
    jurisdiction: "Delaware",
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
  },
  {
    id: "summit-retail",
    slug: "summit-retail",
    name: "Summit Retail Plaza",
    description: "Summit Retail Plaza is a fully-leased 18,000 sq ft neighborhood retail center anchored by a national grocery chain. Triple-net leases deliver clean, predictable cash flow.",
    type: "Commercial",
    imageUrl: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
    address: "590 Summit Ave",
    city: "Denver",
    state: "CO",
    totalValue: 3500000,
    totalTokens: 2800000,
    tokenPrice: 1.25,
    annualYield: 9.1,
    fundedAmount: 2450000,
    status: "FUNDING",
    spvEntity: "Summit Denver LLC",
    jurisdiction: "Delaware",
    highlights: [
      "Triple-net (NNN) leases — minimal owner expenses",
      "National grocery anchor tenant (10-year lease)",
      "70% funded with strong momentum",
      "9.1% projected annual yield",
      "Denver metro one of the fastest-growing US markets",
    ],
    sqft: 18000,
    yearBuilt: 2015,
  },
  {
    id: "riverside-townhomes",
    slug: "riverside-townhomes",
    name: "Riverside Townhomes",
    description: "Riverside Townhomes is a 4-unit townhome development steps from the Charlotte Greenway trail system. All units are fully leased with consistent payment history.",
    type: "Residential",
    imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
    address: "210 River Walk",
    city: "Charlotte",
    state: "NC",
    totalValue: 650000,
    totalTokens: 520000,
    tokenPrice: 1.25,
    annualYield: 7.8,
    fundedAmount: 520000,
    status: "ACTIVE",
    spvEntity: "Riverside Charlotte LLC",
    jurisdiction: "Delaware",
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
  },
];

async function main() {
  console.log("Seeding properties...");
  for (const property of properties) {
    await prisma.property.upsert({
      where: { id: property.id },
      update: {
        fundedAmount: property.fundedAmount,
        status: property.status,
        highlights: property.highlights ?? [],
        bedrooms: property.bedrooms ?? null,
        bathrooms: property.bathrooms ?? null,
        sqft: property.sqft ?? null,
        yearBuilt: property.yearBuilt ?? null,
      },
      create: property,
    });
    console.log(`  ✓ ${property.name}`);
  }

  console.log("Seeding demo investor...");
  // Demo investor with $10,000 wallet balance for development/testing.
  // Password: "password123" (bcrypt hash below)
  const demoInvestor = await prisma.user.upsert({
    where: { email: "investor@demo.com" },
    update: { walletBalance: 10000 },
    create: {
      email: "investor@demo.com",
      name: "Demo Investor",
      walletBalance: 10000,
      passwordHash: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // "password"
      role: "INVESTOR",
      kycStatus: "VERIFIED",
    },
  });
  console.log(`  ✓ ${demoInvestor.email} (walletBalance: $${demoInvestor.walletBalance})`);

  console.log("Done.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
