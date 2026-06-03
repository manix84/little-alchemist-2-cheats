import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

export default defineConfig(({ command }) => ({
  base: command === "serve" ? "/" : "/little-alchemist-2-cheats/",
  plugins: [
    react(),
    VitePWA({
      injectRegister: false,
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      manifestFilename: "manifest.json",
      includeAssets: ["favicon.ico", "robots.txt"],
      manifest: {
        name: "Little Alchemy 2 - Cheats",
        short_name: "Alchemy 2 Cheats",
        description: "Find your missing Little Alchemy 2 combinations.",
        lang: "en",
        start_url: ".",
        scope: ".",
        display: "standalone",
        theme_color: "#1f7a8c",
        background_color: "#102a43",
        icons: [
          {
            src: "icons/icon-48x48.png",
            sizes: "48x48",
            type: "image/png",
          },
          {
            src: "icons/icon-72x72.png",
            sizes: "72x72",
            type: "image/png",
          },
          {
            src: "icons/icon-128x128.png",
            sizes: "128x128",
            type: "image/png",
          },
          {
            src: "icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
          },
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "icons/icon-256x256.png",
            sizes: "256x256",
            type: "image/png",
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: "index.html",
      },
    }),
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
  },
}));
