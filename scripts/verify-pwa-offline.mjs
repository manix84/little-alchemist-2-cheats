#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import data from "../public/data/data.json" with { type: "json" };

const requiredFiles = [
  "index.html",
  "manifest.json",
  "data/data.json",
  "brand/la2-logo.svg",
  ...Object.keys(data).map((id) => `elements/${id}.svg`),
];

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const main = () => {
  assert(existsSync("dist/sw.js"), "dist/sw.js is missing. Run npm run build first.");

  const serviceWorker = readFileSync("dist/sw.js", "utf8");
  const missing = requiredFiles.filter((file) => !serviceWorker.includes(file));

  assert(serviceWorker.includes("precacheAndRoute"), "Service worker is not precaching files.");
  assert(serviceWorker.includes('createHandlerBoundToURL("index.html")'), "Service worker is missing the offline navigation fallback.");
  assert(missing.length === 0, `Service worker precache is missing ${missing.length} offline files: ${missing.slice(0, 10).join(", ")}`);

  console.log(`📲 PWA offline check passed: ${requiredFiles.length} app, data, and image assets are precached.`);
};

try {
  main();
} catch (error) {
  console.error(`PWA offline check failed: ${error.message}`);
  process.exit(1);
}
