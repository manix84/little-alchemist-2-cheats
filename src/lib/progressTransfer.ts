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

const toBinaryBase64Url = (bytes: number[]) => toBase64Url(String.fromCharCode(...bytes));

const fromBinaryBase64Url = (value: string) =>
  Array.from(fromBase64Url(value), (character) => character.charCodeAt(0));

const parseCombinationKeyParts = (combinationKey: string) => {
  const match = /^(\d+):(\d+)\+(\d+)$/.exec(combinationKey);
  if (!match) return undefined;

  const values = match.slice(1).map(Number);
  return values.every((value) => Number.isInteger(value) && value >= 0 && value <= 1023) ? values : undefined;
};

const createPackedProgressTransferToken = (discoveredCombinations: string[], includeDlcContent: boolean) => {
  const bytes: number[] = [];
  let currentByte = 0;
  let bitCount = 0;

  const writeBits = (value: number) => {
    currentByte = (currentByte << 10) | value;
    bitCount += 10;

    while (bitCount >= 8) {
      bitCount -= 8;
      bytes.push((currentByte >> bitCount) & 255);
      currentByte &= (1 << bitCount) - 1;
    }
  };

  for (const combinationKey of discoveredCombinations) {
    const parts = parseCombinationKeyParts(combinationKey);
    if (!parts) return undefined;
    parts.forEach(writeBits);
  }

  if (bitCount > 0) {
    bytes.push((currentByte << (8 - bitCount)) & 255);
  }

  return ["2", includeDlcContent ? "1" : "0", discoveredCombinations.length.toString(36), toBinaryBase64Url(bytes)].join(".");
};

const parsePackedProgressTransferToken = (token: string): ProgressTransferPayload | undefined => {
  const [, includeDlcContentValue, combinationCountValue, packedValue] = token.split(".");
  const combinationCount = Number.parseInt(combinationCountValue ?? "", 36);
  if ((includeDlcContentValue !== "0" && includeDlcContentValue !== "1") || !Number.isInteger(combinationCount) || combinationCount < 0) {
    return undefined;
  }

  try {
    const bytes = fromBinaryBase64Url(packedValue ?? "");
    const values: number[] = [];
    let currentValue = 0;
    let bitCount = 0;

    for (const byte of bytes) {
      currentValue = (currentValue << 8) | byte;
      bitCount += 8;

      while (bitCount >= 10 && values.length < combinationCount * 3) {
        bitCount -= 10;
        values.push((currentValue >> bitCount) & 1023);
        currentValue &= (1 << bitCount) - 1;
      }
    }

    if (values.length !== combinationCount * 3) {
      return undefined;
    }

    const discoveredCombinations = Array.from({ length: combinationCount }, (_value, index) => {
      const offset = index * 3;
      return `${values[offset]}:${values[offset + 1]}+${values[offset + 2]}`;
    });

    return {
      v: 1,
      discoveredCombinations: getValidDiscoveredCombinations(discoveredCombinations),
      includeDlcContent: includeDlcContentValue === "1",
    };
  } catch {
    return undefined;
  }
};

const createBitsetProgressTransferToken = (discoveredCombinations: string[], includeDlcContent: boolean, knownCombinationKeys: string[]) => {
  const discoveredCombinationSet = new Set(discoveredCombinations);
  const bytes = Array.from({ length: Math.ceil(knownCombinationKeys.length / 8) }, () => 0);

  knownCombinationKeys.forEach((combinationKey, index) => {
    if (discoveredCombinationSet.has(combinationKey)) {
      bytes[Math.floor(index / 8)] |= 1 << (7 - (index % 8));
    }
  });

  return ["3", includeDlcContent ? "1" : "0", toBinaryBase64Url(bytes)].join(".");
};

const parseBitsetProgressTransferToken = (token: string, knownCombinationKeys: string[] | undefined): ProgressTransferPayload | undefined => {
  if (!knownCombinationKeys) return undefined;

  const [, includeDlcContentValue, packedValue] = token.split(".");
  if (includeDlcContentValue !== "0" && includeDlcContentValue !== "1") {
    return undefined;
  }

  try {
    const bytes = fromBinaryBase64Url(packedValue ?? "");
    const discoveredCombinations = knownCombinationKeys.filter((_combinationKey, index) => {
      const byte = bytes[Math.floor(index / 8)] ?? 0;
      return Boolean(byte & (1 << (7 - (index % 8))));
    });

    return {
      v: 1,
      discoveredCombinations: getValidDiscoveredCombinations(discoveredCombinations),
      includeDlcContent: includeDlcContentValue === "1",
    };
  } catch {
    return undefined;
  }
};

const createJsonProgressTransferToken = (discoveredCombinations: string[], includeDlcContent: boolean) =>
  toBase64Url(
    JSON.stringify({
      v: 1,
      discoveredCombinations,
      includeDlcContent,
    } satisfies ProgressTransferPayload)
  );

export const createProgressTransferToken = (discoveredCombinations: string[], includeDlcContent: boolean, knownCombinationKeys?: string[]) => {
  const validDiscoveredCombinations = getValidDiscoveredCombinations(discoveredCombinations);
  if (knownCombinationKeys?.length) {
    return createBitsetProgressTransferToken(validDiscoveredCombinations, includeDlcContent, knownCombinationKeys);
  }

  return createPackedProgressTransferToken(validDiscoveredCombinations, includeDlcContent) ?? createJsonProgressTransferToken(validDiscoveredCombinations, includeDlcContent);
};

export const parseProgressTransferToken = (token: string, knownCombinationKeys?: string[]): ProgressTransferPayload | undefined => {
  if (token.startsWith("3.")) {
    return parseBitsetProgressTransferToken(token, knownCombinationKeys);
  }

  if (token.startsWith("2.")) {
    return parsePackedProgressTransferToken(token);
  }

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
