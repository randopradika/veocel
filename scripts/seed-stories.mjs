#!/usr/bin/env node
/**
 * Seeds every page in `lib/mock/pages.ts`, plus the `config` story, into a
 * Storyblok space using the local mock content as the source.
 *
 *   npm run storyblok:seed -- <spaceId> [path…] [--publish]
 *
 * Without this, the same ~60 fields — including 20 nested bloks on the home page
 * alone — have to be typed into the Visual Editor by hand.
 *
 * Name one or more paths to seed only those. Do that once editors have started
 * working in Storyblok: an upsert replaces the whole story, so seeding a page
 * that has since had assets attached in the editor discards them. Seeding only
 * the new page leaves the rest alone. A path ending in "/" takes a whole folder
 * with its start page — `itsinourhands/` is the hub and every article in it.
 *
 * Nested paths go into folders, created on first use, and a mock story marked
 * `is_startpage` becomes its folder's start page. A new folder is set to create
 * the content type of the mock stories inside it, so an editor adding a story
 * there gets that type by default.
 *
 * Auth reuses the session `storyblok login` already stored in
 * `~/.storyblok/credentials.json`. The token is read at run time and sent only to
 * the Storyblok Management API; it is never logged or copied elsewhere.
 *
 * Idempotent in the sense that a story at the same path is updated rather than
 * duplicated — but the update overwrites, it does not merge.
 *
 * Stories are created as DRAFTS unless `--publish` is passed — review in the
 * Visual Editor first. The public site 404s until a story is published, because
 * published requests only ever see published content. Stories go out in the
 * order the mock lists them, which is what orders same-day articles on a hub.
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

const args = process.argv.slice(3).filter(Boolean);
const publish = args.includes("--publish");

/** Paths named on the command line. Empty means every story. */
const only = args.filter((arg) => !arg.startsWith("--"));

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

// Every mock story, keyed by its path, so adding one to `lib/mock/pages.ts` is
// enough to seed it.
const everything = [
  ...Object.entries(mockStories).map(([path, { name, content, is_startpage }]) => ({
    path,
    name,
    content,
    startpage: Boolean(is_startpage),
  })),
  { path: "config", name: "Site configuration", content: mockConfig, startpage: false },
];

function wanted(path) {
  if (only.length === 0) return true;
  return only.some((name) =>
    name.endsWith("/") ? path === name.slice(0, -1) || path.startsWith(name) : path === name,
  );
}

const stories = everything.filter((story) => wanted(story.path));

if (stories.length === 0) {
  console.error(
    `No mock story matches ${only.join(", ")}.\n\nAvailable: ${everything
      .map((s) => s.path)
      .join(", ")}\n`,
  );
  process.exit(1);
}

/* ------------------------------------------------------------------ *
 * Folders
 * ------------------------------------------------------------------ */

/** "a/b/c" → "a/b"; a root path → "". */
function parentOf(path) {
  return path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
}

function lastSegment(path) {
  return path.slice(path.lastIndexOf("/") + 1);
}

/** Folder ids by path, looked up or created once per run. The root is 0. */
const folderIds = new Map([["", 0]]);

async function folderId(path) {
  if (folderIds.has(path)) return folderIds.get(path);

  const parentId = await folderId(parentOf(path));
  const listed = await api(`/stories?folder_only=1&with_slug=${encodeURIComponent(path)}`);
  let folder = listed?.stories?.find(
    (candidate) => candidate.is_folder && candidate.full_slug.replace(/\/+$/, "") === path,
  );

  if (!folder) {
    const child = everything.find((story) => !story.startpage && parentOf(story.path) === path);
    const created = await api("/stories", {
      method: "POST",
      body: JSON.stringify({
        story: {
          name: lastSegment(path),
          slug: lastSegment(path),
          is_folder: true,
          parent_id: parentId,
          ...(child ? { default_root: child.content.component } : {}),
        },
      }),
    });
    folder = created.story;
    console.log(`created  ${path}/ (folder)`);
  }

  folderIds.set(path, folder.id);
  return folder.id;
}

/** The story already at this path, if any. */
async function existingStory(story, parentId) {
  if (story.startpage) {
    const listed = await api(`/stories?with_parent=${parentId}&per_page=100`);
    return listed?.stories?.find((candidate) => candidate.is_startpage && !candidate.is_folder);
  }

  const listed = await api(`/stories?with_slug=${encodeURIComponent(story.path)}`);
  return listed?.stories?.find(
    (candidate) => !candidate.is_folder && candidate.full_slug === story.path,
  );
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
  const label = `${story.path} (${story.content.component}${story.startpage ? ", start page" : ""})`;

  try {
    // A start page sits inside the folder it stands for; anything else, in its parent.
    const parentId = await folderId(story.startpage ? story.path : parentOf(story.path));
    const match = await existingStory(story, parentId);

    const payload = {
      story: {
        name: story.name,
        slug: lastSegment(story.path),
        content: story.content,
        ...(parentId ? { parent_id: parentId } : {}),
        ...(story.startpage ? { is_startpage: true } : {}),
      },
      ...(publish ? { publish: 1 } : {}),
    };
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
  failures > 0
    ? `\n${failures} of ${stories.length} stories failed.`
    : publish
      ? "\nAll stories seeded and published."
      : "\nAll stories seeded as drafts. Publish them in Storyblok to serve the live site.",
);

/*
 * Internal links are stored as `{ cached_url, linktype: "story" }` without a story
 * UUID, because most of them point at pages that don't exist yet (personal + body
 * care, certifications, and so on). The site resolves them correctly either way —
 * `resolveHref` reads `cached_url`. Re-pick them in the editor once those pages
 * exist so Storyblok can track the references.
 */

process.exit(failures === 0 ? 0 : 1);
