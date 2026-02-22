"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
import { mockOwnerProperties, ownerStats } from "@/lib/mockOwner";

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

export default function OwnerDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status === "loading") return <Spinner />;
  if (!session) return null;

  // Pull the FUNDING property's monthly inquiries for the chart
  const fundingProp = mockOwnerProperties.find((p) => p.status === "FUNDING");
  const activeProp = mockOwnerProperties.find((p) => p.status === "ACTIVE");

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
          value={String(ownerStats.totalListings)}
          sub={`${ownerStats.activeListings} active, ${ownerStats.totalListings - ownerStats.activeListings - 1} in review, 1 draft`}
        />
        <OwnerStatCard
          icon={DollarSign}
          label="Total Raised"
          value={`$${(ownerStats.totalRaised / 1_000_000).toFixed(2)}M`}
          sub="Across all listings"
        />
        <OwnerStatCard
          icon={Users}
          label="Total Investors"
          value={String(ownerStats.totalInvestors)}
          sub="Across all properties"
        />
        <OwnerStatCard
          icon={TrendingUp}
          label="Monthly Revenue"
          value={`$${ownerStats.monthlyRevenue.toLocaleString()}`}
          sub="From active properties"
          gold
        />
      </div>

      {/* Property cards */}
      {mockOwnerProperties.length === 0 ? (
        <OwnerEmptyState
          icon={Building2}
          title="No properties listed yet"
          description="List your first property to start raising capital from investors."
          ctaLabel="List a Property"
          ctaHref="/owner/list"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {mockOwnerProperties.map((p) => (
            <PropertyListingCard key={p.id} property={p} />
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Investor interest chart */}
        {fundingProp && fundingProp.monthlyInquiries.length > 0 && (
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

        {/* Monthly revenue chart */}
        {activeProp && activeProp.monthlyRevenue.length > 0 && (
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
    </div>
  );
}
