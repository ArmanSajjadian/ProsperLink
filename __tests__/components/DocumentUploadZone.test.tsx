import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import DocumentUploadZone from "@/components/DocumentUploadZone";

function pickFile(container: HTMLElement) {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, {
    target: { files: [new File(["content"], "test.pdf", { type: "application/pdf" })] },
  });
}

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

  it("shows a loading spinner after a file is selected", () => {
    vi.useFakeTimers();
    const { container } = render(
      <DocumentUploadZone
        propertyId="harbor-heights"
        category="LEGAL"
        onMockUpload={vi.fn()}
      />
    );
    pickFile(container);
    expect(screen.getByRole("status")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("shows success toast after mock upload completes", async () => {
    vi.useFakeTimers();
    const { container } = render(
      <DocumentUploadZone
        propertyId="harbor-heights"
        category="LEGAL"
        onMockUpload={vi.fn()}
      />
    );
    pickFile(container);
    await act(async () => {
      vi.advanceTimersByTime(2100);
    });
    expect(screen.getByText(/uploaded successfully/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("calls onMockUpload callback after simulated upload", async () => {
    vi.useFakeTimers();
    const onMockUpload = vi.fn();
    const { container } = render(
      <DocumentUploadZone
        propertyId="harbor-heights"
        category="LEGAL"
        onMockUpload={onMockUpload}
      />
    );
    pickFile(container);
    await act(async () => {
      vi.advanceTimersByTime(2100);
    });
    expect(onMockUpload).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});
