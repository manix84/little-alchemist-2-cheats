import { describe, expect, it } from "vitest";
import { buildData, extractRecipePairs, extractScriptUrl, extractSlugs, getDlcKey, HINTS_ORIGIN } from "./refresh-data.mjs";

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
      { id: "1", name: "water", slug: "water", parents: "" },
      {
        id: "2",
        name: "puddle",
        slug: "puddle",
        parents: '<li class="pair"><img src="/icons/1.svg"><img src="/icons/1.svg"></li>',
      },
      {
        id: "3",
        name: "mud",
        slug: "mud",
        parents: '<li class="pair"><img src="/icons/1.svg"><img src="/icons/2.svg"></li>',
      },
    ];

    expect(buildData(items, { 1: { prime: true } })).toEqual({
      1: { prime: true, n: "water", s: "water", c: ["2", "3"] },
      2: { n: "puddle", s: "puddle", p: [["1", "1"]], c: ["3"] },
      3: { n: "mud", s: "mud", p: [["1", "2"]] },
    });
  });

  it("marks Myths and Monsters DLC items", () => {
    expect(
      getDlcKey({
        dlcInfo:
          '<div class="content-pack-info"><a href="/content-pack/myths-and-monsters">Myths and Monsters</a></div>',
      }),
    ).toBe("myths-and-monsters");
  });

  it("includes the DLC marker in generated data", () => {
    expect(
      buildData(
        [
          {
            id: "1_41",
            name: "immortality",
            slug: "immortality",
            dlcInfo: '<a href="/content-pack/myths-and-monsters">Myths and Monsters</a>',
            parents: "",
          },
        ],
        {},
      ),
    ).toEqual({
      "1_41": { n: "immortality", s: "immortality", d: "myths-and-monsters" },
    });
  });
});
