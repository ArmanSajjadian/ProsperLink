"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import {
  TrendingUp,
  Building2,
  DollarSign,
  Calendar,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Holding {
  id: string; propertyId: string; propertyName: string; propertyCity: string;
  propertyState: string; propertyImage: string; tokenCount: number;
  currentValue: number; ownershipPercent: number; annualYield: number;
  monthlyIncome: number; status: string;
}
interface Transaction {
  id: string; date: string; type: "PURCHASE" | "PAYOUT";
  description: string; amount: number; status: string; sign: "+" | "-";
}
interface EarningsPoint { month: string; income: number; cumulative: number; }
interface Stats {
  totalValue: number; totalInvested: number; monthlyIncome: number;
  annualProjected: number; propertiesOwned: number; totalPayoutsReceived: number;
}
interface DashboardData {
  holdings: Holding[]; transactions: Transaction[];
  earningsChart: EarningsPoint[]; stats: Stats;
}

function StatCard({ icon: Icon, label, value, sub, gold }: {
  icon: React.ElementType; label: string; value: string; sub?: string; gold?: boolean;
}) {
  return (
    <div className="bg-surface-card border border-border-card rounded-card p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-text-secondary text-sm">{label}</p>
        <div className="w-8 h-8 rounded-lg bg-accent-gold/10 flex items-center justify-center">
          <Icon size={16} className="text-accent-gold" />
        </div>
      </div>
      <p className={`text-2xl font-bold font-heading ${gold ? "text-accent-gold" : "text-white"}`}>{value}</p>
      {sub && <p className="text-text-secondary text-xs mt-1">{sub}</p>}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/dashboard")
        .then((r) => r.json())
        .then((d) => { setData(d); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading") return <Spinner />;
  if (!session) redirect("/login");
  if (loading) return <Spinner />;

  const stats = data?.stats;
  const recentPayouts = (data?.transactions ?? []).filter((t) => t.type === "PAYOUT" && t.status === "COMPLETED").slice(0, 4);
  const holdings = data?.holdings ?? [];
  const earningsChart = data?.earningsChart ?? [];
  const hasHoldings = holdings.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">
          Welcome back, {session.user?.name?.split(" ")[0] ?? "Investor"}
        </h1>
        <p className="text-text-secondary text-sm mt-1">Here&apos;s how your portfolio is performing.</p>
      </div>

      {!hasHoldings && (
        <div className="bg-surface-card border border-border-card rounded-card p-8 text-center">
          <Building2 size={40} className="text-text-secondary mx-auto mb-3" />
          <h2 className="font-heading text-lg font-semibold text-white mb-2">No investments yet</h2>
          <p className="text-text-secondary text-sm mb-4">Browse available properties and make your first investment.</p>
          <Link href="/properties" className="inline-flex items-center gap-2 bg-accent-gold hover:bg-accent-gold-hover text-primary-dark font-bold px-6 py-2.5 rounded-lg transition-colors text-sm">
            Browse Properties <ArrowUpRight size={16} />
          </Link>
        </div>
      )}

      {hasHoldings && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={DollarSign} label="Portfolio Value" value={`$${(stats?.totalValue ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} sub={`$${(stats?.totalInvested ?? 0).toLocaleString()} invested`} />
            <StatCard icon={TrendingUp} label="Monthly Income" value={`$${(stats?.monthlyIncome ?? 0).toFixed(2)}`} sub="Projected from holdings" gold />
            <StatCard icon={Building2} label="Properties Owned" value={String(stats?.propertiesOwned ?? 0)} sub="Across your portfolio" />
            <StatCard icon={Calendar} label="Total Earned" value={`$${(stats?.totalPayoutsReceived ?? 0).toFixed(2)}`} sub="Payouts received" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-surface-card border border-border-card rounded-card p-5">
              <h2 className="font-heading text-base font-semibold text-white mb-5">Estimated Monthly Income (6 months)</h2>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={earningsChart} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4A843" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D4A843" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A3A54" />
                  <XAxis dataKey="month" tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1A2A44", border: "1px solid #2A3A54", borderRadius: "8px" }}
                    labelStyle={{ color: "#9CA3AF", fontSize: 12 }}
                    itemStyle={{ color: "#D4A843" }}
                    formatter={(value: number | undefined) => [`$${(value ?? 0).toFixed(2)}`, "Cumulative"]}
                  />
                  <Area type="monotone" dataKey="cumulative" stroke="#D4A843" strokeWidth={2} fill="url(#goldGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <div className="bg-surface-card border border-border-card rounded-card p-5">
                <h3 className="font-heading text-sm font-semibold text-white mb-3">Projected Annual Income</h3>
                <p className="text-3xl font-bold text-accent-gold font-heading">${(stats?.annualProjected ?? 0).toFixed(2)}</p>
                <p className="text-text-secondary text-xs mt-1">Based on current holdings</p>
              </div>
              <div className="bg-success/10 border border-success/20 rounded-card p-4">
                <p className="text-success text-sm font-semibold">${(stats?.monthlyIncome ?? 0).toFixed(2)} / month</p>
                <p className="text-text-secondary text-xs mt-1">Estimated monthly passive income</p>
              </div>
            </div>
          </div>

          <div className="bg-surface-card border border-border-card rounded-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-base font-semibold text-white">My Holdings</h2>
              <Link href="/dashboard/properties" className="text-accent-gold text-xs hover:text-accent-gold-hover flex items-center gap-1 transition-colors">
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {holdings.slice(0, 3).map((holding) => (
                <div key={holding.id} className="flex items-center gap-4 p-3 bg-primary-navy rounded-lg">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={holding.propertyImage} alt={holding.propertyName} fill className="object-cover" sizes="48px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{holding.propertyName}</p>
                    <p className="text-text-secondary text-xs">{holding.propertyCity}, {holding.propertyState}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white text-sm font-bold">${holding.currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    <p className="text-accent-gold text-xs">{holding.annualYield}% yield</p>
                  </div>
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <p className="text-text-secondary text-xs">{holding.tokenCount.toLocaleString()} tokens</p>
                    <p className="text-text-secondary text-xs">{holding.ownershipPercent.toFixed(3)}% owned</p>
                  </div>
                  <Link href={`/properties/${holding.propertyId}`} className="text-text-secondary hover:text-white transition-colors">
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {recentPayouts.length > 0 && (
            <div className="bg-surface-card border border-border-card rounded-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-base font-semibold text-white">Recent Payouts</h2>
                <Link href="/dashboard/transactions" className="text-accent-gold text-xs hover:text-accent-gold-hover flex items-center gap-1 transition-colors">
                  View all <ChevronRight size={14} />
                </Link>
              </div>
              <div className="space-y-2">
                {recentPayouts.map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between py-2 border-b border-border-card last:border-0">
                    <div>
                      <p className="text-white text-sm">{payout.description}</p>
                      <p className="text-text-secondary text-xs">{payout.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-success text-sm font-semibold">+${payout.amount.toFixed(2)}</p>
                      <p className="text-text-secondary text-xs">Completed</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
