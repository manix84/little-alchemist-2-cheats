import { beforeEach, expect, test } from "vitest";
import {
  createCombinationKey,
  DISCOVERED_COMBINATIONS_KEY,
  formatCombinationCount,
  getDiscoveredCombinationCount,
  getStoredDiscoveredCombinations,
  sortByDiscoveredState,
} from "./discoveredCombinations";

beforeEach(() => {
  window.localStorage.clear();
});

test("loads stored discovered combinations", () => {
  window.localStorage.setItem(DISCOVERED_COMBINATIONS_KEY, JSON.stringify(["3:1+2"]));

  expect(getStoredDiscoveredCombinations()).toEqual(["3:1+2"]);
});

test("returns an empty list when stored discovered combinations are invalid", () => {
  window.localStorage.setItem(DISCOVERED_COMBINATIONS_KEY, "nope");

  expect(getStoredDiscoveredCombinations()).toEqual([]);
});

test("formats discovered and total counts", () => {
  expect(formatCombinationCount(0, 7)).toBe("0/7");
  expect(formatCombinationCount(2, 7)).toBe("2/7");
});

test("creates and counts discovered combination keys", () => {
  const discoveredCombinationSet = new Set(["3:1+2"]);

  expect(createCombinationKey("3", ["1", "2"])).toBe("3:1+2");
  expect(getDiscoveredCombinationCount("3", [["1", "2"], ["2", "1"]], discoveredCombinationSet)).toBe(1);
});

test("sorts discovered rows after undiscovered rows", () => {
  const rows = [{ combinationKey: "3:1+2" }, { combinationKey: "3:2+1" }];

  expect(sortByDiscoveredState(rows, new Set(["3:1+2"]))).toEqual([{ combinationKey: "3:2+1" }, { combinationKey: "3:1+2" }]);
});
