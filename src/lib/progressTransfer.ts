import { DISCOVERED_COMBINATIONS_KEY } from "./discoveredCombinations";

export const INCLUDE_DLC_CONTENT_KEY = "la2-include-dlc-content";
export const PROGRESS_TRANSFER_PARAM = "progress";

type ProgressTransferPayload = {
  discoveredCombinations: string[];
  includeDlcContent: boolean;
  v: 1;
};

export const getStoredIncludeDlcContent = () => {
  try {
    return window.localStorage.getItem(INCLUDE_DLC_CONTENT_KEY) === "true";
  } catch {
    return false;
  }
};

const getValidDiscoveredCombinations = (value: unknown) =>
  Array.isArray(value) && value.every((combinationKey) => typeof combinationKey === "string") ? Array.from(new Set(value)).sort() : [];

const toBase64Url = (value: string) => btoa(value).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");

const fromBase64Url = (value: string) => {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  return atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
};

export const createProgressTransferToken = (discoveredCombinations: string[], includeDlcContent: boolean) =>
  toBase64Url(
    JSON.stringify({
      v: 1,
      discoveredCombinations: getValidDiscoveredCombinations(discoveredCombinations),
      includeDlcContent,
    } satisfies ProgressTransferPayload)
  );

export const parseProgressTransferToken = (token: string): ProgressTransferPayload | undefined => {
  try {
    const payload: unknown = JSON.parse(fromBase64Url(token));

    if (!payload || typeof payload !== "object" || !("v" in payload) || payload.v !== 1) {
      return undefined;
    }

    return {
      v: 1,
      discoveredCombinations: getValidDiscoveredCombinations("discoveredCombinations" in payload ? payload.discoveredCombinations : undefined),
      includeDlcContent: "includeDlcContent" in payload && payload.includeDlcContent === true,
    };
  } catch {
    return undefined;
  }
};

export const persistProgressTransfer = (payload: ProgressTransferPayload) => {
  try {
    window.localStorage.setItem(DISCOVERED_COMBINATIONS_KEY, JSON.stringify(payload.discoveredCombinations));
    window.localStorage.setItem(INCLUDE_DLC_CONTENT_KEY, String(payload.includeDlcContent));
  } catch {
    // The caller still applies the imported progress in memory when storage is unavailable.
  }
};
