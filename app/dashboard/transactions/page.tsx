"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2, Search } from "lucide-react";

interface Transaction {
  id: string; date: string; type: "PURCHASE" | "PAYOUT" | "SALE";
  description: string; amount: number; status: string; sign: "+" | "-";
}

const typeLabels = {
  PAYOUT: { label: "Payout", color: "bg-success/10 text-success" },
  PURCHASE: { label: "Purchase", color: "bg-accent-gold/10 text-accent-gold" },
  SALE: { label: "Sale", color: "bg-red-500/10 text-red-400" },
};

function Spinner() {
  return <div className="flex justify-center h-64 items-center"><div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" /></div>;
}

export default function TransactionsPage() {
  const { data: session, status } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PAYOUT" | "PURCHASE" | "SALE">("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/dashboard")
        .then((r) => r.json())
        .then((d) => { setTransactions(d.transactions ?? []); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading" || loading) return <Spinner />;
  if (!session) redirect("/login");

  const filtered = transactions.filter((tx) => {
    if (filter !== "ALL" && tx.type !== filter) return false;
    if (search && !tx.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalInvested = transactions.filter((t) => t.type === "PURCHASE").reduce((s, t) => s + t.amount, 0);
  const totalPayouts = transactions.filter((t) => t.type === "PAYOUT" && t.status === "COMPLETED").reduce((s, t) => s + t.amount, 0);
  const totalSales = transactions.filter((t) => t.type === "SALE" && t.status === "COMPLETED").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Transactions</h1>
        <p className="text-text-secondary text-sm mt-1">Full history of purchases, payouts, sales, and distributions</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-surface-card border border-border-card rounded-card p-4">
          <p className="text-text-secondary text-xs mb-1">Total Invested</p>
          <p className="text-white text-xl font-bold font-heading">${totalInvested.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-surface-card border border-border-card rounded-card p-4">
          <p className="text-text-secondary text-xs mb-1">Total Received</p>
          <p className="text-success text-xl font-bold font-heading">${totalPayouts.toFixed(2)}</p>
        </div>
        <div className="bg-surface-card border border-border-card rounded-card p-4 col-span-2 sm:col-span-1">
          <p className="text-text-secondary text-xs mb-1">Total Sale Proceeds</p>
          <p className="text-red-400 text-xl font-bold font-heading">${totalSales.toFixed(2)}</p>
        </div>
      </div>

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
          {(["ALL", "PAYOUT", "PURCHASE", "SALE"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === f ? "bg-accent-gold text-primary-dark" : "bg-surface-card border border-border-card text-text-secondary hover:text-white"
              }`}
            >
              {f === "ALL" ? "All" : f === "PAYOUT" ? "Payouts" : f === "PURCHASE" ? "Purchases" : "Sales"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface-card border border-border-card rounded-card overflow-hidden">
        <div className="divide-y divide-border-card">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-text-secondary">No transactions found</div>
          ) : (
            filtered.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 px-5 py-4 hover:bg-primary-navy/50 transition-colors">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  tx.type === "PAYOUT" ? "bg-success/10" : tx.type === "SALE" ? "bg-red-500/10" : "bg-accent-gold/10"
                }`}>
                  {tx.type === "PAYOUT"
                    ? <ArrowDownLeft size={16} className="text-success" />
                    : tx.type === "SALE"
                      ? <ArrowUpRight size={16} className="text-red-400" />
                      : <ArrowUpRight size={16} className="text-accent-gold" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{tx.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${typeLabels[tx.type].color}`}>{typeLabels[tx.type].label}</span>
                    <span className="text-text-secondary text-xs">{tx.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {tx.status === "COMPLETED"
                    ? <CheckCircle2 size={14} className="text-success" />
                    : <Clock size={14} className="text-accent-gold" />
                  }
                  <span className={`text-xs ${tx.status === "COMPLETED" ? "text-success" : "text-accent-gold"}`}>
                    {tx.status === "COMPLETED" ? "Completed" : "Scheduled"}
                  </span>
                </div>
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
