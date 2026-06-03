export const DISCOVERED_COMBINATIONS_KEY = "la2-discovered-combinations";

export type CombinationRowData = {
  combinationKey: string;
  items: CombinationRowItem[];
};

export type CombinationRowItem = {
  elementID: string;
  symbolBefore?: "+" | "=";
};

export const getStoredDiscoveredCombinations = () => {
  try {
    const value = window.localStorage.getItem(DISCOVERED_COMBINATIONS_KEY);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
};

export const createCombinationKey = (producesID: string, elementIDs: string[]) => `${producesID}:${elementIDs.join("+")}`;

export const formatCombinationCount = (discoveredCount: number, totalCount: number) => `${discoveredCount}/${totalCount}`;

export const getDiscoveredCombinationCount = (
  producesID: string,
  combinations: string[][] | undefined,
  discoveredCombinationSet: Set<string>
) => combinations?.filter((combination) => discoveredCombinationSet.has(createCombinationKey(producesID, combination))).length ?? 0;

export const sortByDiscoveredState = <Row extends { combinationKey: string }>(rows: Row[], discoveredCombinationSet: Set<string>) =>
  [...rows].sort((firstRow, secondRow) => {
    const firstIsDiscovered = discoveredCombinationSet.has(firstRow.combinationKey);
    const secondIsDiscovered = discoveredCombinationSet.has(secondRow.combinationKey);
    return Number(firstIsDiscovered) - Number(secondIsDiscovered);
  });
