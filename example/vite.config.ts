import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// biome-ignore lint/style/noDefaultExport: required default export
export default defineConfig(({ mode }) => ({
  base: mode === "github-pages" ? "/jp-flick-keyboard/" : "/",
  plugins: [react(), tailwindcss()],
}));
