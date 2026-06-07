import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// biome-ignore lint/style/noDefaultExport: required default export
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
