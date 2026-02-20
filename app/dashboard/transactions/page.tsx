"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ArrowDownLeft, Clock, CheckCircle2, Search } from "lucide-react";
import { mockPayouts } from "@/lib/mockDashboard";

// Combine payouts + simulated token purchases
const allTransactions = [
  ...mockPayouts.map((p) => ({
    id: p.id,
    date: p.date,
    type: "PAYOUT" as const,
    description: `Rental Income — ${p.propertyName}`,
    amount: p.amount,
    status: p.status,
    sign: "+" as const,
  })),
  {
    id: "tx-buy-1",
    date: "2025-11-14",
    type: "PURCHASE" as const,
    description: "Token Purchase — Oakwood Lofts (2,000 tokens @ $1.25)",
    amount: 2500,
    status: "COMPLETED" as const,
    sign: "-" as const,
  },
  {
    id: "tx-buy-2",
    date: "2025-12-02",
    type: "PURCHASE" as const,
    description: "Token Purchase — Riverside Townhomes (1,600 tokens @ $1.25)",
    amount: 2000,
    status: "COMPLETED" as const,
    sign: "-" as const,
  },
  {
    id: "tx-buy-3",
    date: "2026-01-20",
    type: "PURCHASE" as const,
    description: "Token Purchase — Lakeside Apartments (800 tokens @ $1.25)",
    amount: 1000,
    status: "COMPLETED" as const,
    sign: "-" as const,
  },
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const typeLabels = {
  PAYOUT: { label: "Payout", color: "bg-success/10 text-success" },
  PURCHASE: { label: "Purchase", color: "bg-accent-gold/10 text-accent-gold" },
};

export default function TransactionsPage() {
  const { data: session, status } = useSession();
  const [filter, setFilter] = useState<"ALL" | "PAYOUT" | "PURCHASE">("ALL");
  const [search, setSearch] = useState("");

  if (status === "loading") {
    return <div className="flex justify-center h-64 items-center"><div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (!session) redirect("/login");

  const filtered = allTransactions.filter((tx) => {
    if (filter !== "ALL" && tx.type !== filter) return false;
    if (search && !tx.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPayouts = allTransactions.filter(t => t.type === "PAYOUT" && t.status === "COMPLETED").reduce((s, t) => s + t.amount, 0);
  const totalInvested = allTransactions.filter(t => t.type === "PURCHASE" && t.status === "COMPLETED").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Transactions</h1>
        <p className="text-text-secondary text-sm mt-1">Full history of purchases, payouts, and distributions</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-surface-card border border-border-card rounded-card p-4">
          <p className="text-text-secondary text-xs mb-1">Total Invested</p>
          <p className="text-white text-xl font-bold font-heading">${totalInvested.toLocaleString()}</p>
        </div>
        <div className="bg-surface-card border border-border-card rounded-card p-4">
          <p className="text-text-secondary text-xs mb-1">Total Received</p>
          <p className="text-success text-xl font-bold font-heading">${totalPayouts.toFixed(2)}</p>
        </div>
        <div className="bg-surface-card border border-border-card rounded-card p-4 col-span-2 sm:col-span-1">
          <p className="text-text-secondary text-xs mb-1">Transactions</p>
          <p className="text-white text-xl font-bold font-heading">{allTransactions.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-card border border-border-card rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-text-secondary focus:outline-none focus:border-accent-gold/50 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {(["ALL", "PAYOUT", "PURCHASE"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === f
                  ? "bg-accent-gold text-primary-dark"
                  : "bg-surface-card border border-border-card text-text-secondary hover:text-white"
              }`}
            >
              {f === "ALL" ? "All" : f === "PAYOUT" ? "Payouts" : "Purchases"}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-surface-card border border-border-card rounded-card overflow-hidden">
        <div className="divide-y divide-border-card">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-text-secondary">No transactions found</div>
          ) : (
            filtered.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 px-5 py-4 hover:bg-primary-navy/50 transition-colors">
                {/* Icon */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  tx.type === "PAYOUT" ? "bg-success/10" : "bg-accent-gold/10"
                }`}>
                  {tx.type === "PAYOUT"
                    ? <ArrowDownLeft size={16} className="text-success" />
                    : <ArrowDownLeft size={16} className="text-accent-gold rotate-90" />
                  }
                </div>

                {/* Description */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{tx.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${typeLabels[tx.type].color}`}>
                      {typeLabels[tx.type].label}
                    </span>
                    <span className="text-text-secondary text-xs">{tx.date}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {tx.status === "COMPLETED"
                    ? <CheckCircle2 size={14} className="text-success" />
                    : <Clock size={14} className="text-accent-gold" />
                  }
                  <span className={`text-xs ${tx.status === "COMPLETED" ? "text-success" : "text-accent-gold"}`}>
                    {tx.status === "COMPLETED" ? "Completed" : "Scheduled"}
                  </span>
                </div>

                {/* Amount */}
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold ${tx.sign === "+" ? "text-success" : "text-white"}`}>
                    {tx.sign}${tx.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
