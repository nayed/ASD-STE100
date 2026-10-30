import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import highlight from "./scripts/highlight-plugin";
import spaRoutes from "./scripts/routes-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [highlight(), react(), tailwindcss(), spaRoutes()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
