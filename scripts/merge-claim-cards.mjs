#!/usr/bin/env node
/**
 * Adds the claim cards that `lib/mock/pages.ts` has and a live Storyblok story
 * does not, leaving everything else in that story untouched.
 *
 *   npm run storyblok:merge-claims -- <spaceId> [slug…] [--add-sections] [--dry-run]
 *
 * Why this exists next to `storyblok:seed`: the seed builds a story *from* the
 * mock and upserts the whole thing, so it clears every field the mock does not
 * set. The sustainability mock carries no assets at all, so seeding it to add
 * ten cards would blank twenty images along the way — the hero photograph, the
 * claim icons, and all thirteen certificate logos. This reads the live story
 * instead and appends only the `claim_card` bloks whose `_uid` is missing, so
 * nothing an editor has attached is disturbed.
 *
 * Idempotent in the strict sense: matching is by `_uid`, so a second run adds
 * nothing. Cards already in the story are skipped, never rewritten — change
 * existing copy in the editor, not here, or the next run would quietly revert
 * it.
 *
 * `--add-sections` widens that to whole grids: a `claim_grid` the mock has at
 * the top level of `body` and the live story lacks is appended to the end of
 * the page. That is how the "claims" grids reached the wipes, hygiene and
 * beauty stories, which had no claim section at all to merge cards into. It
 * stays opt-in because a missing grid usually means the page structure has
 * diverged, which is a call for a human rather than a default. A *nested* grid
 * is still only reported: there is no obvious place to put one.
 *
 * New cards arrive without an `icon`, because the mock has none to give. The
 * script prints what it added so those can be attached in the Visual Editor.
 *
 * Writes drafts. Nothing is published, so the public site is unchanged until
 * someone publishes the story.
 *
 * Auth reuses the `storyblok login` session in `~/.storyblok/credentials.json`,
 * exactly as the seed does. The token is read at run time and sent only to the
 * Storyblok Management API.
 */
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

/** Region → Management API host. Values taken from the CLI's own mapping. */
const MANAGEMENT_HOSTS = {
  eu: "mapi.storyblok.com",
  us: "api-us.storyblok.com",
  cn: "app.storyblokchina.cn",
  ca: "api-ca.storyblok.com",
  ap: "api-ap.storyblok.com",
};

/* ------------------------------------------------------------------ *
 * The merge itself — pure, so it can be exercised without a space
 * ------------------------------------------------------------------ */

/** Every blok of a given component anywhere in a story's content tree. */
export function collect(value, component, found = []) {
  if (Array.isArray(value)) {
    for (const item of value) collect(item, component, found);
  } else if (value && typeof value === "object") {
    if (value.component === component) found.push(value);
    for (const item of Object.values(value)) collect(item, component, found);
  }
  return found;
}

/**
 * Appends the mock's missing `claim_card`s onto the live content, in place.
 *
 * Grids are paired by their own `_uid` rather than by position, so reordering
 * the page in the editor cannot drop cards into the wrong section. A grid the
 * live story does not have is reported rather than created: that means the page
 * structure has diverged, which is a call for a human.
 */
export function mergeClaimCards(liveContent, mockContent, { addSections = false } = {}) {
  const liveGrids = collect(liveContent, "claim_grid");
  const added = [];
  const addedGrids = [];
  const missingGrids = [];

  for (const mockGrid of collect(mockContent, "claim_grid")) {
    const liveGrid = liveGrids.find((grid) => grid._uid === mockGrid._uid);

    if (!liveGrid) {
      // A grid the mock keeps at the top level of `body` is a whole section the
      // live page has yet to gain, and appending it is safe: it lands last and
      // disturbs nothing already there. A nested grid has no such obvious home,
      // so it stays a report for a human however the flag is set.
      if (addSections && (mockContent.body ?? []).includes(mockGrid)) {
        liveContent.body ??= [];
        liveContent.body.push(structuredClone(mockGrid));
        addedGrids.push({
          uid: mockGrid._uid,
          heading: mockGrid.heading,
          cards: (mockGrid.items ?? []).length,
        });
        continue;
      }

      missingGrids.push(mockGrid._uid);
      continue;
    }

    liveGrid.items ??= [];
    const present = new Set(liveGrid.items.map((item) => item._uid));

    for (const card of mockGrid.items ?? []) {
      if (present.has(card._uid)) continue;
      liveGrid.items.push(structuredClone(card));
      added.push({ grid: liveGrid._uid, uid: card._uid, title: card.title });
    }
  }

  return { added, addedGrids, missingGrids };
}

