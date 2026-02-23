"use client";

import { useRef, useState } from "react";
import { UploadCloud, CheckCircle } from "lucide-react";
import type { DocumentCategory } from "@/lib/mockOwner";

interface DocumentUploadZoneProps {
  propertyId: string;
  category: DocumentCategory;
  onMockUpload: (info: { file: File; objectUrl: string; category: DocumentCategory }) => void;
}

const categories: { value: DocumentCategory; label: string }[] = [
  { value: "FINANCIAL", label: "Financial" },
  { value: "LEGAL", label: "Legal" },
  { value: "PROPERTY", label: "Property" },
  { value: "COMPLIANCE", label: "Compliance" },
];

export default function DocumentUploadZone({
  category: initialCategory,
  onMockUpload,
}: DocumentUploadZoneProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<DocumentCategory>(initialCategory);
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleBrowse() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const objectUrl = URL.createObjectURL(file);
    setUploading(true);
    setShowSuccess(false);

    setTimeout(() => {
      setUploading(false);
      setShowSuccess(true);
      onMockUpload({ file, objectUrl, category: selectedCategory });

      // Auto-dismiss toast after 4 seconds
      setTimeout(() => setShowSuccess(false), 4000);
    }, 2000);

    e.target.value = ""; // reset so the same file can be re-selected
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.xlsx,.jpg,.jpeg"
        className="hidden"
        onChange={handleFileChange}
      />
      {/* Category selector */}
      <div>
        <label className="block text-text-secondary text-xs font-medium mb-1.5">
          Document Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) =>
            setSelectedCategory(e.target.value as DocumentCategory)
          }
          className="w-full bg-primary-dark border border-border-card rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-accent-gold/50 transition-colors"
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Drop zone */}
      <div className="bg-primary-navy border-2 border-dashed border-border-card rounded-xl p-8 text-center hover:border-accent-gold/30 transition-colors">
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div
              role="status"
              className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin"
              aria-label="Uploading"
            />
            <p className="text-text-secondary text-sm">Uploading…</p>
          </div>
        ) : (
          <>
            <UploadCloud size={32} className="text-text-secondary mx-auto mb-3" />
            <p className="text-white text-sm font-medium mb-1">
              Drop files here or click to browse
            </p>
            <p className="text-text-secondary text-xs mb-4">
              PDF, DOCX, XLSX, JPG — max 25 MB
            </p>
            <button
              onClick={handleBrowse}
              className="border border-border-card hover:border-accent-gold/40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Browse Files
            </button>
          </>
        )}
      </div>

      {/* Success toast */}
      {showSuccess && (
        <div className="bg-success/10 border border-success/20 rounded-lg p-3 flex items-center gap-2">
          <CheckCircle size={15} className="text-success flex-shrink-0" />
          <p className="text-success text-sm">
            Document uploaded successfully. Under review within 24 hours.
          </p>
        </div>
      )}
    </div>
  );
}
