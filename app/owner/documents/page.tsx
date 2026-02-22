"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AlertCircle, FileText } from "lucide-react";
import DocumentRow from "@/components/DocumentRow";
import DocumentUploadZone from "@/components/DocumentUploadZone";
import OwnerEmptyState from "@/components/OwnerEmptyState";
import {
  mockOwnerProperties,
  mockDocuments,
  ownerStats,
  type OwnerDocument,
  type DocumentCategory,
} from "@/lib/mockOwner";

type CategoryFilter = "ALL" | DocumentCategory;

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function DocumentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [selectedPropertyId, setSelectedPropertyId] = useState(
    mockOwnerProperties[0]?.id ?? ""
  );
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");

  // Derived values — computed unconditionally so hooks are never called conditionally
  const propertyDocs = mockDocuments.filter(
    (d) => d.propertyId === selectedPropertyId
  );

  const filteredDocs = useMemo(
    () =>
      categoryFilter === "ALL"
        ? propertyDocs
        : propertyDocs.filter((d) => d.category === categoryFilter),
    [propertyDocs, categoryFilter]
  );

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status === "loading") return <Spinner />;
  if (!session) return null;

  const approvedCount = propertyDocs.filter((d) => d.status === "APPROVED").length;
  const pendingCount = propertyDocs.filter(
    (d) => d.status === "PENDING_REVIEW"
  ).length;

  const categories: { value: CategoryFilter; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "FINANCIAL", label: "Financial" },
    { value: "LEGAL", label: "Legal" },
    { value: "PROPERTY", label: "Property" },
    { value: "COMPLIANCE", label: "Compliance" },
  ];

  function handlePreview(doc: OwnerDocument) {
    alert(`Preview: ${doc.fileName}\n(Full preview coming in a future release.)`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">
          Documents Hub
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Upload and manage financial, legal, and property documents for each of
          your listings.
        </p>
      </div>

      {/* Attention banner */}
      {ownerStats.documentsNeedingAction > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-card p-4 flex items-center gap-3">
          <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">
            <span className="font-semibold">
              {ownerStats.documentsNeedingAction} document
              {ownerStats.documentsNeedingAction > 1 ? "s require" : " requires"}{" "}
              attention
            </span>{" "}
            across your listings. Review the rejection notes below and re-upload.
          </p>
        </div>
      )}

      {/* Property selector tabs */}
      {mockOwnerProperties.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {mockOwnerProperties.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPropertyId(p.id);
                setCategoryFilter("ALL");
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedPropertyId === p.id
                  ? "bg-accent-gold text-primary-dark"
                  : "bg-surface-card border border-border-card text-text-secondary hover:text-white"
              }`}
            >
              {p.name}
              {p.status === "DRAFT" && (
                <span className="ml-1.5 text-xs opacity-60">(Draft)</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Documents", value: propertyDocs.length },
          { label: "Approved", value: approvedCount },
          { label: "Pending Review", value: pendingCount },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-surface-card border border-border-card rounded-card p-4 text-center"
          >
            <p className="font-heading text-xl font-bold text-white">
              {s.value}
            </p>
            <p className="text-text-secondary text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategoryFilter(c.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              categoryFilter === c.value
                ? "bg-accent-gold text-primary-dark"
                : "bg-surface-card border border-border-card text-text-secondary hover:text-white"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Document table */}
      {filteredDocs.length === 0 ? (
        <OwnerEmptyState
          icon={FileText}
          title="No documents yet"
          description="Upload your first document for this property using the uploader below."
          ctaLabel="Upload a Document"
          ctaHref="#upload"
        />
      ) : (
        <div className="bg-surface-card border border-border-card rounded-card overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-primary-navy border-b border-border-card">
            <span className="text-text-secondary text-xs font-medium uppercase tracking-wide">
              File
            </span>
            <span className="text-text-secondary text-xs font-medium uppercase tracking-wide">
              Category
            </span>
            <span className="text-text-secondary text-xs font-medium uppercase tracking-wide">
              Status
            </span>
            <span className="text-text-secondary text-xs font-medium uppercase tracking-wide">
              Uploaded
            </span>
            <span className="text-text-secondary text-xs font-medium uppercase tracking-wide">
              Actions
            </span>
          </div>

          <div className="divide-y divide-border-card">
            {filteredDocs.map((doc) => (
              <DocumentRow key={doc.id} document={doc} onPreview={handlePreview} />
            ))}
          </div>
        </div>
      )}

      {/* Upload zone */}
      <div id="upload" className="bg-surface-card border border-border-card rounded-card p-5">
        <h2 className="font-heading text-base font-semibold text-white mb-4">
          Upload a Document
        </h2>
        <DocumentUploadZone
          propertyId={selectedPropertyId}
          category="LEGAL"
          onMockUpload={() => {}}
        />
      </div>
    </div>
  );
}
