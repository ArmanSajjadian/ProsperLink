import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SellModal from "@/components/SellModal";

const defaultProps = {
  propertyId: "lakeside-apartments",
  propertyName: "Lakeside Apartments",
  propertyCity: "Austin",
  propertyState: "TX",
  tokenPrice: 1.25,
  totalOwnedTokens: 1000,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
};

let mockFetch: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  mockFetch = vi.fn();
  global.fetch = mockFetch;
});

describe("SellModal", () => {
  describe("Step 1 — tokens", () => {
    it("renders property name in the modal heading", () => {
      render(<SellModal {...defaultProps} />);
      expect(screen.getByText(/Sell Tokens — Lakeside Apartments/i)).toBeInTheDocument();
    });

    it("shows city and state in the header", () => {
      render(<SellModal {...defaultProps} />);
      expect(screen.getByText("Austin, TX")).toBeInTheDocument();
    });

    it("shows how many tokens the user owns", () => {
      render(<SellModal {...defaultProps} />);
      // "1,000" appears in multiple nodes — verify at least one is present
      expect(screen.getAllByText("1,000").length).toBeGreaterThan(0);
    });

    it("renders all 4 quick-select percentage buttons", () => {
      render(<SellModal {...defaultProps} />);
      ["25%", "50%", "75%", "100%"].forEach((label) => {
        expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
      });
    });

    it("clicking 50% quick-select sets tokenCount to 500", async () => {
      const user = userEvent.setup();
      render(<SellModal {...defaultProps} />);
      await user.click(screen.getByRole("button", { name: "50%" }));
      // 500 * 1.25 = $625.00 for both sale proceeds and remaining value (symmetric split)
      expect(screen.getAllByText("$625.00").length).toBeGreaterThan(0);
    });

    it("clicking 100% quick-select sets tokenCount to 1000", async () => {
      const user = userEvent.setup();
      render(<SellModal {...defaultProps} />);
      await user.click(screen.getByRole("button", { name: "100%" }));
      // 1000 * 1.25 = $1250.00
      expect(screen.getByText("$1250.00")).toBeInTheDocument();
    });

    it("Review Sale button is disabled when tokenCount is 0", () => {
      render(<SellModal {...defaultProps} />);
      expect(screen.getByRole("button", { name: /review sale/i })).toBeDisabled();
    });

    it("Review Sale button is enabled after selecting tokens", async () => {
      const user = userEvent.setup();
      render(<SellModal {...defaultProps} />);
      await user.click(screen.getByRole("button", { name: "25%" }));
      expect(screen.getByRole("button", { name: /review sale/i })).not.toBeDisabled();
    });

    it("25% quick-select calculates correct remaining tokens and value", async () => {
      const user = userEvent.setup();
      render(<SellModal {...defaultProps} />);
      await user.click(screen.getByRole("button", { name: "25%" }));
      // 25% of 1000 = 250 tokens sold, 750 remaining
      // remaining value = 750 * 1.25 = $937.50
      expect(screen.getByText("$937.50")).toBeInTheDocument();
    });

    it("calls onClose when X button is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<SellModal {...defaultProps} onClose={onClose} />);
      const closeBtn = screen.getAllByRole("button").find((b) => !b.textContent?.trim());
      if (closeBtn) await user.click(closeBtn);
      expect(onClose).toHaveBeenCalled();
    });

    it("advances to review step when Review Sale is clicked", async () => {
      const user = userEvent.setup();
      render(<SellModal {...defaultProps} />);
      await user.click(screen.getByRole("button", { name: "50%" }));
      await user.click(screen.getByRole("button", { name: /review sale/i }));
      expect(screen.getByText("Sale Summary")).toBeInTheDocument();
    });

    it("typing a value in the token count input updates the token count", () => {
      const { fireEvent } = require("@testing-library/react");
      render(<SellModal {...defaultProps} />);
      const input = screen.getByRole("spinbutton") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "200" } });
      // The onChange clamps to floor(max(0, min(1000, 200))) = 200
      expect(Number(input.value)).toBe(200);
    });
  });

  describe("Step 2 — review", () => {
    async function goToReview(tokenPercent = "50%") {
      const user = userEvent.setup();
      render(<SellModal {...defaultProps} />);
      await user.click(screen.getByRole("button", { name: tokenPercent }));
      await user.click(screen.getByRole("button", { name: /review sale/i }));
      return user;
    }

    it("shows Sale Summary heading", async () => {
      await goToReview();
      expect(screen.getByText("Sale Summary")).toBeInTheDocument();
    });

    it("shows property name in summary rows", async () => {
      await goToReview();
      expect(screen.getByText("Lakeside Apartments")).toBeInTheDocument();
    });

    it("shows sale proceeds in the summary total", async () => {
      await goToReview("50%");
      // 500 tokens * $1.25 = $625.00
      expect(screen.getByText("$625.00")).toBeInTheDocument();
    });

    it("shows sell-all warning when selling 100% of tokens", async () => {
      await goToReview("100%");
      expect(screen.getByText(/selling all tokens will remove this property/i)).toBeInTheDocument();
    });

    it("does NOT show sell-all warning for partial sale", async () => {
      await goToReview("50%");
      expect(screen.queryByText(/selling all tokens will remove this property/i)).not.toBeInTheDocument();
    });

    it("Back button returns to tokens step", async () => {
      const user = await goToReview();
      await user.click(screen.getByRole("button", { name: /back/i }));
      expect(screen.getByRole("button", { name: /review sale/i })).toBeInTheDocument();
    });

    it("calls fetch /api/sell with correct body on confirm", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);
      const user = await goToReview("50%");
      await user.click(screen.getByRole("button", { name: /confirm sale/i }));
      await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(
        "/api/sell",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ propertyId: "lakeside-apartments", tokenCount: 500 }),
        })
      ));
    });

    it("shows error message when fetch returns non-ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Not enough tokens." }),
      } as Response);
      const user = await goToReview();
      await user.click(screen.getByRole("button", { name: /confirm sale/i }));
      await waitFor(() => expect(screen.getByText("Not enough tokens.")).toBeInTheDocument());
    });

    it("advances to success step after successful sale", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);
      const user = await goToReview("50%");
      await user.click(screen.getByRole("button", { name: /confirm sale/i }));
      await waitFor(() => expect(screen.getByText("Sale Confirmed!")).toBeInTheDocument());
    });
  });

  describe("Step 3 — success", () => {
    async function goToSuccess(tokenPercent = "50%") {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);
      const user = userEvent.setup();
      render(<SellModal {...defaultProps} />);
      await user.click(screen.getByRole("button", { name: tokenPercent }));
      await user.click(screen.getByRole("button", { name: /review sale/i }));
      await user.click(screen.getByRole("button", { name: /confirm sale/i }));
      await waitFor(() => screen.getByText("Sale Confirmed!"));
      return user;
    }

    it("shows Sale Confirmed heading", async () => {
      await goToSuccess();
      expect(screen.getByText("Sale Confirmed!")).toBeInTheDocument();
    });

    it("shows sold token count and proceeds in success message", async () => {
      await goToSuccess("50%");
      // Text is split across spans so multiple elements match
      expect(screen.getAllByText(/500 tokens/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\$625\.00/).length).toBeGreaterThan(0);
    });

    it("shows remaining tokens for partial sale", async () => {
      await goToSuccess("50%");
      expect(screen.getByText(/500 tokens remaining/)).toBeInTheDocument();
    });

    it("shows removed from portfolio message for full sale", async () => {
      await goToSuccess("100%");
      expect(screen.getByText(/removed from your portfolio/i)).toBeInTheDocument();
    });

    it("View Transactions link points to /dashboard/transactions", async () => {
      await goToSuccess();
      const link = screen.getByRole("link", { name: /view transactions/i });
      expect(link).toHaveAttribute("href", "/dashboard/transactions");
    });

    it("calls onSuccess when success step mounts", async () => {
      const onSuccess = vi.fn();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);
      const user = userEvent.setup();
      render(<SellModal {...defaultProps} onSuccess={onSuccess} />);
      await user.click(screen.getByRole("button", { name: "50%" }));
      await user.click(screen.getByRole("button", { name: /review sale/i }));
      await user.click(screen.getByRole("button", { name: /confirm sale/i }));
      await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    });
  });
});
