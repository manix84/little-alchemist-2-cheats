import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import useData, { RawData } from "./Data";

const baseUrl = import.meta.env.BASE_URL;

const testData: RawData = {
  "1": {
    prime: true,
    n: "Air",
    s: "air",
    c: ["3"],
  },
  "2": {
    prime: true,
    n: "Fire",
    s: "fire",
    c: ["3"],
  },
  "3": {
    n: "Energy",
    s: "energy",
    p: [["1", "2"]],
  },
  "1_41": {
    d: "myths-and-monsters",
    n: "Immortality",
    s: "immortality",
  },
};

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(testData),
    })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("loads data and exposes sorted autocomplete options", async () => {
  const { result } = renderHook(() => useData());

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  expect(fetch).toHaveBeenCalledWith(`${baseUrl}data/data.json`);
  expect(result.current.getOptions()).toEqual([
    {
      id: "1",
      image: `${baseUrl}elements/1.svg`,
      label: "Air",
    },
    {
      id: "3",
      image: `${baseUrl}elements/3.svg`,
      label: "Energy",
    },
    {
      id: "2",
      image: `${baseUrl}elements/2.svg`,
      label: "Fire",
    },
    {
      id: "1_41",
      image: `${baseUrl}elements/1_41.svg`,
      label: "Immortality",
    },
  ]);
});

test("looks up combinations and reverse makes combinations", async () => {
  const { result } = renderHook(() => useData());

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  expect(result.current.getName("3")).toBe("Energy");
  expect(result.current.getSlug("3")).toBe("energy");
  expect(result.current.getIDBySlug("energy")).toBe("3");
  expect(result.current.getImage("3")).toBe(`${baseUrl}elements/3.svg`);
  expect(result.current.getCombinations("3")).toEqual([["1", "2"]]);
  expect(result.current.getIsDlc("1_41")).toBe(true);
  expect(result.current.getIsDlc("3")).toBe(false);
  expect(result.current.getMakesCombinations("1")).toEqual({
    "3": [["1", "2"]],
  });
});

test("exposes fetch errors", async () => {
  const error = new Error("No data today");
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(error));
  vi.spyOn(console, "error").mockImplementation(() => undefined);

  const { result } = renderHook(() => useData());

  await waitFor(() => expect(result.current.error).toBe(error));
  expect(console.error).toHaveBeenCalledWith(error);
});
