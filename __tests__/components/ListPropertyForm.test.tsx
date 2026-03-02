import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ListPropertyForm from "@/components/ListPropertyForm";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("ListPropertyForm", () => {
  afterEach(() => {
    // Always restore real timers even if a test fails mid-way
    vi.useRealTimers();
    vi.clearAllMocks();
  });
  it("renders step 1 by default", () => {
    render(<ListPropertyForm />);
    expect(screen.getByText("Property Basics")).toBeInTheDocument();
  });

  it("shows all 5 step indicator labels", () => {
    render(<ListPropertyForm />);
    ["Basics", "Financials", "Description", "Legal", "Review"].forEach(
      (label) => expect(screen.getByText(label)).toBeInTheDocument()
    );
  });

  it("Next button is disabled when required step 1 fields are empty", () => {
    render(<ListPropertyForm />);
    const nextBtn = screen.getByRole("button", { name: /next/i });
    expect(nextBtn).toBeDisabled();
  });

  it("Next button enables after filling required step 1 fields", async () => {
    const user = userEvent.setup();
    render(<ListPropertyForm />);

    await user.type(
      screen.getByPlaceholderText(/harbor heights duplex/i),
      "My Property"
    );
    await user.type(
      screen.getByPlaceholderText(/street address/i),
      "123 Main St"
    );
    await user.type(screen.getByPlaceholderText(/city/i), "Tampa");

    // Select state via select element
    const stateSelect = screen.getAllByRole("combobox")[0];
    await user.selectOptions(stateSelect, "FL");

    // Enter ZIP
    await user.type(screen.getByPlaceholderText(/12345/i), "33602");

    // Select property type pill
    fireEvent.click(screen.getByRole("button", { name: "Residential" }));

    const nextBtn = screen.getByRole("button", { name: /next/i });
    expect(nextBtn).not.toBeDisabled();
  });

  it("advances to step 2 on Next click with valid step 1 data", async () => {
    const user = userEvent.setup();
    render(<ListPropertyForm />);

    await user.type(
      screen.getByPlaceholderText(/harbor heights duplex/i),
      "My Property"
    );
    await user.type(
      screen.getByPlaceholderText(/street address/i),
      "123 Main St"
    );
    await user.type(screen.getByPlaceholderText(/city/i), "Tampa");
    const stateSelect = screen.getAllByRole("combobox")[0];
    await user.selectOptions(stateSelect, "FL");
    await user.type(screen.getByPlaceholderText(/12345/i), "33602");
    fireEvent.click(screen.getByRole("button", { name: "Residential" }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() =>
      expect(screen.getByText("Financial Details")).toBeInTheDocument()
    );
  });

  it("Back button returns to step 1 from step 2", async () => {
    const user = userEvent.setup();
    render(<ListPropertyForm />);

    // Fill and advance to step 2
    await user.type(
      screen.getByPlaceholderText(/harbor heights duplex/i),
      "My Property"
    );
    await user.type(
      screen.getByPlaceholderText(/street address/i),
      "123 Main St"
    );
    await user.type(screen.getByPlaceholderText(/city/i), "Tampa");
    const stateSelect = screen.getAllByRole("combobox")[0];
    await user.selectOptions(stateSelect, "FL");
    await user.type(screen.getByPlaceholderText(/12345/i), "33602");
    fireEvent.click(screen.getByRole("button", { name: "Residential" }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() => screen.getByText("Financial Details"));

    // Go back
    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    await waitFor(() =>
      expect(screen.getByText("Property Basics")).toBeInTheDocument()
    );
  });

  it("starts on step 5 when initialStep=5 is provided", () => {
    render(<ListPropertyForm initialStep={5} />);
    // Use getByRole("heading") to avoid matching the green info note text
    expect(
      screen.getByRole("heading", { name: /review your listing/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit listing/i })).toBeInTheDocument();
  });

  it("shows success screen after Submit on step 5", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) } as Response);
    render(<ListPropertyForm initialStep={5} />);

    fireEvent.click(screen.getByRole("button", { name: /submit listing/i }));

    await waitFor(() =>
      expect(screen.getByText(/listing submitted for review/i)).toBeInTheDocument()
    );
  });

  it("shows 'View My Properties' and 'Upload Documents' links on success screen", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) } as Response);
    render(<ListPropertyForm initialStep={5} />);
    fireEvent.click(screen.getByRole("button", { name: /submit listing/i }));

    await waitFor(() =>
      expect(screen.getByRole("link", { name: /view my properties/i })).toHaveAttribute("href", "/owner/dashboard")
    );
    expect(
      screen.getByRole("link", { name: /upload documents/i })
    ).toHaveAttribute("href", "/owner/documents");
  });

  it("property type pills toggle selection", () => {
    render(<ListPropertyForm />);
    const residentialBtn = screen.getByRole("button", { name: "Residential" });
    const multiFamilyBtn = screen.getByRole("button", { name: "Multi-Family" });

    fireEvent.click(residentialBtn);
    expect(residentialBtn.className).toContain("bg-accent-gold");
    expect(multiFamilyBtn.className).not.toContain("bg-accent-gold");

    fireEvent.click(multiFamilyBtn);
    expect(multiFamilyBtn.className).toContain("bg-accent-gold");
    expect(residentialBtn.className).not.toContain("bg-accent-gold");
  });

  it("typing in optional step 1 fields (bedrooms, sqft) updates their values", async () => {
    const user = userEvent.setup();
    render(<ListPropertyForm />);
    await user.type(screen.getByPlaceholderText("4"), "3");       // bedrooms
    await user.type(screen.getByPlaceholderText("2400"), "1800"); // sqft
    expect((screen.getByPlaceholderText("4") as HTMLInputElement).value).toBe("3");
    expect((screen.getByPlaceholderText("2400") as HTMLInputElement).value).toBe("1800");
  });

  it("entering an image URL in step 3 renders image preview", async () => {
    const user = userEvent.setup();
    render(<ListPropertyForm initialStep={3} />);
    await user.type(
      screen.getByPlaceholderText(/https:\/\/images\.unsplash/i),
      "https://example.com/photo.jpg"
    );
    await waitFor(() =>
      expect(screen.getByAltText("Cover preview")).toBeInTheDocument()
    );
  });

  // ─── Yield tests ────────────────────────────────────────────────────────────

  async function goToStep2(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByPlaceholderText(/harbor heights duplex/i), "My Property");
    await user.type(screen.getByPlaceholderText(/street address/i), "123 Main St");
    await user.type(screen.getByPlaceholderText(/city/i), "Tampa");
    await user.selectOptions(screen.getAllByRole("combobox")[0], "FL");
    await user.type(screen.getByPlaceholderText(/12345/i), "33602");
    fireEvent.click(screen.getByRole("button", { name: "Residential" }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() => screen.getByText("Financial Details"));
  }

  it("uses the entered yield when it is lower than the calculated yield", async () => {
    // calcYield = (($3000 - $500) * 12) / $500000 = 6.00%
    // entered = 1%  →  diff = 5 > 2  →  lower = 1.00%
    const user = userEvent.setup();
    render(<ListPropertyForm />);
    await goToStep2(user);
    await user.type(screen.getByPlaceholderText("480000"), "500000");
    await user.type(screen.getByPlaceholderText("320000"), "400000");
    await user.type(screen.getByPlaceholderText("3500"), "3000");
    await user.type(screen.getByPlaceholderText("800"), "500");
    await user.type(screen.getByPlaceholderText("7.4"), "1");
    await waitFor(() =>
      expect(screen.getByText(/lower yield \(1\.00%\)/i)).toBeInTheDocument()
    );
  }, 15000);

  it("uses the calculated yield when it is lower than the entered yield", async () => {
    // calcYield = (($3000 - $500) * 12) / $500000 = 6.00%
    // entered = 9%  →  diff = 3 > 2  →  lower = 6.00% (calculated wins)
    const user = userEvent.setup();
    render(<ListPropertyForm />);
    await goToStep2(user);
    await user.type(screen.getByPlaceholderText("480000"), "500000");
    await user.type(screen.getByPlaceholderText("320000"), "400000");
    await user.type(screen.getByPlaceholderText("3500"), "3000");
    await user.type(screen.getByPlaceholderText("800"), "500");
    await user.type(screen.getByPlaceholderText("7.4"), "9");
    await waitFor(() =>
      expect(screen.getByText(/lower yield \(6\.00%\)/i)).toBeInTheDocument()
    );
  }, 15000);

  // ─── Step 3: Description & Highlights ─────────────────────────────────────

  it("renders step 3 with description textarea when initialStep=3", () => {
    render(<ListPropertyForm initialStep={3} />);
    expect(screen.getByText(/Description.*Highlights/)).toBeInTheDocument();
  });

  it("Next button is disabled on step 3 when description is too short", () => {
    render(<ListPropertyForm initialStep={3} />);
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("Next enables on step 3 after entering ≥50-char description and a highlight", async () => {
    const user = userEvent.setup();
    render(<ListPropertyForm initialStep={3} />);
    const textarea = screen.getByPlaceholderText(/describe the property/i);
    await user.type(textarea, "A".repeat(50));
    await user.type(screen.getByPlaceholderText("Highlight 1"), "Great view");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /next/i })).not.toBeDisabled()
    );
  });

  it("Add Highlight button adds a new highlight input field", async () => {
    const user = userEvent.setup();
    render(<ListPropertyForm initialStep={3} />);
    await user.click(screen.getByRole("button", { name: /add highlight/i }));
    expect(screen.getByPlaceholderText("Highlight 2")).toBeInTheDocument();
  });

  it("Remove (X) button removes a highlight input", async () => {
    const user = userEvent.setup();
    render(<ListPropertyForm initialStep={3} />);
    await user.click(screen.getByRole("button", { name: /add highlight/i }));
    // X button appears only when >1 highlights exist
    const xButtons = screen.getAllByRole("button").filter(
      (b) => b.className.includes("text-text-secondary") && b.querySelector("svg")
    );
    await user.click(xButtons[0]);
    expect(screen.queryByPlaceholderText("Highlight 2")).not.toBeInTheDocument();
  });

  // ─── Step 4: SPV & Legal ───────────────────────────────────────────────────

  it("renders step 4 with SPV entity input when initialStep=4", () => {
    render(<ListPropertyForm initialStep={4} />);
    expect(screen.getByText(/SPV.*Legal/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/harbor heights/i)).toBeInTheDocument();
  });

  it("Next button is disabled on step 4 when SPV fields are empty", () => {
    render(<ListPropertyForm initialStep={4} />);
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("Next button enables on step 4 after filling all SPV fields and checking both boxes", async () => {
    const user = userEvent.setup();
    render(<ListPropertyForm initialStep={4} />);
    await user.type(screen.getByPlaceholderText(/harbor heights/i), "Harbor Heights LLC");
    await user.selectOptions(screen.getAllByRole("combobox")[0], "Delaware");
    await user.type(screen.getByPlaceholderText("30"), "30");
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /next/i })).not.toBeDisabled()
    );
  });

  it("shows equity out-of-range warning when value is 0", async () => {
    const user = userEvent.setup();
    render(<ListPropertyForm initialStep={4} />);
    await user.type(screen.getByPlaceholderText("30"), "0");
    await waitFor(() =>
      expect(screen.getByText(/must be between 1% and 97%/i)).toBeInTheDocument()
    );
  });

  // ─── Submit error state ────────────────────────────────────────────────────

  it("shows error message when submit returns a non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Server error, please try again." }),
    } as Response);
    render(<ListPropertyForm initialStep={5} />);
    fireEvent.click(screen.getByRole("button", { name: /submit listing/i }));
    await waitFor(() =>
      expect(screen.getByText(/server error, please try again/i)).toBeInTheDocument()
    );
  });

  it("shows network error message when fetch throws", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network failure"));
    render(<ListPropertyForm initialStep={5} />);
    fireEvent.click(screen.getByRole("button", { name: /submit listing/i }));
    await waitFor(() =>
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    );
  });
});
