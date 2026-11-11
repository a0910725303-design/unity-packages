import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    fs: {
      deny: [
        '.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/AGENTS.md',
        '**/example/**', '**/codex/**', '**/server/**'
      ],
    },
    proxy: { "/api": "http://127.0.0.1:3001" },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-dom/client"],
          icons: ["lucide-react"],
        },
      },
    },
  },
});
