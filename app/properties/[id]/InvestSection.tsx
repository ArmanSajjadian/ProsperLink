"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  Users,
  Calendar,
} from "lucide-react";
import { Property, formatCurrency, getFundedPercent } from "@/lib/data";
import InvestModal from "@/components/InvestModal";

interface InvestSectionProps {
  property: Property;
}

export default function InvestSection({ property }: InvestSectionProps) {
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  async function handleInvestClick() {
    if (session) {
      try {
        const res = await fetch("/api/wallet");
        if (res.ok) {
          const data = await res.json();
          setWalletBalance(data.walletBalance ?? 0);
        }
      } catch {
        // wallet fetch failed — modal will show, API enforces balance
      }
    }
    setShowModal(true);
  }

  const fundedPercent = getFundedPercent(property);
  const remaining = property.totalValue - property.fundedAmount;

  return (
    <div className="lg:col-span-1">
      {showModal && (
        <InvestModal property={property} walletBalance={walletBalance} onClose={() => setShowModal(false)} />
      )}

      <div className="sticky top-24 space-y-4">
        <div className="bg-surface-card border border-border-card rounded-card p-6">
          <h3 className="font-heading text-lg font-semibold text-white mb-5">
            Investment Summary
          </h3>

          {/* Progress */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-text-secondary text-sm">Funded</span>
              <span className="text-white font-bold text-lg">{fundedPercent}%</span>
            </div>
            <div className="progress-bar h-3">
              <div
                className={`progress-fill h-3 ${
                  property.status === "ACTIVE" || property.status === "FUNDED"
                    ? "bg-success"
                    : ""
                }`}
                style={{ width: `${fundedPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-text-secondary">
                {formatCurrency(property.fundedAmount)} raised
              </span>
              <span className="text-xs text-text-secondary">
                {formatCurrency(property.totalValue)} goal
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-3 mb-6">
            {[
              { icon: TrendingUp, label: "Annual Yield",    value: `${property.annualYield}%`, gold: true },
              { icon: DollarSign, label: "Token Price",     value: `$${property.tokenPrice.toFixed(2)}` },
              { icon: BarChart3,  label: "Remaining",       value: formatCurrency(remaining) },
              { icon: Users,      label: "Min. Investment", value: "$25" },
              { icon: Calendar,   label: "Payout Schedule", value: "Monthly" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between items-center py-2 border-b border-border-card last:border-0"
              >
                <div className="flex items-center gap-2">
                  <item.icon size={14} className="text-text-secondary" />
                  <span className="text-text-secondary text-sm">{item.label}</span>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    item.gold ? "text-accent-gold" : "text-white"
                  }`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          {property.status === "FUNDING" ? (
            <button
              onClick={handleInvestClick}
              className="block w-full text-center bg-accent-gold hover:bg-accent-gold-hover text-primary-dark font-bold py-3.5 rounded-lg transition-colors"
            >
              Invest Now
            </button>
          ) : property.status === "ACTIVE" ? (
            <div>
              <div className="bg-success/10 border border-success/20 rounded-lg p-3 mb-3 text-center">
                <p className="text-success text-sm font-medium">
                  Currently generating rental income
                </p>
              </div>
              <Link
                href="/signup"
                className="block w-full text-center border border-accent-gold/40 hover:bg-accent-gold/10 text-accent-gold font-semibold py-3 rounded-lg transition-colors text-sm"
              >
                Join Waitlist for Next Raise
              </Link>
            </div>
          ) : property.status === "REVIEW" ? (
            <div className="bg-blue-400/10 border border-blue-400/20 rounded-lg p-4 text-center">
              <p className="text-blue-400 font-semibold">In Review — Coming Soon</p>
              <p className="text-text-secondary text-xs mt-1">
                This property is under review and will open for investment soon.
              </p>
            </div>
          ) : (
            <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
              <p className="text-success font-semibold">Fully Funded</p>
              <p className="text-text-secondary text-xs mt-1">
                This property is no longer accepting investments
              </p>
            </div>
          )}

          <p className="text-text-secondary text-xs text-center mt-3">
            Sign up free to invest. KYC verification required.
          </p>
        </div>

        {/* SPV Info */}
        <div className="bg-surface-card border border-border-card rounded-card p-5">
          <h4 className="text-white font-semibold text-sm mb-3">Legal Structure</h4>
          <p className="text-text-secondary text-xs leading-relaxed">
            This property is held by{" "}
            <span className="text-white">{property.spvEntity}</span>, a{" "}
            {property.jurisdiction}-registered LLC. Tokens represent equity interests
            in the SPV.
          </p>
        </div>
      </div>
    </div>
  );
}
