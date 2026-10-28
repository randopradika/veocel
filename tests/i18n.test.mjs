import assert from "node:assert/strict";
import { test } from "node:test";

import { localePath, previewPath, slugSegments, splitLocale } from "../lib/i18n.ts";

const LOCALES = ["en", "de"];

test("previewPath opens a bare Storyblok slug in the default locale", () => {
  assert.equal(previewPath("fiber-types", LOCALES), "/en/fiber-types");
  assert.equal(previewPath("itsinourhands/", LOCALES), "/en/itsinourhands");
  assert.equal(previewPath("itsinourhands/an-article", LOCALES), "/en/itsinourhands/an-article");
});

test("previewPath keeps a leading locale and sends home to the locale root", () => {
  assert.equal(previewPath("de/fiber-types", LOCALES), "/de/fiber-types");
  assert.equal(previewPath("home", LOCALES), "/en");
  assert.equal(previewPath("de/home", LOCALES), "/de");
  assert.equal(previewPath("", LOCALES), "/en");
});

test("previewPath never leads off the site", () => {
  for (const slug of [
    "//evil.example",
    "\\evil.example",
    "/\\evil.example",
    "\\\\evil.example/x",
    "https://evil.example",
    "../../etc",
  ]) {
    const path = previewPath(slug, LOCALES);
    assert.match(path, /^\/en(\/|$)/, slug);
    assert.ok(!path.includes("\\"), slug);
  }
  assert.equal(previewPath("fiber-types?x=1", LOCALES), "/en/fiber-types%3Fx%3D1");
});

test("slugSegments splits a slug and refuses dot segments", () => {
  assert.deepEqual(slugSegments("itsinourhands/"), ["itsinourhands"]);
  assert.deepEqual(slugSegments("/a//b/"), ["a", "b"]);
  assert.deepEqual(slugSegments(""), []);
  assert.equal(slugSegments("stories/../config"), null);
  assert.equal(slugSegments("./home"), null);
});

test("localePath and splitLocale agree on the locale prefix", () => {
  assert.equal(localePath("de", "/beauty"), "/de/beauty");
  assert.equal(localePath("en", ""), "/en");
  assert.deepEqual(splitLocale("/de/beauty", LOCALES), { locale: "de", path: "/beauty" });
  assert.deepEqual(splitLocale("/beauty", LOCALES), { locale: "en", path: "/beauty" });
});
