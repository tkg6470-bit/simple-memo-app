import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"; // 👈 これが必要です

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // 👇 追加: ここで @backend を実際のフォルダに紐付けます
    alias: {
      "@backend": path.resolve(__dirname, "../backend/src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
    },
    fs: {
      allow: [".."],
    },
  },
});