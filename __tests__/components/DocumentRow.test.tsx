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
    render(<DocumentRow document={baseDoc} onPreview={vi.fn()} />);
    expect(screen.getByText(/1\.2 MB/)).toBeInTheDocument();
  });
});
