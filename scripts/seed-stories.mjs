#!/usr/bin/env node
/**
 * Seeds every page in `lib/mock/pages.ts`, plus the `config` story, into a
 * Storyblok space using the local mock content as the source.
 *
 *   npm run storyblok:seed -- <spaceId> [slug…]
 *
 * Without this, the same ~60 fields — including 20 nested bloks on the home page
 * alone — have to be typed into the Visual Editor by hand.
 *
 * Name one or more slugs to seed only those. Do that once editors have started
 * working in Storyblok: an upsert replaces the whole story, so seeding a page
 * that has since had assets attached in the editor discards them. Seeding only
 * the new page leaves the rest alone.
 *
 * Auth reuses the session `storyblok login` already stored in
 * `~/.storyblok/credentials.json`. The token is read at run time and sent only to
 * the Storyblok Management API; it is never logged or copied elsewhere.
 *
 * Idempotent in the sense that a story at the same slug is updated rather than
 * duplicated — but the update overwrites, it does not merge.
 *
 * Stories are created as DRAFTS. Nothing is published — review in the Visual
 * Editor first. Note that the public site will 404 until a story is published,
 * because published requests only ever see published content.
 */
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

/** Region → Management API host. Values taken from the CLI's own mapping. */
const MANAGEMENT_HOSTS = {
  eu: "mapi.storyblok.com",
  us: "api-us.storyblok.com",
  cn: "app.storyblokchina.cn",
  ca: "api-ca.storyblok.com",
  ap: "api-ap.storyblok.com",
};

const spaceId = process.argv[2] ?? process.env.STORYBLOK_SPACE_ID;

if (!spaceId || !/^\d+$/.test(spaceId)) {
  console.error("Missing space id.\n\n  npm run storyblok:seed -- 123456\n");
  process.exit(1);
}

/** Slugs named on the command line. Empty means every story. */
const only = process.argv.slice(3).filter(Boolean);

/* ------------------------------------------------------------------ *
 * Credentials
 * ------------------------------------------------------------------ */

const credentialsPath = join(homedir(), ".storyblok", "credentials.json");

let session;
try {
  const credentials = JSON.parse(await readFile(credentialsPath, "utf8"));
  session = Object.values(credentials).find((entry) => entry?.password);
} catch {
  session = undefined;
}

if (!session) {
  console.error(
    `No Storyblok session found at ${credentialsPath}.\n\n  npm run storyblok:login\n`,
  );
  process.exit(1);
}

const region = session.region ?? "eu";
const host = MANAGEMENT_HOSTS[region];

if (!host) {
  console.error(`Unknown Storyblok region "${region}".`);
  process.exit(1);
}

const API = `https://${host}/v1/spaces/${spaceId}`;

async function api(path, init = {}) {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: session.password,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  const text = await response.text();

  if (!response.ok) {
    // Surface the API's own message — its validation errors are specific and useful.
    throw new Error(`${init.method ?? "GET"} ${path} → ${response.status}: ${text}`);
  }

  return text ? JSON.parse(text) : null;
}

/* ------------------------------------------------------------------ *
 * Content, read straight from the mock modules so there is one source of truth
 * ------------------------------------------------------------------ */

const { mockStories } = await import("../lib/mock/pages.ts");
const { mockConfig } = await import("../lib/mock/config.ts");

// Every mock page, so adding one to `lib/mock/pages.ts` is enough to seed it.
const everything = [
  ...Object.values(mockStories).map(({ slug, name, content }) => ({ slug, name, content })),
  { slug: "config", name: "Site configuration", content: mockConfig },
];

const stories = only.length === 0 ? everything : everything.filter((s) => only.includes(s.slug));

if (stories.length === 0) {
  console.error(
    `No mock story matches ${only.join(", ")}.\n\nAvailable: ${everything
      .map((s) => s.slug)
      .join(", ")}\n`,
  );
  process.exit(1);
}

/* ------------------------------------------------------------------ *
 * Upsert
 * ------------------------------------------------------------------ */

/** Counts nested bloks, purely so the output shows how much content moved. */
function countBloks(value) {
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + countBloks(item), 0);
  if (value && typeof value === "object") {
    const self = "component" in value ? 1 : 0;
    return self + Object.values(value).reduce((sum, item) => sum + countBloks(item), 0);
  }
  return 0;
}

let failures = 0;

for (const story of stories) {
  const label = `${story.slug} (${story.content.component})`;

  try {
    const existing = await api(`/stories?with_slug=${encodeURIComponent(story.slug)}`);
    const match = existing?.stories?.find((candidate) => candidate.slug === story.slug);

    const payload = { story: { name: story.name, slug: story.slug, content: story.content } };
    const nested = countBloks(story.content) - 1;

    if (match) {
      await api(`/stories/${match.id}`, { method: "PUT", body: JSON.stringify(payload) });
      console.log(`updated  ${label} — ${nested} nested bloks`);
    } else {
      await api("/stories", { method: "POST", body: JSON.stringify(payload) });
      console.log(`created  ${label} — ${nested} nested bloks`);
    }
  } catch (error) {
    failures += 1;
    console.error(`FAILED   ${label}\n         ${error.message}`);
  }
}

console.log(
  failures === 0
    ? "\nAll stories seeded as drafts. Publish them in Storyblok to serve the live site."
    : `\n${failures} of ${stories.length} stories failed.`,
);

/*
 * Internal links are stored as `{ cached_url, linktype: "story" }` without a story
 * UUID, because most of them point at pages that don't exist yet (personal + body
 * care, certifications, and so on). The site resolves them correctly either way —
 * `resolveHref` reads `cached_url`. Re-pick them in the editor once those pages
 * exist so Storyblok can track the references.
 */

process.exit(failures === 0 ? 0 : 1);
