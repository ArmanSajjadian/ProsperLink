import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ListPropertyForm from "@/components/ListPropertyForm";

describe("ListPropertyForm", () => {
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
    vi.useFakeTimers();
    render(<ListPropertyForm initialStep={5} />);

    fireEvent.click(screen.getByRole("button", { name: /submit listing/i }));

    await act(async () => {
      vi.advanceTimersByTime(1600);
    });

    expect(
      screen.getByText(/listing submitted for review/i)
    ).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("shows 'View My Properties' and 'Upload Documents' links on success screen", async () => {
    vi.useFakeTimers();
    render(<ListPropertyForm initialStep={5} />);
    fireEvent.click(screen.getByRole("button", { name: /submit listing/i }));
    await act(async () => {
      vi.advanceTimersByTime(1600);
    });

    expect(
      screen.getByRole("link", { name: /view my properties/i })
    ).toHaveAttribute("href", "/owner/dashboard");
    expect(
      screen.getByRole("link", { name: /upload documents/i })
    ).toHaveAttribute("href", "/owner/documents");

    vi.useRealTimers();
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
    // entered = 4%  →  lower = 4.00%
    const user = userEvent.setup();
    render(<ListPropertyForm />);
    await goToStep2(user);
    await user.type(screen.getByPlaceholderText("480000"), "500000");
    await user.type(screen.getByPlaceholderText("320000"), "400000");
    await user.type(screen.getByPlaceholderText("3500"), "3000");
    await user.type(screen.getByPlaceholderText("800"), "500");
    await user.type(screen.getByPlaceholderText("7.4"), "4");
    await waitFor(() =>
      expect(screen.getByText(/lower yield \(4\.00%\)/i)).toBeInTheDocument()
    );
  });

  it("uses the calculated yield when it is lower than the entered yield", async () => {
    // calcYield = (($3000 - $500) * 12) / $500000 = 6.00%
    // entered = 9%  →  lower = 6.00% (calculated wins)
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
  });
});
