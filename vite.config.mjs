import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "127.0.0.1",
    allowedHosts: ["terminal.local"],
    fs: {
      // Preserve Vite's sensitive-file defaults and protect private app data in dev.
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "**/.data/**", "**/data/**", `${path.resolve(process.env.DATA_DIR || '.data').replaceAll('\\', '/')}/**`],
    },
    proxy: { "/api": { target: "http://127.0.0.1:4174", changeOrigin: false } },
    warmup: {
      clientFiles: ["./src/main.tsx"],
    },
  },
  plugins: [react()],
});
