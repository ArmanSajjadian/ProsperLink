"use client";

import { useEffect, useState } from "react";
import { Building2, FileCheck, Users, TrendingUp, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface Stats {
  pendingListings: number;
  pendingDocuments: number;
  totalUsers: number;
  totalProperties: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  highlight,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  href?: string;
  highlight?: boolean;
}) {
  const card = (
    <div
      className={`bg-surface-card border rounded-card p-5 flex items-center gap-4 ${
        highlight && value > 0
          ? "border-accent-gold/40"
          : "border-border-card"
      } ${href ? "hover:border-accent-gold/30 transition-colors cursor-pointer" : ""}`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          highlight && value > 0 ? "bg-accent-gold/15" : "bg-primary-navy"
        }`}
      >
        <Icon
          size={22}
          className={highlight && value > 0 ? "text-accent-gold" : "text-text-secondary"}
        />
      </div>
      <div>
        <p className="font-heading text-2xl font-bold text-white">{value}</p>
        <p className="text-text-secondary text-sm">{label}</p>
      </div>
    </div>
  );

  return href ? <Link href={href}>{card}</Link> : card;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent-gold/15 flex items-center justify-center">
          <ShieldCheck size={20} className="text-accent-gold" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-text-secondary text-sm">
            Review listings, approve documents, and manage the platform.
          </p>
        </div>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-card border border-border-card rounded-card p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Pending Listings"
            value={stats.pendingListings}
            icon={Building2}
            href="/admin/listings?status=REVIEW"
            highlight
          />
          <StatCard
            label="Pending Documents"
            value={stats.pendingDocuments}
            icon={FileCheck}
            href="/admin/documents?status=PENDING_REVIEW"
            highlight
          />
          <StatCard label="Total Users" value={stats.totalUsers} icon={Users} />
          <StatCard
            label="Total Properties"
            value={stats.totalProperties}
            icon={TrendingUp}
          />
        </div>
      ) : null}

      {/* Quick-action cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link
          href="/admin/listings"
          className="bg-surface-card border border-border-card hover:border-accent-gold/30 rounded-card p-5 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-3">
            <Building2 size={18} className="text-accent-gold" />
            <h2 className="font-heading text-base font-semibold text-white">
              Listing Reviews
            </h2>
          </div>
          <p className="text-text-secondary text-sm">
            Approve or deny property listings submitted by owners. Denied
            listings are returned to DRAFT with your feedback.
          </p>
          <span className="inline-block mt-3 text-accent-gold text-sm font-medium group-hover:underline">
            Review listings →
          </span>
        </Link>

        <Link
          href="/admin/documents"
          className="bg-surface-card border border-border-card hover:border-accent-gold/30 rounded-card p-5 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-3">
            <FileCheck size={18} className="text-accent-gold" />
            <h2 className="font-heading text-base font-semibold text-white">
              Document Review
            </h2>
          </div>
          <p className="text-text-secondary text-sm">
            Approve uploaded documents or request resubmission with a note.
            Owners see your comments and can re-upload directly.
          </p>
          <span className="inline-block mt-3 text-accent-gold text-sm font-medium group-hover:underline">
            Review documents →
          </span>
        </Link>
      </div>
    </div>
  );
}
