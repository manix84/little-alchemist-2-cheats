import { afterEach, beforeEach, expect, test } from "vitest";
import QRCode from "qrcode";
import {
  createProgressTransferToken,
  getStoredIncludeDlcContent,
  INCLUDE_DLC_CONTENT_KEY,
  parseProgressTransferToken,
  persistProgressTransfer,
} from "./progressTransfer";

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

test("creates and parses a compact progress transfer token", () => {
  const token = createProgressTransferToken(["3:1+2", "3:1+2", "5:2+2"], true);

  expect(token).toMatch(/^2\./);
  expect(parseProgressTransferToken(token)).toEqual({
    v: 1,
    discoveredCombinations: ["3:1+2", "5:2+2"],
    includeDlcContent: true,
  });
});

test("keeps large progress transfer tokens small enough for QR codes", async () => {
  const knownCombinationKeys = Array.from({ length: 900 }, (_value, index) => `${100 + index}:${200 + index}+${300 + index}`);
  const discoveredCombinations = knownCombinationKeys.slice(0, 500);
  const token = createProgressTransferToken(discoveredCombinations, true, knownCombinationKeys);
  const transferUrl = `https://manix84.github.io/little-alchemist-2-cheats/?progress=${token}`;

  expect(token).toMatch(/^3\./);
  expect(transferUrl.length).toBeLessThan(300);
  await expect(QRCode.toString(transferUrl, { errorCorrectionLevel: "L", type: "svg" })).resolves.toContain("<svg");
  expect(parseProgressTransferToken(token, knownCombinationKeys)?.discoveredCombinations).toEqual(discoveredCombinations);
});

test("parses legacy JSON progress transfer tokens", () => {
  const legacyToken = btoa(
    JSON.stringify({
      v: 1,
      discoveredCombinations: ["3:1+2"],
      includeDlcContent: true,
    })
  );

  expect(parseProgressTransferToken(legacyToken)).toEqual({
    v: 1,
    discoveredCombinations: ["3:1+2"],
    includeDlcContent: true,
  });
});

test("rejects invalid progress transfer tokens", () => {
  expect(parseProgressTransferToken("not-valid")).toBeUndefined();
  expect(parseProgressTransferToken(btoa(JSON.stringify({ v: 2 })))).toBeUndefined();
});

test("persists imported progress", () => {
  persistProgressTransfer({
    v: 1,
    discoveredCombinations: ["3:1+2"],
    includeDlcContent: true,
  });

  expect(window.localStorage.getItem("la2-discovered-combinations")).toBe(JSON.stringify(["3:1+2"]));
  expect(window.localStorage.getItem(INCLUDE_DLC_CONTENT_KEY)).toBe("true");
  expect(getStoredIncludeDlcContent()).toBe(true);
});
