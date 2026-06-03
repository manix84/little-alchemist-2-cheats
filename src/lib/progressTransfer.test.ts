import { afterEach, beforeEach, expect, test } from "vitest";
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

  expect(parseProgressTransferToken(token)).toEqual({
    v: 1,
    discoveredCombinations: ["3:1+2", "5:2+2"],
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
