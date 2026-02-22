import "@testing-library/jest-dom";
import React from "react";
import { vi } from "vitest";

// Mock Next.js internals used by owner components
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/owner/dashboard",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) =>
    React.createElement("img", props),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement("a", { href, ...rest }, children),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: { name: "Test Owner", email: "owner@test.com", id: "user-1" },
    },
    status: "authenticated",
  }),
  signOut: vi.fn(),
}));
