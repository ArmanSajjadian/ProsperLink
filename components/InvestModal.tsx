"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { X, TrendingUp, Layers, DollarSign, CheckCircle, ArrowRight, AlertCircle } from "lucide-react";
import { Property } from "@/lib/data";
import Link from "next/link";

interface InvestModalProps {
  property: Property;
  onClose: () => void;
}

type Step = "amount" | "review" | "success";

export default function InvestModal({ property, onClose }: InvestModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tokenCount = Math.floor(amount / property.tokenPrice);
  const actualCost = tokenCount * property.tokenPrice;
  const ownershipPercent = (tokenCount / property.totalTokens) * 100;
  const monthlyIncome = (actualCost * (property.annualYield / 100)) / 12;

  const presets = [25, 100, 250, 500];

  async function handleConfirm() {
    if (!session) {
      router.push(`/login?callbackUrl=/properties/${property.id}`);
      return;
    }

    setError("");
    setLoading(true);

    const res = await fetch("/api/invest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId: property.id, tokenCount }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }

    setStep("success");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/80 backdrop-blur-sm">
      <div className="bg-surface-card border border-border-card rounded-card w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-card">
          <div>
            <h2 className="font-heading text-lg font-semibold text-white">Invest in {property.name}</h2>
            <p className="text-text-secondary text-xs mt-0.5">{property.location.city}, {property.location.state}</p>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {!session && (
          <div className="mx-5 mt-4 bg-accent-gold/10 border border-accent-gold/20 rounded-lg p-3">
            <p className="text-accent-gold text-xs font-semibold">Sign in required to invest</p>
            <p className="text-text-secondary text-xs mt-0.5">Create a free account to complete your investment.</p>
          </div>
        )}

        {step === "amount" && (
          <div className="p-5 space-y-5">
            <div>
              <label className="block text-text-secondary text-xs mb-2">Investment Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">$</span>
                <input
                  type="number"
                  min={property.tokenPrice}
                  step={property.tokenPrice}
                  value={amount}
                  onChange={(e) => setAmount(Math.max(property.tokenPrice, Number(e.target.value)))}
                  className="w-full bg-primary-dark border border-border-card rounded-lg pl-7 pr-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-accent-gold/50 transition-colors"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {presets.map((p) => (
                  <button
                    key={p}
                    onClick={() => setAmount(p)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      amount === p
                        ? "bg-accent-gold text-primary-dark"
                        : "bg-primary-dark border border-border-card text-text-secondary hover:text-white"
                    }`}
                  >
                    ${p}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-primary-navy rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-text-secondary text-sm">
                  <Layers size={14} /> Tokens received
                </div>
                <span className="text-white font-semibold">{tokenCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-text-secondary text-sm">
                  <DollarSign size={14} /> Actual cost
                </div>
                <span className="text-white font-semibold">${actualCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-text-secondary text-sm">
                  <TrendingUp size={14} /> Ownership share
                </div>
                <span className="text-white font-semibold">{ownershipPercent.toFixed(4)}%</span>
              </div>
              <div className="flex justify-between items-center border-t border-border-card pt-3">
                <div className="flex items-center gap-1.5 text-text-secondary text-sm">
                  <DollarSign size={14} /> Est. monthly income
                </div>
                <span className="text-accent-gold font-bold">${monthlyIncome.toFixed(2)}/mo</span>
              </div>
            </div>

            <button
              onClick={() => setStep("review")}
              disabled={tokenCount === 0}
              className="w-full bg-accent-gold hover:bg-accent-gold-hover disabled:opacity-50 text-primary-dark font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Review Investment <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === "review" && (
          <div className="p-5 space-y-5">
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-white font-semibold">Order Summary</h3>
              {[
                { label: "Property", value: property.name },
                { label: "Token price", value: `$${property.tokenPrice.toFixed(2)}` },
                { label: "Tokens", value: tokenCount.toLocaleString() },
                { label: "Ownership", value: `${ownershipPercent.toFixed(4)}%` },
                { label: "Annual yield", value: `${property.annualYield}%` },
                { label: "Est. monthly income", value: `$${monthlyIncome.toFixed(2)}`, gold: true },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-border-card last:border-0">
                  <span className="text-text-secondary text-sm">{row.label}</span>
                  <span className={`font-semibold text-sm ${row.gold ? "text-accent-gold" : "text-white"}`}>{row.value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-2 bg-accent-gold/10 rounded-lg px-3">
                <span className="text-white font-semibold">Total</span>
                <span className="text-accent-gold font-bold text-lg">${actualCost.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setError(""); setStep("amount"); }}
                className="flex-1 border border-border-card hover:border-accent-gold/40 text-white text-sm font-medium py-3 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 bg-accent-gold hover:bg-accent-gold-hover disabled:opacity-60 text-primary-dark font-bold py-3 rounded-lg transition-colors"
              >
                {loading ? "Processing..." : session ? "Confirm Investment" : "Sign In to Invest"}
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-success" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-white">Investment Confirmed!</h3>
              <p className="text-text-secondary text-sm mt-2">
                You now hold{" "}
                <span className="text-white font-medium">{tokenCount.toLocaleString()} tokens</span> of{" "}
                <span className="text-white font-medium">{property.name}</span>, earning an estimated{" "}
                <span className="text-accent-gold font-medium">${monthlyIncome.toFixed(2)}/month</span>.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 border border-border-card text-text-secondary text-sm py-2.5 rounded-lg hover:text-white transition-colors">
                Close
              </button>
              <Link
                href="/dashboard"
                onClick={onClose}
                className="flex-1 bg-accent-gold hover:bg-accent-gold-hover text-primary-dark font-bold text-sm py-2.5 rounded-lg transition-colors text-center"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
