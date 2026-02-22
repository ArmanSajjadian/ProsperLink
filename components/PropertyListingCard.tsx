"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Users, ExternalLink, FolderOpen } from "lucide-react";
import FundingProgressBar from "@/components/FundingProgressBar";
import type { OwnerProperty } from "@/lib/mockOwner";

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  DRAFT: { label: "Draft", className: "bg-border-card text-text-secondary" },
  REVIEW: { label: "Under Review", className: "bg-blue-500/10 text-blue-400" },
  FUNDING: { label: "Funding Open", className: "bg-accent-gold/10 text-accent-gold" },
  FUNDED: { label: "Fully Funded", className: "bg-success/10 text-success" },
  ACTIVE: { label: "Active", className: "bg-success/10 text-success" },
  CLOSED: { label: "Closed", className: "bg-border-card text-text-secondary" },
};

interface PropertyListingCardProps {
  property: OwnerProperty;
}

export default function PropertyListingCard({ property }: PropertyListingCardProps) {
  const router = useRouter();
  const status = statusConfig[property.status] ?? statusConfig.DRAFT;
  const showProgress = property.status !== "DRAFT" && property.status !== "REVIEW";

  return (
    <div className="bg-surface-card border border-border-card rounded-card p-5">
      {/* Header */}
      <div className="flex gap-4 mb-4">
        {/* Image */}
        <div className="relative w-24 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={property.image}
            alt={property.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-heading text-base font-semibold text-white truncate">
                {property.name}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={11} className="text-text-secondary flex-shrink-0" />
                <span className="text-text-secondary text-xs truncate">
                  {property.city}, {property.state} · {property.propertyType}
                </span>
              </div>
            </div>
            <span
              className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${status.className}`}
            >
              {status.label}
            </span>
          </div>

          {/* Investor count (only when funded/active/funding) */}
          {showProgress && property.investorCount > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <Users size={11} className="text-text-secondary" />
              <span className="text-text-secondary text-xs">
                {property.investorCount} investors
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Funding progress */}
      {showProgress && (
        <div className="mb-4">
          <FundingProgressBar
            funded={property.fundedAmount}
            total={property.targetRaise}
            height="md"
          />
        </div>
      )}

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "Annual Yield", value: `${property.annualYield}%` },
          {
            label: "Total Tokens",
            value: property.totalTokens > 0
              ? property.totalTokens.toLocaleString()
              : "—",
          },
          { label: "Token Price", value: `$${property.tokenPrice.toFixed(2)}` },
        ].map((m) => (
          <div
            key={m.label}
            className="bg-primary-navy rounded-lg p-2.5 text-center"
          >
            <p className="text-white text-sm font-semibold">{m.value}</p>
            <p className="text-text-secondary text-xs mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-border-card">
        <button
          onClick={() =>
            router.push(`/owner/documents/${property.id}`)
          }
          className="flex items-center gap-1.5 flex-1 justify-center border border-border-card hover:border-accent-gold/40 text-text-secondary hover:text-white text-xs font-medium py-2 rounded-lg transition-colors"
        >
          <FolderOpen size={13} />
          Manage Documents
        </button>
        <Link
          href={`/properties/${property.id}`}
          className="flex items-center gap-1.5 flex-1 justify-center border border-border-card hover:border-accent-gold/40 text-text-secondary hover:text-white text-xs font-medium py-2 rounded-lg transition-colors"
        >
          <ExternalLink size={13} />
          View Listing
        </Link>

        {property.status === "DRAFT" && (
          <Link
            href="/owner/list"
            className="flex items-center gap-1.5 flex-1 justify-center bg-accent-gold hover:bg-accent-gold-hover text-primary-dark text-xs font-bold py-2 rounded-lg transition-colors"
          >
            Continue Editing
          </Link>
        )}
      </div>
    </div>
  );
}
