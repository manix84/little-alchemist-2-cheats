#!/usr/bin/env node

import { createWriteStream, promises as fs } from "node:fs";
import https from "node:https";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import data from "../public/data/data.json" with { type: "json" };

const ICON_BASE_URL = "https://hints.littlealchemy2.com/icons";
const LOGO_URL = "https://hints.littlealchemy2.com/img/la2-logo.svg";
const PUBLIC_DIR = "public";
const ELEMENTS_DIR = path.join(PUBLIC_DIR, "elements");
const BRAND_DIR = path.join(PUBLIC_DIR, "brand");
const CONCURRENCY = 12;

const download = (url, destination) =>
  new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        download(response.headers.location, destination).then(resolve, reject);
        return;
      }

      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`Failed ${url}: HTTP ${response.statusCode}`));
        return;
      }

      pipeline(response, createWriteStream(destination)).then(resolve, reject);
    });

    request.on("error", reject);
  });

const runWithConcurrency = async (items, worker) => {
  let index = 0;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (index < items.length) {
      const item = items[index];
      index += 1;
      await worker(item);
    }
  });

  await Promise.all(workers);
};

const main = async () => {
  await fs.mkdir(ELEMENTS_DIR, { recursive: true });
  await fs.mkdir(BRAND_DIR, { recursive: true });

  await download(LOGO_URL, path.join(BRAND_DIR, "la2-logo.svg"));

  const ids = Object.keys(data);
  let completed = 0;

  await runWithConcurrency(ids, async (id) => {
    await download(`${ICON_BASE_URL}/${id}.svg`, path.join(ELEMENTS_DIR, `${id}.svg`));
    completed += 1;

    if (completed % 50 === 0 || completed === ids.length) {
      console.log(`🧪 Downloaded ${completed}/${ids.length} element icons`);
    }
  });

  console.log("✨ Asset download complete");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
