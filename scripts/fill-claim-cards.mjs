#!/usr/bin/env node
/**
 * Fills a page's `claim_card`s from the sustainability card of the same title,
 * copying the icon, body, footnotes and proof list.
 *
 *   npm run storyblok:fill-claims -- <spaceId> [slug…] [--publish] [--dry-run]
 *
 * Why this exists next to `storyblok:merge-claims`: that script adds cards a
 * story is missing and, by design, never touches a card that is already there.
 * So the claims it appended to wipes, hygiene and beauty arrived as bare titles,
 * and nothing could fill them in afterwards. This does that one job.
 *
 * The sustainability page is the reference rather than the mock, because the
 * mock holds no assets — the claim marks live only in Storyblok, so the icon can
 * only come from the live story. Copy comes from there too, so a claim reads
 * identically wherever it is stated.
 *
 * Only empty fields are written. A card whose body an editor has already
 * rewritten keeps it, and a second run is a no-op. Nothing is deleted.
 *
 * Writes drafts, as the merge script does. Pass `--publish` to publish in the
 * same request, `--dry-run` to see what would change and write nothing.
 *
 * Auth reuses the `storyblok login` session in `~/.storyblok/credentials.json`.
 * The token is read at run time and sent only to the Storyblok Management API.
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

/** The page whose cards are the reference for every other page's. */
const REFERENCE_SLUG = "sustainability";

/** Copied when the target card leaves them empty. `title` is handled separately. */
const FIELDS = ["icon", "body", "proof_label", "proof"];

/**
 * Titles that shipped before the wording settled, and what they should say.
 *
 * The chlorine claim first went out with a "/ TCF fibers" tail the sustainability
 * card does not carry, which also stopped it matching. Correcting the title is
 * the one case where a non-empty field is overwritten, and it is deliberate.
 */
const RENAMES = {
  "totally chlorine-free fibers / TCF fibers": "totally chlorine-free fibers",
};

/* ------------------------------------------------------------------ *
 * The fill itself — pure, so it can be exercised without a space
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
 * Empty in the sense the editor means it: unset, blank, or an asset field with
 * no file behind it. Storyblok leaves `{ id: null, filename: null, … }` in place
 * of an unset asset, so a truthiness check alone would call that filled.
 */
function empty(value) {
  if (value === undefined || value === null || value === "") return true;
  if (typeof value === "object" && !Array.isArray(value)) return !value.filename;
  return false;
}

/**
 * Fills `targetContent`'s claim cards from `reference`, in place.
 *
 * Cards are paired by title, not by `_uid`: the same claim is a different blok
 * on every page it appears on, and the title is what the pages share.
 */
export function fillClaimCards(targetContent, reference) {
  const source = new Map(collect(reference, "claim_card").map((card) => [card.title, card]));
  const filled = [];
  const unmatched = [];

  for (const card of collect(targetContent, "claim_card")) {
    const changed = [];

    if (RENAMES[card.title]) {
      card.title = RENAMES[card.title];
      changed.push("title");
    }

    const match = source.get(card.title);

    if (!match) {
      unmatched.push(card.title);
      continue;
    }

    for (const field of FIELDS) {
      if (empty(card[field]) && !empty(match[field])) {
        card[field] = structuredClone(match[field]);
        changed.push(field);
      }
    }

    if (changed.length > 0) filled.push({ title: card.title, fields: changed });
  }

  return { filled, unmatched };
}

/* ------------------------------------------------------------------ *
 * CLI
 * ------------------------------------------------------------------ */

async function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const publish = argv.includes("--publish");
  const positional = argv.filter((arg) => !arg.startsWith("--"));

  const spaceId = positional[0] ?? process.env.STORYBLOK_SPACE_ID;
  const slugs = positional.slice(1).filter(Boolean);

  if (!spaceId || !/^\d+$/.test(spaceId)) {
    console.error(
      "Missing space id.\n\n  npm run storyblok:fill-claims -- 123456 wipes hygiene beauty\n",
    );
    process.exit(1);
  }

  if (slugs.length === 0) {
    console.error(
      "Name at least one story.\n\n" +
        "  npm run storyblok:fill-claims -- 123456 wipes hygiene beauty\n",
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

  /** The full story for a slug; the list endpoint omits content. */
  async function fetchStory(slug) {
    const found = await api(`/stories?with_slug=${encodeURIComponent(slug)}`);
    const match = found?.stories?.find((candidate) => candidate.slug === slug);
    if (!match) throw new Error(`no story "${slug}" in the space`);
    return (await api(`/stories/${match.id}`)).story;
  }

  const reference = (await fetchStory(REFERENCE_SLUG)).content;
  const claims = collect(reference, "claim_card");
  console.log(`reference: ${REFERENCE_SLUG} — ${claims.length} claim(s)\n`);

  let failures = 0;

  for (const slug of slugs) {
    try {
      const story = await fetchStory(slug);
      const { filled, unmatched } = fillClaimCards(story.content, reference);

      for (const title of unmatched) {
        console.warn(`WARNING  ${slug} — no ${REFERENCE_SLUG} claim titled "${title}"; skipped`);
      }

      if (filled.length === 0) {
        console.log(`no change  ${slug} — every card already complete`);
        continue;
      }

      const report = (verb) => {
        console.log(`${verb}  ${slug} — ${filled.length} card(s):`);
        for (const card of filled) {
          console.log(`             ${card.title} → ${card.fields.join(", ")}`);
        }
      };

      if (dryRun) {
        report("would fill");
        continue;
      }

      await api(`/stories/${story.id}`, {
        method: "PUT",
        body: JSON.stringify({
          story: { name: story.name, slug: story.slug, content: story.content },
          ...(publish ? { publish: 1 } : {}),
        }),
      });

      report("filled    ");
    } catch (error) {
      failures += 1;
      console.error(`FAILED   ${slug}\n         ${error.message}`);
    }
  }

  if (failures > 0) {
    console.error(`\n${failures} of ${slugs.length} stories failed.`);
    process.exit(1);
  }

  console.log(
    dryRun
      ? "\nDry run — nothing was written."
      : publish
        ? "\nWritten and published."
        : "\nSaved as drafts. Publish in Storyblok to put them live.",
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
