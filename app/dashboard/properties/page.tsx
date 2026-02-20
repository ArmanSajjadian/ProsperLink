"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ArrowUpRight, TrendingUp, Layers } from "lucide-react";
import { mockHoldings, portfolioStats } from "@/lib/mockDashboard";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const PIE_COLORS = ["#D4A843", "#22C55E", "#3B82F6", "#A78BFA", "#F472B6"];

export default function MyPropertiesPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="flex justify-center h-64 items-center"><div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (!session) redirect("/login");

  const pieData = mockHoldings.map((h) => ({
    name: h.propertyName,
    value: h.currentValue,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">My Properties</h1>
        <p className="text-text-secondary text-sm mt-1">Your fractional token holdings across all properties</p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Value", value: `$${portfolioStats.totalValue.toLocaleString()}` },
          { label: "Monthly Income", value: `$${portfolioStats.monthlyIncome.toFixed(2)}`, gold: true },
          { label: "Properties", value: String(portfolioStats.propertiesOwned) },
        ].map((s) => (
          <div key={s.label} className="bg-surface-card border border-border-card rounded-card p-4">
            <p className="text-text-secondary text-xs mb-1">{s.label}</p>
            <p className={`text-xl font-bold font-heading ${s.gold ? "text-accent-gold" : "text-white"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holdings List */}
        <div className="lg:col-span-2 space-y-4">
          {mockHoldings.map((holding) => (
            <div key={holding.id} className="bg-surface-card border border-border-card rounded-card p-5">
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={holding.propertyImage} alt={holding.propertyName} fill className="object-cover" sizes="80px" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-heading text-base font-semibold text-white">{holding.propertyName}</h3>
                      <p className="text-text-secondary text-xs">{holding.propertyCity}, {holding.propertyState} · {holding.propertyType}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${
                      holding.status === "ACTIVE" ? "bg-success/10 text-success" :
                      holding.status === "FUNDED" ? "bg-success/10 text-success" :
                      "bg-accent-gold/10 text-accent-gold"
                    }`}>
                      {holding.status === "ACTIVE" ? "Earning" : holding.status === "FUNDED" ? "Funded" : "Funding"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    <div>
                      <p className="text-text-secondary text-xs mb-0.5">Tokens Owned</p>
                      <p className="text-white font-semibold text-sm flex items-center gap-1">
                        <Layers size={12} className="text-text-secondary" />
                        {holding.tokenCount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-secondary text-xs mb-0.5">Current Value</p>
                      <p className="text-white font-semibold text-sm">${holding.currentValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary text-xs mb-0.5">Annual Yield</p>
                      <p className="text-accent-gold font-semibold text-sm flex items-center gap-1">
                        <TrendingUp size={12} />{holding.annualYield}%
                      </p>
                    </div>
                    <div>
                      <p className="text-text-secondary text-xs mb-0.5">Monthly Income</p>
                      <p className="text-success font-semibold text-sm">
                        {holding.status === "ACTIVE" ? `$${holding.monthlyIncome.toFixed(2)}` : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-card">
                    <div>
                      <p className="text-text-secondary text-xs">Ownership share</p>
                      <p className="text-white text-sm font-medium">{holding.ownershipPercent.toFixed(3)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-text-secondary text-xs">Purchased</p>
                      <p className="text-white text-sm">{holding.purchasedAt}</p>
                    </div>
                    <Link
                      href={`/properties/${holding.propertyId}`}
                      className="flex items-center gap-1 text-accent-gold text-xs hover:text-accent-gold-hover transition-colors"
                    >
                      View Property <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Portfolio Pie Chart */}
        <div className="bg-surface-card border border-border-card rounded-card p-5">
          <h3 className="font-heading text-base font-semibold text-white mb-4">Portfolio Allocation</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#1A2A44", border: "1px solid #2A3A54", borderRadius: "8px" }}
                formatter={(value: number | undefined) => [`$${(value ?? 0).toLocaleString()}`, "Value"]}
                labelStyle={{ color: "#9CA3AF", fontSize: 12 }}
                itemStyle={{ color: "#fff", fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-text-secondary text-xs truncate">{item.name}</span>
                </div>
                <span className="text-white text-xs font-medium flex-shrink-0 ml-2">${item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
