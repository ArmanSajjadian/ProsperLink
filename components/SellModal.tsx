"use client";

import { useEffect, useState } from "react";
import { X, Layers, DollarSign, CheckCircle, ArrowRight, AlertCircle, TrendingDown } from "lucide-react";
import Link from "next/link";

interface SellModalProps {
  propertyId: string;
  propertyName: string;
  propertyCity: string;
  propertyState: string;
  tokenPrice: number;
  totalOwnedTokens: number;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = "tokens" | "review" | "success";

export default function SellModal({
  propertyId,
  propertyName,
  propertyCity,
  propertyState,
  tokenPrice,
  totalOwnedTokens,
  onClose,
  onSuccess,
}: SellModalProps) {
  const [step, setStep] = useState<Step>("tokens");
  const [tokenCount, setTokenCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const saleProceeds = tokenCount * tokenPrice;
  const remainingTokens = totalOwnedTokens - tokenCount;
  const remainingValue = remainingTokens * tokenPrice;
  const sellAll = tokenCount === totalOwnedTokens;

  const quickSelects = [
    { label: "25%", value: Math.floor(totalOwnedTokens * 0.25) },
    { label: "50%", value: Math.floor(totalOwnedTokens * 0.5) },
    { label: "75%", value: Math.floor(totalOwnedTokens * 0.75) },
    { label: "100%", value: totalOwnedTokens },
  ];

  // Trigger parent refresh when success screen mounts
  useEffect(() => {
    if (step === "success") {
      onSuccess();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  async function handleConfirm() {
    setError("");
    setLoading(true);

    const res = await fetch("/api/sell", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId, tokenCount }),
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
            <h2 className="font-heading text-lg font-semibold text-white">Sell Tokens — {propertyName}</h2>
            <p className="text-text-secondary text-xs mt-0.5">{propertyCity}, {propertyState}</p>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {step === "tokens" && (
          <div className="p-5 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-text-secondary text-xs">Tokens to Sell</label>
                <span className="text-text-secondary text-xs">
                  You own <span className="text-white font-medium">{totalOwnedTokens.toLocaleString()}</span> tokens
                </span>
              </div>
              <input
                type="number"
                min={0}
                max={totalOwnedTokens}
                step={1}
                value={tokenCount || ""}
                onChange={(e) => {
                  const val = Math.floor(Math.max(0, Math.min(totalOwnedTokens, Number(e.target.value))));
                  setTokenCount(val);
                }}
                placeholder="0"
                className="w-full bg-primary-dark border border-border-card rounded-lg px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-accent-gold/50 transition-colors"
              />
              <div className="flex gap-2 mt-2">
                {quickSelects.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => setTokenCount(q.value)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      tokenCount === q.value
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-primary-dark border border-border-card text-text-secondary hover:text-white"
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-primary-navy rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-text-secondary text-sm">
                  <Layers size={14} /> Tokens to sell
                </div>
                <span className="text-white font-semibold">{tokenCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-text-secondary text-sm">
                  <DollarSign size={14} /> Sale proceeds
                </div>
                <span className="text-red-400 font-bold">${saleProceeds.toFixed(2)}</span>
              </div>
              <div className="border-t border-border-card pt-3 flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-text-secondary text-sm">
                  <Layers size={14} /> Remaining tokens
                </div>
                <span className="text-white font-semibold">{remainingTokens.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-text-secondary text-sm">
                  <DollarSign size={14} /> Remaining value
                </div>
                <span className="text-white font-semibold">${remainingValue.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setStep("review")}
              disabled={tokenCount === 0}
              className="w-full bg-red-500/90 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Review Sale <ArrowRight size={16} />
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

            {sellAll && (
              <div className="flex items-start gap-2 bg-accent-gold/10 border border-accent-gold/20 rounded-lg p-3">
                <AlertCircle size={15} className="text-accent-gold flex-shrink-0 mt-0.5" />
                <p className="text-accent-gold text-xs">Selling all tokens will remove this property from your portfolio.</p>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-white font-semibold">Sale Summary</h3>
              {[
                { label: "Property", value: propertyName },
                { label: "Tokens to sell", value: tokenCount.toLocaleString() },
                { label: "Price per token", value: `$${tokenPrice.toFixed(2)}` },
                { label: "Tokens remaining", value: remainingTokens.toLocaleString() },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-border-card last:border-0">
                  <span className="text-text-secondary text-sm">{row.label}</span>
                  <span className="font-semibold text-sm text-white">{row.value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-2 bg-red-500/10 rounded-lg px-3">
                <span className="text-white font-semibold">Sale Proceeds</span>
                <span className="text-red-400 font-bold text-lg">${saleProceeds.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setError(""); setStep("tokens"); }}
                className="flex-1 border border-border-card hover:border-accent-gold/40 text-white text-sm font-medium py-3 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 bg-red-500/90 hover:bg-red-500 disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors"
              >
                {loading ? "Processing..." : "Confirm Sale"}
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
              <h3 className="font-heading text-xl font-bold text-white">Sale Confirmed!</h3>
              <p className="text-text-secondary text-sm mt-2">
                You sold <span className="text-white font-medium">{tokenCount.toLocaleString()} tokens</span> of{" "}
                <span className="text-white font-medium">{propertyName}</span> for{" "}
                <span className="text-red-400 font-medium">${saleProceeds.toFixed(2)}</span>.
                {sellAll
                  ? " This property has been removed from your portfolio."
                  : ` You have ${remainingTokens.toLocaleString()} tokens remaining.`}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 border border-border-card text-text-secondary text-sm py-2.5 rounded-lg hover:text-white transition-colors">
                Close
              </button>
              <Link
                href="/dashboard/transactions"
                onClick={onClose}
                className="flex-1 bg-surface-card hover:bg-primary-navy border border-border-card text-white font-semibold text-sm py-2.5 rounded-lg transition-colors text-center flex items-center justify-center gap-1.5"
              >
                <TrendingDown size={14} className="text-red-400" /> View Transactions
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
