"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, TrendingUp, TrendingDown, Layers, Building2 } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import SellModal from "@/components/SellModal";

const PIE_COLORS = ["#D4A843", "#22C55E", "#3B82F6", "#A78BFA", "#F472B6"];

interface Holding {
  id: string; propertyId: string; propertyName: string; propertyCity: string;
  propertyState: string; propertyImage: string; propertyType: string;
  tokenCount: number; tokenPrice: number; currentValue: number; ownershipPercent: number;
  annualYield: number; monthlyIncome: number; purchasedAt: string; status: string;
}
interface Stats {
  totalValue: number; monthlyIncome: number; propertiesOwned: number;
}

interface SellTarget {
  propertyId: string;
  propertyName: string;
  propertyCity: string;
  propertyState: string;
  tokenPrice: number;
  totalOwnedTokens: number;
}

function Spinner() {
  return <div className="flex justify-center h-64 items-center"><div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" /></div>;
}

export default function MyPropertiesPage() {
  const { data: session, status } = useSession();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sellTarget, setSellTarget] = useState<SellTarget | null>(null);

  function fetchData() {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { setHoldings(d.holdings ?? []); setStats(d.stats ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  if (status === "loading" || loading) return <Spinner />;
  if (!session) redirect("/login");

  const pieData = holdings.map((h) => ({ name: h.propertyName, value: h.currentValue }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">My Properties</h1>
        <p className="text-text-secondary text-sm mt-1">Your fractional token holdings across all properties</p>
      </div>

      {holdings.length === 0 ? (
        <div className="bg-surface-card border border-border-card rounded-card p-8 text-center">
          <Building2 size={40} className="text-text-secondary mx-auto mb-3" />
          <h2 className="font-heading text-lg font-semibold text-white mb-2">No holdings yet</h2>
          <p className="text-text-secondary text-sm mb-4">Browse properties and invest to build your portfolio.</p>
          <Link href="/properties" className="inline-flex items-center gap-2 bg-accent-gold hover:bg-accent-gold-hover text-primary-dark font-bold px-6 py-2.5 rounded-lg transition-colors text-sm">
            Browse Properties <ArrowUpRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Value", value: `$${(stats?.totalValue ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
              { label: "Monthly Income", value: `$${(stats?.monthlyIncome ?? 0).toFixed(2)}`, gold: true },
              { label: "Properties", value: String(stats?.propertiesOwned ?? 0) },
            ].map((s) => (
              <div key={s.label} className="bg-surface-card border border-border-card rounded-card p-4">
                <p className="text-text-secondary text-xs mb-1">{s.label}</p>
                <p className={`text-xl font-bold font-heading ${s.gold ? "text-accent-gold" : "text-white"}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {holdings.map((holding) => (
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
                          <p className="text-white font-semibold text-sm">${holding.currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
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
                          <p className="text-white text-sm font-medium">{holding.ownershipPercent.toFixed(4)}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-text-secondary text-xs">Purchased</p>
                          <p className="text-white text-sm">{holding.purchasedAt}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Link href={`/properties/${holding.propertyId}`} className="flex items-center gap-1 text-accent-gold text-xs hover:text-accent-gold-hover transition-colors">
                            View Property <ArrowUpRight size={13} />
                          </Link>
                          <button
                            onClick={() => setSellTarget({
                              propertyId: holding.propertyId,
                              propertyName: holding.propertyName,
                              propertyCity: holding.propertyCity,
                              propertyState: holding.propertyState,
                              tokenPrice: holding.tokenPrice,
                              totalOwnedTokens: holding.tokenCount,
                            })}
                            className="flex items-center gap-1 text-red-400 text-xs hover:text-red-300 transition-colors"
                          >
                            Sell Tokens <TrendingDown size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-surface-card border border-border-card rounded-card p-5">
              <h3 className="font-heading text-base font-semibold text-white mb-4">Portfolio Allocation</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
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
                    <span className="text-white text-xs font-medium flex-shrink-0 ml-2">${item.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {sellTarget && (
        <SellModal
          propertyId={sellTarget.propertyId}
          propertyName={sellTarget.propertyName}
          propertyCity={sellTarget.propertyCity}
          propertyState={sellTarget.propertyState}
          tokenPrice={sellTarget.tokenPrice}
          totalOwnedTokens={sellTarget.totalOwnedTokens}
          onSuccess={fetchData}
          onClose={() => setSellTarget(null)}
        />
      )}
    </div>
  );
}
