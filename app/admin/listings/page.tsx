"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  CheckCircle,
  XCircle,
  Eye,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

interface Owner {
  id: string;
  name: string | null;
  email: string | null;
}

interface Property {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  type: string;
  status: string;
  totalValue: number;
  adminComment: string | null;
  createdAt: string;
  owner: Owner | null;
  _count: { documents: number; tokenHoldings: number };
}

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "REVIEW", label: "In Review" },
  { value: "FUNDING", label: "Funding" },
  { value: "FUNDED", label: "Funded" },
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "CLOSED", label: "Closed" },
];

const statusBadge: Record<string, string> = {
  REVIEW: "bg-accent-gold/10 text-accent-gold",
  FUNDING: "bg-blue-500/10 text-blue-400",
  FUNDED: "bg-success/10 text-success",
  ACTIVE: "bg-green-600/10 text-green-400",
  DRAFT: "bg-border-card text-text-secondary",
  CLOSED: "bg-red-500/10 text-red-400",
};

function DenyModal({
  listing,
  onConfirm,
  onClose,
}: {
  listing: Property;
  onConfirm: (comment: string) => void;
  onClose: () => void;
}) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-surface-card border border-border-card rounded-card w-full max-w-md p-6 space-y-4">
        <h2 className="font-heading text-lg font-bold text-white">Deny Listing</h2>
        <p className="text-text-secondary text-sm">
          This will return <span className="text-white font-medium">{listing.name}</span> to
          DRAFT status. The owner will see your comment.
        </p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Reason for denial (required)…"
          rows={4}
          className="w-full bg-primary-navy border border-border-card rounded-lg px-4 py-3 text-white text-sm placeholder-text-secondary focus:outline-none focus:border-accent-gold/50 resize-none"
        />
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-white hover:bg-primary-navy transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!comment.trim() || submitting}
            onClick={async () => {
              setSubmitting(true);
              await onConfirm(comment);
            }}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Denying…" : "Deny Listing"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminListingsPage() {
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") ?? ""
  );
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [denyTarget, setDenyTarget] = useState<Property | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const qs = statusFilter ? `?status=${statusFilter}` : "";
    fetch(`/api/admin/listings${qs}`)
      .then((r) => r.json())
      .then((data) => setProperties(data.properties ?? []))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleApprove(id: string) {
    setActionLoading(id);
    await fetch(`/api/admin/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    setActionLoading(null);
    load();
  }

  async function handleDeny(id: string, adminComment: string) {
    await fetch(`/api/admin/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deny", adminComment }),
    });
    setDenyTarget(null);
    load();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Listings</h1>
        <p className="text-text-secondary text-sm mt-1">
          Review and approve property listings submitted by owners.
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === f.value
                ? "bg-accent-gold text-primary-dark"
                : "bg-surface-card border border-border-card text-text-secondary hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-card border border-border-card rounded-card h-16 animate-pulse" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-surface-card border border-border-card rounded-card p-12 text-center">
          <Building2 size={36} className="text-text-secondary mx-auto mb-3" />
          <p className="text-white font-medium">No listings found</p>
          <p className="text-text-secondary text-sm mt-1">
            {statusFilter ? `No listings with status "${statusFilter}"` : "No listings yet."}
          </p>
        </div>
      ) : (
        <div className="bg-surface-card border border-border-card rounded-card overflow-hidden">
          {/* Header row */}
          <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-primary-navy border-b border-border-card">
            {["Property", "Status", "Value", "Owner", "Actions"].map((h) => (
              <span key={h} className="text-text-secondary text-xs font-medium uppercase tracking-wide">
                {h}
              </span>
            ))}
          </div>

          <div className="divide-y divide-border-card">
            {properties.map((p) => (
              <div key={p.id}>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-4 items-center hover:bg-primary-navy/40 transition-colors">
                  {/* Name */}
                  <div>
                    <p className="text-white text-sm font-medium">{p.name}</p>
                    <p className="text-text-secondary text-xs">
                      {p.city}, {p.state} · {p.type}
                    </p>
                  </div>

                  {/* Status */}
                  <span
                    className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${
                      statusBadge[p.status] ?? "bg-border-card text-text-secondary"
                    }`}
                  >
                    {p.status}
                  </span>

                  {/* Value */}
                  <span className="text-text-secondary text-sm">
                    ${(p.totalValue / 1_000_000).toFixed(1)}M
                  </span>

                  {/* Owner */}
                  <span className="text-text-secondary text-xs truncate max-w-[120px]">
                    {p.owner?.name ?? p.owner?.email ?? "—"}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/properties/${p.slug}`}
                      target="_blank"
                      className="p-1.5 text-text-secondary hover:text-white transition-colors rounded-md hover:bg-primary-navy"
                      title="View listing"
                    >
                      <Eye size={15} />
                    </Link>
                    {p.status === "REVIEW" && (
                      <>
                        <button
                          disabled={actionLoading === p.id}
                          onClick={() => handleApprove(p.id)}
                          className="p-1.5 text-success hover:text-white transition-colors rounded-md hover:bg-success/10 disabled:opacity-50"
                          title="Approve"
                        >
                          <CheckCircle size={15} />
                        </button>
                        <button
                          disabled={actionLoading === p.id}
                          onClick={() => setDenyTarget(p)}
                          className="p-1.5 text-red-400 hover:text-white transition-colors rounded-md hover:bg-red-500/10 disabled:opacity-50"
                          title="Deny"
                        >
                          <XCircle size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Admin comment shown for denied/draft listings */}
                {p.adminComment && (
                  <div className="px-5 py-2 bg-red-500/5 border-t border-red-500/10 flex items-start gap-2">
                    <ChevronDown size={13} className="text-red-400 mt-0.5 flex-shrink-0 rotate-[-90deg]" />
                    <p className="text-red-400 text-xs">
                      <span className="font-medium">Admin note:</span> {p.adminComment}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deny modal */}
      {denyTarget && (
        <DenyModal
          listing={denyTarget}
          onConfirm={(comment) => handleDeny(denyTarget.id, comment)}
          onClose={() => setDenyTarget(null)}
        />
      )}
    </div>
  );
}
