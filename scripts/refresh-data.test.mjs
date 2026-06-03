import { describe, expect, it } from "vitest";
import { buildData, extractRecipePairs, extractScriptUrl, extractSlugs, HINTS_ORIGIN } from "./refresh-data.mjs";

describe("refresh-data", () => {
  it("finds the current script bundle URL", () => {
    const html = '<html><head><script src="/scripts.abc123.js"></script></head></html>';

    expect(extractScriptUrl(html)).toBe(`${HINTS_ORIGIN}/scripts.abc123.js`);
  });

  it("extracts the slug list from the hints bundle", () => {
    const scriptText = '92:function(e){e.exports=["acid-rain","fire","water"]},93:function(e,t,n){';

    expect(extractSlugs(scriptText)).toEqual(["acid-rain", "fire", "water"]);
  });

  it("extracts unique recipe pairs from item parent HTML", () => {
    const parentsHtml = `
      <li class="pair">
        <img src="/icons/13.svg" alt="">
        <img src="/icons/40.svg" alt="">
      </li>
      <li class="pair">
        <img src="/icons/13.svg" alt="">
        <img src="/icons/40.svg" alt="">
      </li>
      <li class="pair">
        <img src="/icons/2.svg" alt="">
        <img src="/icons/2.svg" alt="">
      </li>
      <li class="pair">
        <img src="/icons/157.svg" alt="">
        <img src="/icons/1_41.svg" alt="">
      </li>
    `;

    expect(extractRecipePairs(parentsHtml)).toEqual([
      ["13", "40"],
      ["2", "2"],
      ["157", "1_41"],
    ]);
  });

  it("builds data in the app's compact shape", () => {
    const items = [
      { id: "1", name: "water", parents: "" },
      {
        id: "2",
        name: "puddle",
        parents: '<li class="pair"><img src="/icons/1.svg"><img src="/icons/1.svg"></li>',
      },
      {
        id: "3",
        name: "mud",
        parents: '<li class="pair"><img src="/icons/1.svg"><img src="/icons/2.svg"></li>',
      },
    ];

    expect(buildData(items, { 1: { prime: true } })).toEqual({
      1: { prime: true, n: "water", c: ["2", "3"] },
      2: { n: "puddle", p: [["1", "1"]], c: ["3"] },
      3: { n: "mud", p: [["1", "2"]] },
    });
  });
});
