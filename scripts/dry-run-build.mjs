#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";

const run = (command, args) => {
  execFileSync(command, args, {
    stdio: "inherit",
  });
};

try {
  run("npm", ["run", "build"]);
  run("npm", ["run", "pwa:verify"]);
} finally {
  rmSync("dist", { recursive: true, force: true });
}
