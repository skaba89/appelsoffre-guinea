/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom for DOM-related tests
    environment: "jsdom",

    // Global test setup
    globals: true,

    // Setup files
    setupFiles: ["./src/__tests__/setup.ts"],

    // Include patterns
    include: ["src/__tests__/**/*.test.{ts,tsx}"],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/lib/**/*.ts"],
      exclude: [
        "src/lib/utils.ts",
        "src/lib/db.ts",
        "src/lib/design-tokens.ts",
        "src/lib/mock-data.ts",
      ],
      thresholds: {
        branches: 60,
        functions: 60,
        lines: 60,
        statements: 60,
      },
    },

    // Timeout for long-running tests
    testTimeout: 10000,

    // Watch exclude
    watchExclude: ["**/node_modules/**", "**/dist/**", "**/.next/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
