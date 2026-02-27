import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("changing the category select updates the selected value", async () => {
    const user = userEvent.setup();
    render(
      <DocumentUploadZone
        propertyId="harbor-heights"
        category="LEGAL"
        onMockUpload={vi.fn()}
      />
    );
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    await user.selectOptions(select, "FINANCIAL");
    expect(select.value).toBe("FINANCIAL");
  });

  it("clicking Browse Files button triggers the hidden file input", () => {
    const { container } = render(
      <DocumentUploadZone
        propertyId="harbor-heights"
        category="LEGAL"
        onMockUpload={vi.fn()}
      />
    );
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, "click");
    fireEvent.click(screen.getByRole("button", { name: /browse files/i }));
    expect(clickSpy).toHaveBeenCalled();
  });

  it("does nothing when file input change fires with no files selected (early return)", () => {
    const onMockUpload = vi.fn();
    const { container } = render(
      <DocumentUploadZone
        propertyId="harbor-heights"
        category="LEGAL"
        onMockUpload={onMockUpload}
      />
    );
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    // Fire change event with null/empty files list — triggers the early return guard
    fireEvent.change(fileInput, { target: { files: null } });
    expect(onMockUpload).not.toHaveBeenCalled();
  });
});
