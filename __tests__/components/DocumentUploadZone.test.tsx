import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import DocumentUploadZone from "@/components/DocumentUploadZone";

describe("DocumentUploadZone", () => {
  it("renders the upload prompt text", () => {
    render(
      <DocumentUploadZone
        propertyId="harbor-heights"
        category="LEGAL"
        onMockUpload={vi.fn()}
      />
    );
    expect(screen.getByText(/drop files here/i)).toBeInTheDocument();
  });

  it("renders the category select", () => {
    render(
      <DocumentUploadZone
        propertyId="harbor-heights"
        category="LEGAL"
        onMockUpload={vi.fn()}
      />
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("initializes the select with the given category", () => {
    render(
      <DocumentUploadZone
        propertyId="harbor-heights"
        category="FINANCIAL"
        onMockUpload={vi.fn()}
      />
    );
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("FINANCIAL");
  });

  it("shows a loading spinner after clicking Browse Files", () => {
    vi.useFakeTimers();
    render(
      <DocumentUploadZone
        propertyId="harbor-heights"
        category="LEGAL"
        onMockUpload={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /browse files/i }));
    expect(screen.getByRole("status")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("shows success toast after mock upload completes", async () => {
    vi.useFakeTimers();
    render(
      <DocumentUploadZone
        propertyId="harbor-heights"
        category="LEGAL"
        onMockUpload={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /browse files/i }));
    await act(async () => {
      vi.advanceTimersByTime(2100);
    });
    expect(screen.getByText(/uploaded successfully/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("calls onMockUpload callback after simulated upload", async () => {
    vi.useFakeTimers();
    const onMockUpload = vi.fn();
    render(
      <DocumentUploadZone
        propertyId="harbor-heights"
        category="LEGAL"
        onMockUpload={onMockUpload}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /browse files/i }));
    await act(async () => {
      vi.advanceTimersByTime(2100);
    });
    expect(onMockUpload).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});
