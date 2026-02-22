"use client";

import {
  FileText,
  Table2,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  AlertCircle,
  UploadCloud,
} from "lucide-react";
import type { OwnerDocument } from "@/lib/mockOwner";

// --- File type icon ---
function FileTypeIcon({ type }: { type: OwnerDocument["fileType"] }) {
  switch (type) {
    case "XLSX":
      return (
        <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
          <Table2 size={16} className="text-success" />
        </div>
      );
    case "JPG":
    case "PNG":
      return (
        <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
          <ImageIcon size={16} className="text-purple-400" />
        </div>
      );
    case "DOCX":
      return (
        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
          <FileText size={16} className="text-blue-400" />
        </div>
      );
    default:
      return (
        <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
          <FileText size={16} className="text-red-400" />
        </div>
      );
  }
}

// --- Category badge ---
const categoryConfig: Record<
  string,
  { label: string; className: string }
> = {
  FINANCIAL: { label: "Financial", className: "bg-accent-gold/10 text-accent-gold" },
  LEGAL: { label: "Legal", className: "bg-blue-500/10 text-blue-400" },
  PROPERTY: { label: "Property", className: "bg-purple-500/10 text-purple-400" },
  COMPLIANCE: { label: "Compliance", className: "bg-orange-500/10 text-orange-400" },
};

// --- Status badge ---
const statusConfig: Record<
  string,
  { label: string; icon: React.ElementType; className: string }
> = {
  APPROVED: {
    label: "Approved",
    icon: CheckCircle,
    className: "bg-success/10 text-success",
  },
  PENDING_REVIEW: {
    label: "Pending Review",
    icon: Clock,
    className: "bg-accent-gold/10 text-accent-gold",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-red-500/10 text-red-400",
  },
  DRAFT: {
    label: "Draft",
    icon: FileText,
    className: "bg-border-card text-text-secondary",
  },
};

function formatFileSize(kb: number): string {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}

interface DocumentRowProps {
  document: OwnerDocument;
  onPreview: (doc: OwnerDocument) => void;
}

export default function DocumentRow({ document, onPreview }: DocumentRowProps) {
  const cat = categoryConfig[document.category] ?? categoryConfig.LEGAL;
  const stat = statusConfig[document.status] ?? statusConfig.DRAFT;
  const StatusIcon = stat.icon;

  return (
    <div>
      {/* Main row */}
      <div className="flex items-center gap-3 px-5 py-4 hover:bg-primary-navy/50 transition-colors">
        <FileTypeIcon type={document.fileType} />

        {/* File info */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm truncate">{document.fileName}</p>
          <p className="text-text-secondary text-xs">
            {formatFileSize(document.fileSizeKb)} · {document.fileType}
          </p>
        </div>

        {/* Category badge */}
        <span
          className={`hidden sm:inline-flex text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${cat.className}`}
        >
          {cat.label}
        </span>

        {/* Status badge */}
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${stat.className}`}
        >
          <StatusIcon size={11} />
          {stat.label}
        </span>

        {/* Date */}
        <span className="hidden lg:block text-text-secondary text-xs flex-shrink-0 w-20 text-right">
          {document.uploadedAt}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onPreview(document)}
            className="p-1.5 text-text-secondary hover:text-white transition-colors rounded-md hover:bg-primary-navy"
            title="Preview"
          >
            <Eye size={15} />
          </button>
          {document.status === "REJECTED" && (
            <button
              className="p-1.5 text-accent-gold hover:text-white transition-colors rounded-md hover:bg-primary-navy"
              title="Re-upload"
            >
              <UploadCloud size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Rejection note sub-row */}
      {document.status === "REJECTED" && document.reviewNote && (
        <div className="px-5 py-2 bg-red-500/5 border-t border-red-500/10 flex items-start gap-2">
          <AlertCircle size={13} className="text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-400 text-xs">
            <span className="font-medium">Platform note:</span>{" "}
            {document.reviewNote}
          </p>
        </div>
      )}
    </div>
  );
}
