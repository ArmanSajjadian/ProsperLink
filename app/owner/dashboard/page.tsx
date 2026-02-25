"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  DollarSign,
  Users,
  TrendingUp,
  PlusCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import OwnerStatCard from "@/components/OwnerStatCard";
import PropertyListingCard from "@/components/PropertyListingCard";
import OwnerEmptyState from "@/components/OwnerEmptyState";
import type { OwnerProperty, OwnerPropertyStatus } from "@/lib/mockOwner";

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#1A2A44",
    border: "1px solid #2A3A54",
    borderRadius: "8px",
  },
  labelStyle: { color: "#9CA3AF", fontSize: 12 },
};

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Shape returned by GET /api/owner/properties (Prisma Property + _count)
interface ApiProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  type: string;
  imageUrl: string;
  totalValue: number;
  fundedAmount: number;
  totalTokens: number;
  tokenPrice: number;
  annualYield: number;
  status: string;
  createdAt: string;
  spvEntity: string;
  jurisdiction: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  sqft?: number | null;
  yearBuilt?: number | null;
  description: string;
  highlights: string[];
  _count: { tokenHoldings: number };
}

function toOwnerProperty(p: ApiProperty): OwnerProperty {
  return {
    id: p.id,
    name: p.name,
    address: p.address,
    city: p.city,
    state: p.state,
    zipCode: "",
    propertyType: (p.type ?? "Residential") as OwnerProperty["propertyType"],
    image: p.imageUrl || "/images/placeholder-property.jpg",
    totalValue: p.totalValue,
    targetRaise: p.totalValue,
    fundedAmount: p.fundedAmount,
    totalTokens: p.totalTokens,
    tokenPrice: p.tokenPrice,
    annualYield: p.annualYield,
    status: p.status as OwnerPropertyStatus,
    listedAt: p.createdAt,
    investorCount: p._count.tokenHoldings,
    spvEntity: p.spvEntity,
    spvJurisdiction: p.jurisdiction,
    bedrooms: p.bedrooms ?? undefined,
    bathrooms: p.bathrooms ?? undefined,
    sqft: p.sqft ?? undefined,
    yearBuilt: p.yearBuilt ?? undefined,
    description: p.description,
    highlights: p.highlights,
    fundingMilestones: [],
    monthlyInquiries: [],
    monthlyRevenue: [],
  };
}

export default function OwnerDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [properties, setProperties] = useState<OwnerProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/owner/properties")
      .then((r) => r.json())
      .then((data: ApiProperty[]) => setProperties(data.map(toOwnerProperty)))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) return <Spinner />;
  if (!session) return null;

  // Compute summary stats from real data
  const totalListings = properties.length;
  const activeListings = properties.filter(
    (p) => p.status === "ACTIVE" || p.status === "FUNDING" || p.status === "FUNDED"
  ).length;
  const inReview = properties.filter((p) => p.status === "REVIEW").length;
  const drafts = properties.filter((p) => p.status === "DRAFT").length;
  const totalRaised = properties.reduce((sum, p) => sum + p.fundedAmount, 0);
  const totalInvestors = properties.reduce((sum, p) => sum + p.investorCount, 0);
  const monthlyRevenue = properties
    .filter((p) => p.status === "ACTIVE")
    .reduce((sum, p) => sum + (p.annualYield / 100) * p.fundedAmount / 12, 0);

  const subParts: string[] = [];
  if (activeListings > 0) subParts.push(`${activeListings} active`);
  if (inReview > 0) subParts.push(`${inReview} in review`);
  if (drafts > 0) subParts.push(`${drafts} draft`);
  const statSub = subParts.length > 0 ? subParts.join(", ") : "No properties yet";

  // Charts only render when properties have monthly data
  const fundingProp = properties.find((p) => p.status === "FUNDING" && p.monthlyInquiries.length > 0);
  const activeProp = properties.find((p) => p.status === "ACTIVE" && p.monthlyRevenue.length > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">
            My Listed Properties
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Track funding progress, investor activity, and income across your
            properties.
          </p>
        </div>
        <Link
          href="/owner/list"
          className="flex items-center gap-2 bg-accent-gold hover:bg-accent-gold-hover text-primary-dark text-sm font-bold px-4 py-2.5 rounded-lg transition-colors flex-shrink-0"
        >
          <PlusCircle size={15} />
          List New Property
        </Link>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <OwnerStatCard
          icon={Building2}
          label="Total Listed"
          value={String(totalListings)}
          sub={statSub}
        />
        <OwnerStatCard
          icon={DollarSign}
          label="Total Raised"
          value={totalRaised >= 1_000_000
            ? `$${(totalRaised / 1_000_000).toFixed(2)}M`
            : `$${totalRaised.toLocaleString()}`}
          sub="Across all listings"
        />
        <OwnerStatCard
          icon={Users}
          label="Total Investors"
          value={String(totalInvestors)}
          sub="Across all properties"
        />
        <OwnerStatCard
          icon={TrendingUp}
          label="Monthly Revenue"
          value={`$${Math.round(monthlyRevenue).toLocaleString()}`}
          sub="From active properties"
          gold
        />
      </div>

      {/* Property cards */}
      {properties.length === 0 ? (
        <OwnerEmptyState
          icon={Building2}
          title="No properties listed yet"
          description="List your first property to start raising capital from investors."
          ctaLabel="List a Property"
          ctaHref="/owner/list"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {properties.map((p) => (
            <PropertyListingCard key={p.id} property={p} />
          ))}
        </div>
      )}

      {/* Charts — only shown when monthly data is available */}
      {(fundingProp || activeProp) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {fundingProp && (
            <div className="bg-surface-card border border-border-card rounded-card p-5">
              <h2 className="font-heading text-base font-semibold text-white mb-0.5">
                Investor Interest
              </h2>
              <p className="text-text-secondary text-xs mb-4">
                Monthly inquiries — {fundingProp.name}
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={fundingProp.monthlyInquiries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A3A54" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#9CA3AF", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#9CA3AF", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(v: number | undefined) => [v ?? 0, "Inquiries"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#D4A843"
                    strokeWidth={2}
                    dot={{ fill: "#D4A843", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeProp && (
            <div className="bg-surface-card border border-border-card rounded-card p-5">
              <h2 className="font-heading text-base font-semibold text-white mb-0.5">
                Monthly Rental Revenue
              </h2>
              <p className="text-text-secondary text-xs mb-4">
                Net distributions — {activeProp.name}
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={activeProp.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A3A54" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#9CA3AF", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#9CA3AF", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(v: number | undefined) => [
                      `$${(v ?? 0).toLocaleString()}`,
                      "Revenue",
                    ]}
                  />
                  <Bar dataKey="amount" fill="#22C55E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
