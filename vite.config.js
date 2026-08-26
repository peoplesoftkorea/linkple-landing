/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 개발에서도 배포와 같은 주소(`/api`)를 쓰게 한다.
    // 이게 없으면 개발에서만 다른 주소를 쓰게 되고, "로컬에선 됐는데" 가 생긴다.
    proxy: {
      "/api": {
        target: process.env.API_ORIGIN ?? "http://localhost:3001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    css: true,
  },
});
