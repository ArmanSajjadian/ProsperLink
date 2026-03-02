import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "./coverage",
      include: ["app/api/**/*.ts", "components/**/*.tsx", "lib/**/*.ts"],
      exclude: [
        "lib/prisma.ts",
        "lib/mock*.ts",
        "prisma/**",
        ".next/**",
        "app/api/auth/\\[...nextauth\\]/**",
        "**/*.d.ts",
        "**/__tests__/**",
        "**/*.test.ts",
        "**/*.test.tsx",
        "vitest.setup.ts",
        "vitest.config.ts",
      ],
      thresholds: {
        statements: 95,
        branches: 95,
        functions: 95,
        lines: 95,
      },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
