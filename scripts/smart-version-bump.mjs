#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const VERSION_FILES = new Set(["package.json", "package-lock.json"]);
const VALID_BUMPS = new Set(["major", "minor", "patch", "none"]);

const docsOnlyPatterns = [
  /^README\.md$/i,
  /^WHATSNEW\.md$/i,
  /^CODE_OF_CONDUCT\.md$/i,
  /^CONTRIBUTING\.md$/i,
  /^SECURITY\.md$/i,
  /^SUPPORT\.md$/i,
  /^LICENSE$/i,
  /^\.github\/ISSUE_TEMPLATE\//,
  /^\.github\/PULL_REQUEST_TEMPLATE\.md$/i,
];

const minorPatterns = [
  /^src\/(?!.*\.test\.tsx?$)/,
  /^public\/(?!data\/)/,
  /^index\.html$/,
];

const patchPatterns = [
  /^public\/data\//,
  /^scripts\//,
  /^\.githooks\//,
  /^\.github\/workflows\//,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^tsconfig\.json$/,
  /^vite\.config\.ts$/,
  /^src\/.*\.test\.tsx?$/,
  /^src\/setupTests\.ts$/,
];

const runGit = (args, options = {}) =>
  execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });

const getStagedFiles = () =>
  runGit(["diff", "--cached", "--name-only", "--diff-filter=ACMRT", "-z"])
    .split("\0")
    .filter(Boolean);

const parseVersion = (version) => {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(version);
  if (!match) {
    throw new Error(`Unsupported semver version: ${version}`);
  }
  return match.slice(1).map(Number);
};

const nextVersion = (version, bump) => {
  const [major, minor, patch] = parseVersion(version);

  if (bump === "major") return `${major + 1}.0.0`;
  if (bump === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
};

const isDocsOnlyFile = (file) => docsOnlyPatterns.some((pattern) => pattern.test(file));
const matchesAny = (file, patterns) => patterns.some((pattern) => pattern.test(file));

const stagedDiffIncludesBreakingMarker = () => {
  const diff = runGit(["diff", "--cached", "--"]);
  return /BREAKING CHANGE|VERSION_BUMP=major|version:\s*major/i.test(diff);
};

const inferBump = (files) => {
  const nonVersionFiles = files.filter((file) => !VERSION_FILES.has(file));
  if (nonVersionFiles.length === 0) return "none";
  if (nonVersionFiles.every(isDocsOnlyFile)) return "none";
  if (stagedDiffIncludesBreakingMarker()) return "major";
  if (nonVersionFiles.some((file) => matchesAny(file, minorPatterns))) return "minor";
  if (nonVersionFiles.some((file) => matchesAny(file, patchPatterns))) return "patch";
  return "patch";
};

const updateJsonFile = (file, updater) => {
  const parsed = JSON.parse(readFileSync(file, "utf8"));
  updater(parsed);
  writeFileSync(file, `${JSON.stringify(parsed, null, 2)}\n`);
};

const main = () => {
  const override = process.env.VERSION_BUMP?.toLowerCase();
  if (override && !VALID_BUMPS.has(override)) {
    throw new Error("VERSION_BUMP must be one of: major, minor, patch, none");
  }

  const files = getStagedFiles();
  if (files.length === 0) {
    console.log("🔢 Version bump skipped: no staged files.");
    return;
  }

  const bump = override || inferBump(files);
  if (bump === "none") {
    console.log("🔢 Version bump skipped: no release-worthy staged changes.");
    return;
  }

  const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
  const currentVersion = packageJson.version;
  const newVersion = nextVersion(currentVersion, bump);

  updateJsonFile("package.json", (json) => {
    json.version = newVersion;
  });

  updateJsonFile("package-lock.json", (json) => {
    json.version = newVersion;
    if (json.packages?.[""]) {
      json.packages[""].version = newVersion;
    }
  });

  runGit(["add", "package.json", "package-lock.json"], { stdio: "inherit" });
  console.log(`🔢 Version bumped: ${currentVersion} -> ${newVersion} (${bump}).`);
};

try {
  main();
} catch (error) {
  console.error(`Version bump failed: ${error.message}`);
  process.exit(1);
}