/* ------------------------------------------------------------------ *
 * CLI
 * ------------------------------------------------------------------ */

async function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const addSections = argv.includes("--add-sections");
  const positional = argv.filter((arg) => !arg.startsWith("--"));

  const spaceId = positional[0] ?? process.env.STORYBLOK_SPACE_ID;
  const only = positional.slice(1).filter(Boolean);

  if (!spaceId || !/^\d+$/.test(spaceId)) {
    console.error(
      "Missing space id.\n\n  npm run storyblok:merge-claims -- 123456 sustainability\n",
    );
    process.exit(1);
  }

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

  const host = MANAGEMENT_HOSTS[session.region ?? "eu"];

  if (!host) {
    console.error(`Unknown Storyblok region "${session.region}".`);
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

  const { mockStories } = await import("../lib/mock/pages.ts");

  // Only pages that actually carry a claim grid; the rest have nothing to merge.
  const candidates = Object.values(mockStories).filter(
    (story) => collect(story.content, "claim_grid").length > 0,
  );
  const targets = only.length === 0 ? candidates : candidates.filter((s) => only.includes(s.slug));

  if (targets.length === 0) {
    console.error(
      `No mock story with a claim grid matches ${only.join(", ") || "(none given)"}.\n\n` +
        `Available: ${candidates.map((s) => s.slug).join(", ")}\n`,
    );
    process.exit(1);
  }

  let failures = 0;

  for (const target of targets) {
    try {
      const found = await api(`/stories?with_slug=${encodeURIComponent(target.slug)}`);
      const match = found?.stories?.find((candidate) => candidate.slug === target.slug);

      if (!match) {
        console.error(`SKIPPED  ${target.slug} — no such story in the space`);
        failures += 1;
        continue;
      }

      // The list endpoint omits content; the full story is a second request.
      const { story } = await api(`/stories/${match.id}`);
      const { added, addedGrids, missingGrids } = mergeClaimCards(story.content, target.content, {
        addSections,
      });

      for (const uid of missingGrids) {
        console.warn(
          `WARNING  ${target.slug} — no claim_grid "${uid}" live; skipped` +
            (addSections ? " (nested, so not appendable)" : " (--add-sections appends it)"),
        );
      }

      if (added.length === 0 && addedGrids.length === 0) {
        console.log(`no change  ${target.slug} — every card already present`);
        continue;
      }

      // Reported only once the write lands, so a failed PUT cannot read as done.
      const report = (verb) => {
        for (const grid of addedGrids) {
          console.log(`${verb}  ${target.slug} — section "${grid.heading}" (${grid.cards} cards)`);
        }
        if (added.length > 0) {
          console.log(`${verb}  ${target.slug} — ${added.length} card(s):`);
          for (const card of added) console.log(`             ${card.uid}  ${card.title}`);
        }
      };

      if (dryRun) {
        report("would add");
        continue;
      }

      await api(`/stories/${story.id}`, {
        method: "PUT",
        body: JSON.stringify({
          story: { name: story.name, slug: story.slug, content: story.content },
        }),
      });

      report("added    ");
    } catch (error) {
      failures += 1;
      console.error(`FAILED   ${target.slug}\n         ${error.message}`);
    }
  }

  if (failures > 0) {
    console.error(`\n${failures} of ${targets.length} stories failed.`);
    process.exit(1);
  }

  console.log(
    dryRun
      ? "\nDry run — nothing was written."
      : "\nSaved as drafts. Attach icons to the new cards, then publish in Storyblok.",
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
