import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DocumentRow from "@/components/DocumentRow";
import type { OwnerDocument } from "@/lib/mockOwner";

const baseDoc: OwnerDocument = {
  id: "doc-1",
  propertyId: "harbor-heights",
  fileName: "TitleDeed.pdf",
  fileType: "PDF",
  fileSizeKb: 1240,
  category: "LEGAL",
  status: "APPROVED",
  uploadedAt: "2026-01-08",
};

describe("DocumentRow", () => {
  it("renders the file name", () => {
    render(<DocumentRow document={baseDoc} onPreview={vi.fn()} />);
    expect(screen.getByText("TitleDeed.pdf")).toBeInTheDocument();
  });

  it("shows Approved badge for APPROVED status", () => {
    render(<DocumentRow document={baseDoc} onPreview={vi.fn()} />);
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

  it("shows Pending Review badge for PENDING_REVIEW status", () => {
    render(
      <DocumentRow
        document={{ ...baseDoc, status: "PENDING_REVIEW" }}
        onPreview={vi.fn()}
      />
    );
    expect(screen.getByText("Pending Review")).toBeInTheDocument();
  });

  it("shows Rejected badge for REJECTED status", () => {
    render(
      <DocumentRow
        document={{ ...baseDoc, status: "REJECTED" }}
        onPreview={vi.fn()}
      />
    );
    expect(screen.getByText("Rejected")).toBeInTheDocument();
  });

  it("shows reviewNote sub-row only when status is REJECTED and note exists", () => {
    const rejectedDoc: OwnerDocument = {
      ...baseDoc,
      status: "REJECTED",
      reviewNote: "Missing notarized signature.",
    };
    render(<DocumentRow document={rejectedDoc} onPreview={vi.fn()} />);
    expect(screen.getByText(/Missing notarized signature/)).toBeInTheDocument();
  });

  it("does not show reviewNote sub-row for APPROVED docs", () => {
    const docWithNote: OwnerDocument = {
      ...baseDoc,
      reviewNote: "Should not appear",
    };
    render(<DocumentRow document={docWithNote} onPreview={vi.fn()} />);
    expect(screen.queryByText("Should not appear")).not.toBeInTheDocument();
  });

  it("does not show rejection note when REJECTED but no reviewNote", () => {
    render(
      <DocumentRow
        document={{ ...baseDoc, status: "REJECTED" }}
        onPreview={vi.fn()}
      />
    );
    expect(screen.queryByText(/Platform note/)).not.toBeInTheDocument();
  });

  it("calls onPreview when the preview button is clicked", async () => {
    const onPreview = vi.fn();
    const { getByTitle } = render(
      <DocumentRow document={baseDoc} onPreview={onPreview} />
    );
    getByTitle("Preview").click();
    expect(onPreview).toHaveBeenCalledWith(baseDoc);
  });

  it("shows the file size formatted correctly", () => {
    render(<DocumentRow document={baseDoc} onPreview={vi.fn()} onDownload={vi.fn()} />);
    expect(screen.getByText(/1\.2 MB/)).toBeInTheDocument();
  });

  it("shows file size in KB when file is smaller than 1024 KB", () => {
    render(
      <DocumentRow document={{ ...baseDoc, fileSizeKb: 512 }} onPreview={vi.fn()} onDownload={vi.fn()} />
    );
    expect(screen.getByText(/512 KB/)).toBeInTheDocument();
  });

  it("calls onDownload when the download button is clicked", () => {
    const onDownload = vi.fn();
    const { getByTitle } = render(
      <DocumentRow document={baseDoc} onPreview={vi.fn()} onDownload={onDownload} />
    );
    getByTitle("Download").click();
    expect(onDownload).toHaveBeenCalledWith(baseDoc);
  });

  it("renders XLSX file type icon without error", () => {
    const { container } = render(
      <DocumentRow document={{ ...baseDoc, fileType: "XLSX" }} onPreview={vi.fn()} onDownload={vi.fn()} />
    );
    expect(container.querySelector(".w-9")).toBeInTheDocument();
  });

  it("renders JPG file type icon without error", () => {
    const { container } = render(
      <DocumentRow document={{ ...baseDoc, fileType: "JPG" }} onPreview={vi.fn()} onDownload={vi.fn()} />
    );
    expect(container.querySelector(".w-9")).toBeInTheDocument();
  });

  it("renders DOCX file type icon without error", () => {
    const { container } = render(
      <DocumentRow document={{ ...baseDoc, fileType: "DOCX" }} onPreview={vi.fn()} onDownload={vi.fn()} />
    );
    expect(container.querySelector(".w-9")).toBeInTheDocument();
  });

  it("shows Draft badge for DRAFT status", () => {
    render(
      <DocumentRow document={{ ...baseDoc, status: "DRAFT" }} onPreview={vi.fn()} onDownload={vi.fn()} />
    );
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("shows Re-upload button only for REJECTED documents", () => {
    render(
      <DocumentRow document={{ ...baseDoc, status: "REJECTED" }} onPreview={vi.fn()} onDownload={vi.fn()} />
    );
    expect(screen.getByTitle("Re-upload")).toBeInTheDocument();
  });

  it("does NOT show Re-upload button for APPROVED documents", () => {
    render(<DocumentRow document={baseDoc} onPreview={vi.fn()} onDownload={vi.fn()} />);
    expect(screen.queryByTitle("Re-upload")).not.toBeInTheDocument();
  });

  it("falls back to LEGAL category config for an unknown category", () => {
    // categoryConfig[unknown] ?? categoryConfig.LEGAL — the ?? branch
    render(
      <DocumentRow
        document={{ ...baseDoc, category: "UNKNOWN_CAT" as never }}
        onPreview={vi.fn()}
        onDownload={vi.fn()}
      />
    );
    // Should still render without crashing (uses LEGAL fallback)
    expect(screen.getByText("TitleDeed.pdf")).toBeInTheDocument();
  });

  it("falls back to DRAFT status config for an unknown status", () => {
    // statusConfig[unknown] ?? statusConfig.DRAFT — the ?? branch
    render(
      <DocumentRow
        document={{ ...baseDoc, status: "UNKNOWN_STATUS" as never }}
        onPreview={vi.fn()}
        onDownload={vi.fn()}
      />
    );
    expect(screen.getByText("TitleDeed.pdf")).toBeInTheDocument();
  });
});
