"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  AlertCircle,
} from "lucide-react";

interface Property {
  id: string;
  name: string;
  slug: string;
}

interface Uploader {
  id: string;
  name: string | null;
  email: string | null;
}

interface Document {
  id: string;
  name: string;
  category: string;
  url: string;
  status: string;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  property: Property;
  uploader: Uploader;
}

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "PENDING_REVIEW", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "DRAFT", label: "Draft" },
];

const statusConfig: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  APPROVED: {
    label: "Approved",
    className: "bg-success/10 text-success",
    icon: CheckCircle,
  },
  PENDING_REVIEW: {
    label: "Pending Review",
    className: "bg-accent-gold/10 text-accent-gold",
    icon: Clock,
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-500/10 text-red-400",
    icon: XCircle,
  },
  DRAFT: {
    label: "Draft",
    className: "bg-border-card text-text-secondary",
    icon: FileText,
  },
};

const categoryBadge: Record<string, string> = {
  FINANCIAL: "bg-accent-gold/10 text-accent-gold",
  LEGAL: "bg-blue-500/10 text-blue-400",
  PROPERTY: "bg-purple-500/10 text-purple-400",
  COMPLIANCE: "bg-orange-500/10 text-orange-400",
};

function RejectModal({
  doc,
  onConfirm,
  onClose,
}: {
  doc: Document;
  onConfirm: (note: string) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-surface-card border border-border-card rounded-card w-full max-w-md p-6 space-y-4">
        <h2 className="font-heading text-lg font-bold text-white">
          Request Resubmission
        </h2>
        <p className="text-text-secondary text-sm">
          Leave a note for the owner explaining what needs to be fixed for{" "}
          <span className="text-white font-medium">{doc.name}</span>. They will
          see this message and be prompted to resubmit.
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Document is missing notarized signature on page 4."
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
            disabled={!note.trim() || submitting}
            onClick={async () => {
              setSubmitting(true);
              await onConfirm(note);
            }}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Sending…" : "Request Resubmission"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDocumentsPage() {
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") ?? ""
  );
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<Document | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const qs = statusFilter ? `?status=${statusFilter}` : "";
    fetch(`/api/admin/documents${qs}`)
      .then((r) => r.json())
      .then((data) => setDocuments(data.documents ?? []))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleApprove(id: string) {
    setActionLoading(id);
    await fetch(`/api/admin/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    setActionLoading(null);
    load();
  }

  async function handleReject(id: string, reviewNote: string) {
    await fetch(`/api/admin/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", reviewNote }),
    });
    setRejectTarget(null);
    load();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Documents</h1>
        <p className="text-text-secondary text-sm mt-1">
          Review uploaded documents and request resubmission with notes.
        </p>
      </div>

      {/* Status filter */}
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
            <div
              key={i}
              className="bg-surface-card border border-border-card rounded-card h-16 animate-pulse"
            />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-surface-card border border-border-card rounded-card p-12 text-center">
          <FileText size={36} className="text-text-secondary mx-auto mb-3" />
          <p className="text-white font-medium">No documents found</p>
          <p className="text-text-secondary text-sm mt-1">
            {statusFilter
              ? `No documents with status "${statusFilter}"`
              : "No documents uploaded yet."}
          </p>
        </div>
      ) : (
        <div className="bg-surface-card border border-border-card rounded-card overflow-hidden">
          {/* Header row */}
          <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-3 bg-primary-navy border-b border-border-card">
            {["Document", "Property", "Category", "Status", "Uploaded", "Actions"].map(
              (h) => (
                <span
                  key={h}
                  className="text-text-secondary text-xs font-medium uppercase tracking-wide"
                >
                  {h}
                </span>
              )
            )}
          </div>

          <div className="divide-y divide-border-card">
            {documents.map((doc) => {
              const stat =
                statusConfig[doc.status] ?? statusConfig.PENDING_REVIEW;
              const StatusIcon = stat.icon;
              const catClass =
                categoryBadge[doc.category] ?? "bg-border-card text-text-secondary";

              return (
                <div key={doc.id}>
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-4 items-center hover:bg-primary-navy/40 transition-colors">
                    {/* Name */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <FileText size={14} className="text-red-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm truncate">{doc.name}</p>
                        <p className="text-text-secondary text-xs">
                          {doc.uploader.name ?? doc.uploader.email ?? "Unknown"}
                        </p>
                      </div>
                    </div>

                    {/* Property */}
                    <span className="text-text-secondary text-xs truncate max-w-[120px]">
                      {doc.property.name}
                    </span>

                    {/* Category */}
                    <span
                      className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${catClass}`}
                    >
                      {doc.category.charAt(0) + doc.category.slice(1).toLowerCase()}
                    </span>

                    {/* Status */}
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${stat.className}`}
                    >
                      <StatusIcon size={11} />
                      {stat.label}
                    </span>

                    {/* Date */}
                    <span className="text-text-secondary text-xs">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-text-secondary hover:text-white transition-colors rounded-md hover:bg-primary-navy"
                          title="View document"
                        >
                          <Eye size={15} />
                        </a>
                      )}
                      {doc.status !== "APPROVED" && (
                        <button
                          disabled={actionLoading === doc.id}
                          onClick={() => handleApprove(doc.id)}
                          className="p-1.5 text-success hover:text-white transition-colors rounded-md hover:bg-success/10 disabled:opacity-50"
                          title="Approve"
                        >
                          <CheckCircle size={15} />
                        </button>
                      )}
                      {doc.status !== "REJECTED" && (
                        <button
                          disabled={actionLoading === doc.id}
                          onClick={() => setRejectTarget(doc)}
                          className="p-1.5 text-red-400 hover:text-white transition-colors rounded-md hover:bg-red-500/10 disabled:opacity-50"
                          title="Request resubmission"
                        >
                          <XCircle size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Review note sub-row */}
                  {doc.reviewNote && (
                    <div className="px-5 py-2 bg-red-500/5 border-t border-red-500/10 flex items-start gap-2">
                      <AlertCircle
                        size={13}
                        className="text-red-400 mt-0.5 flex-shrink-0"
                      />
                      <p className="text-red-400 text-xs">
                        <span className="font-medium">Note sent to owner:</span>{" "}
                        {doc.reviewNote}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <RejectModal
          doc={rejectTarget}
          onConfirm={(note) => handleReject(rejectTarget.id, note)}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </div>
  );
}
