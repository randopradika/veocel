import assert from "node:assert/strict";
import { test } from "node:test";

import { formatDate, isoDate } from "../lib/date.ts";
import { headlineLines } from "../lib/headlineLines.ts";
import { focusPosition, imageUrl, naturalSize } from "../lib/image.ts";

const ASSET = "https://a.storyblok.com/f/289202211280266/1920x1080/abc123/hero.jpg";

test("formatDate reads the date off the string, so no timezone can shift it", () => {
  assert.equal(formatDate("2026-09-08"), "08/09/2026");
  assert.equal(formatDate("2026-09-08 00:00", "."), "08.09.2026");
  assert.equal(formatDate("soon"), "soon");
  assert.equal(formatDate(undefined), "");
  assert.equal(isoDate("2026-09-08 00:00"), "2026-09-08");
  assert.equal(isoDate("soon"), undefined);
});

test("headlineLines balances two lines and keeps an editor's own break", () => {
  assert.deepEqual(headlineLines("explore VEOCEL™ fibers"), ["explore", "VEOCEL™ fibers"]);
  assert.deepEqual(headlineLines("first line\nsecond line"), ["first line", "second line"]);
  assert.deepEqual(headlineLines("  wipes  "), ["wipes"]);
});

test("imageUrl asks Storyblok to resize and leaves other files alone", () => {
  assert.equal(imageUrl(ASSET, { width: 800 }), `${ASSET}/m/800x0/filters:quality(80)`);
  assert.equal(
    imageUrl(ASSET, { width: 400, height: 300 }),
    `${ASSET}/m/400x300/smart/filters:quality(80)`,
  );
  assert.equal(imageUrl("/brand/veocel-logo.png", { width: 800 }), "/brand/veocel-logo.png");
  const svg = "https://a.storyblok.com/f/1/100x100/abc/mark.svg";
  assert.equal(imageUrl(svg, { width: 800 }), svg);
  assert.equal(imageUrl(""), "");
});

test("focusPosition turns Storyblok's focal box into an object-position", () => {
  assert.deepEqual(naturalSize(ASSET), { width: 1920, height: 1080 });
  assert.equal(focusPosition({ filename: ASSET, focus: "959x539:961x541" }), "50.0% 50.0%");
  assert.equal(focusPosition({ filename: ASSET, focus: "0x0:0x0" }), "0.0% 0.0%");
  assert.equal(focusPosition({ filename: ASSET }), undefined);
});
