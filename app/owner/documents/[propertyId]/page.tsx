"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, FileText } from "lucide-react";
import DocumentRow from "@/components/DocumentRow";
import DocumentUploadZone from "@/components/DocumentUploadZone";
import OwnerEmptyState from "@/components/OwnerEmptyState";
import {
  mockOwnerProperties,
  getOwnerPropertyDocuments,
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

export default function PropertyDocumentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const propertyId = params.propertyId as string;

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [localDocs, setLocalDocs] = useState<OwnerDocument[]>([]);

  // Derived values — computed unconditionally so hooks are never called conditionally
  const property = mockOwnerProperties.find((p) => p.id === propertyId);
  const allDocs = useMemo(
    () => [...localDocs, ...getOwnerPropertyDocuments(propertyId)],
    [localDocs, propertyId]
  );

  const filteredDocs = useMemo(
    () =>
      categoryFilter === "ALL"
        ? allDocs
        : allDocs.filter((d) => d.category === categoryFilter),
    [allDocs, categoryFilter]
  );

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status === "loading") return <Spinner />;
  if (!session) return null;

  const categories: { value: CategoryFilter; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "FINANCIAL", label: "Financial" },
    { value: "LEGAL", label: "Legal" },
    { value: "PROPERTY", label: "Property" },
    { value: "COMPLIANCE", label: "Compliance" },
  ];

  const approvedCount = allDocs.filter((d) => d.status === "APPROVED").length;
  const pendingCount = allDocs.filter(
    (d) => d.status === "PENDING_REVIEW"
  ).length;

  function handleMockUpload({ file, objectUrl, category }: { file: File; objectUrl: string; category: DocumentCategory }) {
    const ext = (file.name.split(".").pop()?.toUpperCase() ?? "PDF") as OwnerDocument["fileType"];
    setLocalDocs((prev) => [
      {
        id: `local-${Date.now()}`,
        propertyId,
        fileName: file.name,
        fileType: ext,
        fileSizeKb: Math.round(file.size / 1024),
        category,
        status: "PENDING_REVIEW",
        uploadedAt: new Date().toISOString().split("T")[0],
        fileUrl: objectUrl,
      },
      ...prev,
    ]);
  }

  function handlePreview(doc: OwnerDocument) {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, "_blank");
    } else {
      alert(`Preview not available in demo mode for: ${doc.fileName}`);
    }
  }

  function handleDownload(doc: OwnerDocument) {
    if (doc.fileUrl) {
      const a = document.createElement("a");
      a.href = doc.fileUrl;
      a.download = doc.fileName;
      a.click();
    } else {
      alert(`Download not available in demo mode for: ${doc.fileName}`);
    }
  }

  if (!property) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary text-sm">Property not found.</p>
        <Link
          href="/owner/documents"
          className="text-accent-gold text-sm hover:underline mt-2 inline-block"
        >
          ← Back to Documents Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/owner/documents"
        className="inline-flex items-center gap-1 text-text-secondary hover:text-white text-sm transition-colors"
      >
        <ChevronLeft size={15} />
        Back to Documents Hub
      </Link>

      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">
          {property.name} — Documents
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {property.city}, {property.state} · {property.propertyType}
        </p>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Documents", value: allDocs.length },
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
          <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-primary-navy border-b border-border-card">
            {["File", "Category", "Status", "Uploaded", "Actions"].map(
              (col) => (
                <span
                  key={col}
                  className="text-text-secondary text-xs font-medium uppercase tracking-wide"
                >
                  {col}
                </span>
              )
            )}
          </div>
          <div className="divide-y divide-border-card">
            {filteredDocs.map((doc) => (
              <DocumentRow
                key={doc.id}
                document={doc}
                onPreview={handlePreview}
                onDownload={handleDownload}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upload zone */}
      <div
        id="upload"
        className="bg-surface-card border border-border-card rounded-card p-5"
      >
        <h2 className="font-heading text-base font-semibold text-white mb-4">
          Upload a Document
        </h2>
        <DocumentUploadZone
          propertyId={propertyId}
          category="LEGAL"
          onMockUpload={handleMockUpload}
        />
      </div>
    </div>
  );
}
