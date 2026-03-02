import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SessionProvider from "@/components/SessionProvider";

// The global vitest.setup.ts mocks next-auth/react including SessionProvider
vi.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) =>
    <div data-testid="next-auth-provider">{children}</div>,
  useSession: vi.fn().mockReturnValue({ data: null, status: "loading" }),
  signOut: vi.fn(),
}));

describe("SessionProvider", () => {
  it("renders children inside the provider wrapper", () => {
    render(
      <SessionProvider>
        <span data-testid="child">Hello</span>
      </SessionProvider>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("wraps children in the NextAuth session provider", () => {
    render(
      <SessionProvider>
        <span>Content</span>
      </SessionProvider>
    );
    expect(screen.getByTestId("next-auth-provider")).toBeInTheDocument();
  });
});
