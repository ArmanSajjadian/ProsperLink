"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Wallet, Clock } from "lucide-react";

interface WalletData {
  walletBalance: number;
  deployedCapital: number;
}

function Spinner() {
  return <div className="flex justify-center h-64 items-center"><div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" /></div>;
}

export default function WalletPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/wallet").then((r) => r.json()),
        fetch("/api/dashboard").then((r) => r.json()),
      ])
        .then(([walletRes, dashboardRes]) => {
          setData({
            walletBalance: walletRes.walletBalance ?? 0,
            deployedCapital: dashboardRes.stats?.totalValue ?? 0,
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading" || loading) return <Spinner />;
  if (!session) redirect("/login");

  const walletBalance = data?.walletBalance ?? 0;
  const deployedCapital = data?.deployedCapital ?? 0;
  const totalPortfolio = walletBalance + deployedCapital;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">My Wallet</h1>
        <p className="text-text-secondary text-sm mt-1">Manage your reserve balance and view deployed capital</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-card border border-border-card rounded-card p-5">
          <p className="text-text-secondary text-xs mb-1">Available Balance</p>
          <p className="text-accent-gold text-2xl font-bold font-heading">
            ${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-text-secondary text-xs mt-1">Ready to invest</p>
        </div>
        <div className="bg-surface-card border border-border-card rounded-card p-5">
          <p className="text-text-secondary text-xs mb-1">Deployed Capital</p>
          <p className="text-white text-2xl font-bold font-heading">
            ${deployedCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-text-secondary text-xs mt-1">Invested in properties</p>
        </div>
        <div className="bg-surface-card border border-border-card rounded-card p-5">
          <p className="text-text-secondary text-xs mb-1">Total Portfolio</p>
          <p className="text-white text-2xl font-bold font-heading">
            ${totalPortfolio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-text-secondary text-xs mt-1">Wallet + investments</p>
        </div>
      </div>

      <div className="bg-surface-card border border-border-card rounded-card p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center mx-auto mb-4">
          <Wallet size={24} className="text-accent-gold" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Clock size={14} className="text-text-secondary" />
          <span className="text-text-secondary text-xs font-medium uppercase tracking-wide">Coming Soon</span>
        </div>
        <h2 className="font-heading text-lg font-semibold text-white mb-2">Deposits &amp; Withdrawals</h2>
        <p className="text-text-secondary text-sm max-w-sm mx-auto">
          Deposit and withdrawal functionality will be available soon. Your available balance will be used automatically when investing in properties.
        </p>
      </div>
    </div>
  );
}
