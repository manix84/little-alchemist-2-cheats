#!/usr/bin/env node

import { promises as fs } from "node:fs";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";
import currentData from "../public/data/data.json" with { type: "json" };

export const HINTS_ORIGIN = "https://hints.littlealchemy2.com";
export const DATA_PATH = path.join("public", "data", "data.json");

const CONCURRENCY = 12;
const USER_AGENT = "little-alchemist-2-cheats-data-refresh";

export const fetchText = (url) =>
  new Promise((resolve, reject) => {
    const request = https.get(url, { headers: { "user-agent": USER_AGENT } }, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        fetchText(new URL(response.headers.location, url).href).then(resolve, reject);
        return;
      }

      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`Failed ${url}: HTTP ${response.statusCode}`));
        return;
      }

      response.setEncoding("utf8");
      let body = "";
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => resolve(body));
    });

    request.on("error", reject);
  });

export const fetchJson = async (url) => JSON.parse(await fetchText(url));

export const extractScriptUrl = (html) => {
  const scripts = [...html.matchAll(/<script[^>]+src=["']([^"']*scripts\.[^"']+\.js)["']/g)].map((match) => match[1]);

  if (scripts.length === 0) {
    throw new Error("Could not find the Little Alchemy hints script bundle");
  }

  return new URL(scripts[scripts.length - 1], HINTS_ORIGIN).href;
};

export const extractSlugs = (scriptText) => {
  const match = scriptText.match(/e\.exports=(\[[\s\S]*?\])\},93:function/);

  if (!match) {
    throw new Error("Could not find the Little Alchemy item slug list");
  }

  const slugs = JSON.parse(match[1]);

  if (!Array.isArray(slugs) || slugs.some((slug) => typeof slug !== "string")) {
    throw new Error("The Little Alchemy item slug list had an unexpected shape");
  }

  return slugs;
};

export const extractRecipePairs = (parentsHtml = "") => {
  const recipeKeys = new Set();
  const pairs = [];

  for (const listItem of parentsHtml.matchAll(/<li\b[^>]*class=["'][^"']*\bpair\b[^"']*["'][^>]*>([\s\S]*?)<\/li>/g)) {
    const ids = [...listItem[1].matchAll(/\/icons\/([a-zA-Z0-9_-]+)\.svg/g)].map((match) => match[1]);

    if (ids.length < 2) {
      continue;
    }

    const pair = ids.slice(0, 2);
    const key = pair.join("+");

    if (!recipeKeys.has(key)) {
      pairs.push(pair);
      recipeKeys.add(key);
    }
  }

  return pairs;
};

export const buildData = (items, previousData = {}) => {
  const primeIds = new Set(
    Object.entries(previousData)
      .filter(([, item]) => item?.prime)
      .map(([id]) => id),
  );

  const output = {};

  for (const item of items) {
    const id = String(item.id ?? "");

    if (!id || typeof item.name !== "string") {
      throw new Error(`Item had an unexpected shape: ${JSON.stringify(item)}`);
    }

    const entry = {};

    if (primeIds.has(id)) {
      entry.prime = true;
    }

    entry.n = item.name;

    const pairs = extractRecipePairs(item.parents);
    if (pairs.length > 0) {
      entry.p = pairs;
    }

    output[id] = entry;
  }

  const createsByParent = Object.fromEntries(Object.keys(output).map((id) => [id, new Set()]));

  for (const [producesId, item] of Object.entries(output)) {
    for (const pair of item.p ?? []) {
      for (const parentId of new Set(pair)) {
        if (createsByParent[parentId]) {
          createsByParent[parentId].add(producesId);
        }
      }
    }
  }

  for (const [id, creates] of Object.entries(createsByParent)) {
    if (creates.size > 0) {
      output[id].c = [...creates].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    }
  }

  return Object.fromEntries(Object.entries(output).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })));
};

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

const fetchItems = async (initialSlugs) => {
  const queuedSlugs = new Set(initialSlugs);
  const itemsBySlug = new Map();
  const pendingSlugs = [...initialSlugs];

  while (pendingSlugs.length > 0) {
    const batch = pendingSlugs.splice(0);
    const batchItems = [];
    let completed = 0;

    await runWithConcurrency(batch, async (slug) => {
      const item = await fetchJson(`${HINTS_ORIGIN}/item_data/${slug}.json`);
      batchItems.push(item);
      completed += 1;

      if (completed % 50 === 0 || completed === batch.length) {
        console.log(`📦 Fetched ${completed}/${batch.length} items in current batch`);
      }
    });

    for (const item of batchItems) {
      itemsBySlug.set(item.slug, item);

      for (const parentSlug of item.parentSlugs ?? []) {
        if (!queuedSlugs.has(parentSlug)) {
          queuedSlugs.add(parentSlug);
          pendingSlugs.push(parentSlug);
        }
      }
    }

    if (pendingSlugs.length > 0) {
      console.log(`🧭 Found ${pendingSlugs.length} additional parent-only item slugs`);
    }
  }

  return [...itemsBySlug.values()];
};

const refreshData = async () => {
  console.log("🔎 Finding the current Little Alchemy hints bundle");
  const homeHtml = await fetchText(`${HINTS_ORIGIN}/`);
  const scriptUrl = extractScriptUrl(homeHtml);
  const scriptText = await fetchText(scriptUrl);
  const slugs = extractSlugs(scriptText);

  console.log(`🧪 Fetching ${slugs.length} listed item data files`);
  const items = await fetchItems(slugs);

  const data = buildData(items, currentData);
  const recipeCount = Object.values(data).reduce((count, item) => count + (item.p?.length ?? 0), 0);
  const makesCount = Object.values(data).filter((item) => item.c?.length).length;

  await fs.writeFile(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`);

  console.log(`✨ Refreshed ${DATA_PATH}`);
  console.log(`📊 ${Object.keys(data).length} elements, ${recipeCount} recipes, ${makesCount} elements with makes data`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  refreshData().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
