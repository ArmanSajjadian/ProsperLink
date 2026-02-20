"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { TrendingUp, DollarSign, Calendar } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { mockEarnings, mockPayouts, portfolioStats, mockHoldings } from "@/lib/mockDashboard";

const monthlyBreakdown = [
  { month: "Nov", "Oakwood Lofts": 16.88, "Riverside Townhomes": 0 },
  { month: "Dec", "Oakwood Lofts": 16.88, "Riverside Townhomes": 13.65 },
  { month: "Jan", "Oakwood Lofts": 16.88, "Riverside Townhomes": 13.65 },
  { month: "Feb", "Oakwood Lofts": 16.88, "Riverside Townhomes": 13.65 },
];

export default function IncomeDashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="flex justify-center h-64 items-center"><div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (!session) redirect("/login");

  const completedPayouts = mockPayouts.filter((p) => p.status === "COMPLETED");
  const totalEarned = completedPayouts.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Income Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">Track your rental income and distribution history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: "Total Earned", value: `$${totalEarned.toFixed(2)}`, sub: "Since inception" },
          { icon: TrendingUp, label: "Monthly Run Rate", value: `$${portfolioStats.monthlyIncome.toFixed(2)}`, sub: "Current month", gold: true },
          { icon: Calendar, label: "Annual Projected", value: `$${portfolioStats.annualProjected}`, sub: "At current holdings" },
          { icon: TrendingUp, label: "Avg. Yield", value: "7.7%", sub: "Across all properties" },
        ].map((card) => (
          <div key={card.label} className="bg-surface-card border border-border-card rounded-card p-4">
            <div className="flex items-start justify-between mb-2">
              <p className="text-text-secondary text-xs">{card.label}</p>
              <card.icon size={14} className="text-accent-gold" />
            </div>
            <p className={`text-xl font-bold font-heading ${card.gold ? "text-accent-gold" : "text-white"}`}>{card.value}</p>
            <p className="text-text-secondary text-xs mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cumulative earnings line */}
        <div className="bg-surface-card border border-border-card rounded-card p-5">
          <h2 className="font-heading text-base font-semibold text-white mb-5">Cumulative Earnings</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mockEarnings} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3A54" />
              <XAxis dataKey="month" tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1A2A44", border: "1px solid #2A3A54", borderRadius: "8px" }}
                labelStyle={{ color: "#9CA3AF", fontSize: 12 }}
                itemStyle={{ color: "#D4A843" }}
                formatter={(v: number | undefined) => [`$${(v ?? 0).toFixed(2)}`, "Cumulative"]}
              />
              <Line type="monotone" dataKey="cumulative" stroke="#D4A843" strokeWidth={2.5} dot={{ fill: "#D4A843", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly income by property */}
        <div className="bg-surface-card border border-border-card rounded-card p-5">
          <h2 className="font-heading text-base font-semibold text-white mb-5">Monthly Income by Property</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyBreakdown} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3A54" />
              <XAxis dataKey="month" tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1A2A44", border: "1px solid #2A3A54", borderRadius: "8px" }}
                labelStyle={{ color: "#9CA3AF", fontSize: 12 }}
                formatter={(v: number | undefined) => [`$${(v ?? 0).toFixed(2)}`, ""]}
              />
              <Bar dataKey="Oakwood Lofts" fill="#D4A843" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Riverside Townhomes" fill="#22C55E" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-accent-gold" /><span className="text-text-secondary text-xs">Oakwood Lofts</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-success" /><span className="text-text-secondary text-xs">Riverside Townhomes</span></div>
          </div>
        </div>
      </div>

      {/* Per-Property Income Breakdown */}
      <div className="bg-surface-card border border-border-card rounded-card p-5">
        <h2 className="font-heading text-base font-semibold text-white mb-4">Income by Property</h2>
        <div className="space-y-4">
          {mockHoldings.filter(h => h.status === "ACTIVE").map((holding) => {
            const annual = holding.monthlyIncome * 12;
            return (
              <div key={holding.id} className="flex items-center gap-4 p-3 bg-primary-navy rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{holding.propertyName}</p>
                  <p className="text-text-secondary text-xs">{holding.ownershipPercent.toFixed(3)}% ownership · {holding.tokenCount.toLocaleString()} tokens</p>
                </div>
                <div className="text-right">
                  <p className="text-accent-gold text-sm font-bold">${holding.monthlyIncome.toFixed(2)}<span className="text-text-secondary text-xs font-normal">/mo</span></p>
                  <p className="text-text-secondary text-xs">${annual.toFixed(2)}/yr</p>
                </div>
                <div className="text-right">
                  <p className="text-success text-sm font-semibold">{holding.annualYield}%</p>
                  <p className="text-text-secondary text-xs">yield</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payout History Table */}
      <div className="bg-surface-card border border-border-card rounded-card p-5">
        <h2 className="font-heading text-base font-semibold text-white mb-4">Payout History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-card">
                <th className="text-left text-text-secondary text-xs py-2 pr-4 font-medium">Date</th>
                <th className="text-left text-text-secondary text-xs py-2 pr-4 font-medium">Property</th>
                <th className="text-left text-text-secondary text-xs py-2 pr-4 font-medium">Type</th>
                <th className="text-right text-text-secondary text-xs py-2 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-card">
              {completedPayouts.map((payout) => (
                <tr key={payout.id}>
                  <td className="py-3 pr-4 text-text-secondary text-xs">{payout.date}</td>
                  <td className="py-3 pr-4 text-white text-sm">{payout.propertyName}</td>
                  <td className="py-3 pr-4">
                    <span className="text-xs bg-accent-gold/10 text-accent-gold px-2 py-0.5 rounded-full">
                      Rental Income
                    </span>
                  </td>
                  <td className="py-3 text-right text-success font-semibold">+${payout.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
