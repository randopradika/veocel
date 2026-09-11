#!/usr/bin/env node
/**
 * Converts a claim mark to the house format and attaches it to one `claim_card`.
 *
 *   npm run storyblok:swap-claim-icon -- <spaceId> <image> "<card title>" [--slug=sustainability] [--publish] [--dry-run]
 *
 * The marks arrive from the client as artwork on opaque white — TIFF, usually,
 * at print resolution. What the cards want is a 260x260 PNG with the white
 * knocked out and the ink matching its thirteen neighbours, and getting there by
 * hand is fiddly enough to be worth a script: see `HANDOFF.md` under "Images"
 * for the two `sharp` traps that make a careless version look almost right.
 *
 * Why this exists next to `storyblok:fill-claims`: that script copies an icon a
 * card already has to the same claim on another page. This one puts a *new* icon
 * into the space in the first place. Neither can do the other's job.
 *
 * Only the named card is touched, and only its `icon`. Copy, proof list and
 * every other card in the story are left exactly as they are.
 *
 * Writes drafts, as the other claim scripts do. Pass `--publish` to publish in
 * the same request, `--dry-run` to convert and report but write nothing — the
 * converted PNG is saved next to the source either way, so it can be eyeballed
 * before it goes near the space.
 *
 * Auth reuses the `storyblok login` session in `~/.storyblok/credentials.json`.
 * The token is read at run time and sent only to the Storyblok Management API.
 */
import { readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, extname, join } from "node:path";
import { pathToFileURL } from "node:url";

import sharp from "sharp";

/** Region → Management API host. Values taken from the CLI's own mapping. */
const MANAGEMENT_HOSTS = {
  eu: "mapi.storyblok.com",
  us: "api-us.storyblok.com",
  cn: "app.storyblokchina.cn",
  ca: "api-ca.storyblok.com",
  ap: "api-ap.storyblok.com",
};

/** The page whose claim cards carry the marks. */
const DEFAULT_SLUG = "sustainability";

/** Frame, and the artwork inside it — ~11px of air, measured off the marks in the space. */
const FRAME = 260;
const CONTENT = 238;

/**
 * The claim-mark ink.
 *
 * The weighted centroid of 44,748 opaque ink pixels across nine of the existing
 * marks. No single mark is the reference: they each dither a point or two either
 * side of this, so matching any one of them would inherit its dither.
 */
const INK = [17, 121, 182];

/* ------------------------------------------------------------------ *
 * The conversion — pure, so it can be exercised without a space
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
 * Artwork on white → a {@link FRAME}-square PNG in the family ink.
 *
 * Knocking the white out by luminance would leave every antialiased stroke edge
 * as translucent grey. This un-composites instead: the drawing is one ink over
 * white, so from `c = ink*a + 255*(1-a)` the coverage falls out as
 * `(255-c)/(255-ink)`, and the artwork reduces to a single alpha channel.
 *
 * The colour painted back is not the colour solved against. Marks arrive in
 * whatever blue their author drew in, and one card off-hue from its neighbours
 * reads as a mistake — so alpha is solved against the source's own ink and
 * {@link INK} is laid in afterwards, which makes the recolour exact rather than
 * a hue nudge.
 *
 * Geometry runs on the coverage channel alone. Resizing RGBA lets the resampler
 * blend the colour as well as the coverage, which walks a flat ink off its value
 * by ~20/255 at the thin end of a 9x downscale.
 */
export async function claimMark(source) {
  // A source that already carries alpha is composited down first, so one path
  // handles both and the arithmetic below always has a known ground.
  const { data, info } = await sharp(source)
    .flatten({ background: "#ffffff" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;

  // The ink is whatever non-white colour the drawing spends most of itself in.
  const tally = new Map();
  for (let i = 0; i < W * H; i++) {
    const o = i * C;
    if (data[o] > 250 && data[o + 1] > 250 && data[o + 2] > 250) continue;
    const key = (data[o] << 16) | (data[o + 1] << 8) | data[o + 2];
    tally.set(key, (tally.get(key) ?? 0) + 1);
  }
  if (tally.size === 0) throw new Error("the image is blank — nothing but white");

  const [inkKey, inkCount] = [...tally].sort((a, b) => b[1] - a[1])[0];
  const ink = [(inkKey >> 16) & 255, (inkKey >> 8) & 255, inkKey & 255];
  const inked = [...tally.values()].reduce((a, b) => a + b, 0);

  // Solve on the channel that travels furthest from white; it has the most precision.
  const spread = ink.map((v) => 255 - v);
  const channel = spread.indexOf(Math.max(...spread));
  const denominator = spread[channel];

  const coverage = Buffer.alloc(W * H);
  for (let i = 0; i < W * H; i++) {
    coverage[i] = Math.min(255, Math.round(((255 - data[i * C + channel]) / denominator) * 255));
  }

  // Trim against black: on a coverage map, 0 is exactly the empty margin.
  const pad = (FRAME - CONTENT) / 2;
  const framed = await sharp(coverage, { raw: { width: W, height: H, channels: 1 } })
    .trim({ background: "#000000", threshold: 1 })
    .resize(CONTENT, CONTENT, { fit: "contain", background: "#000000" })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: "#000000" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  if (framed.info.width !== FRAME || framed.info.height !== FRAME) {
    throw new Error(`framed ${framed.info.width}x${framed.info.height}, expected ${FRAME} square`);
  }

  // A hex `background` puts the pipeline in sRGB, so this comes back
  // three-channel however it went in. Stride by what arrived, not what was sent.
  const stride = framed.info.channels;
  const rgba = Buffer.alloc(FRAME * FRAME * 4);
  for (let i = 0; i < FRAME * FRAME; i++) {
    const o = i * 4;
    rgba[o] = INK[0];
    rgba[o + 1] = INK[1];
    rgba[o + 2] = INK[2];
    rgba[o + 3] = framed.data[i * stride];
  }

  const png = await sharp(rgba, { raw: { width: FRAME, height: FRAME, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

  return { png, ink, share: inkCount / inked };
}

/* ------------------------------------------------------------------ *
 * CLI
 * ------------------------------------------------------------------ */

const hex = (colour) => "#" + colour.map((v) => v.toString(16).padStart(2, "0")).join("");

async function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const publish = argv.includes("--publish");
  const slugFlag = argv.find((arg) => arg.startsWith("--slug="));
  const slug = slugFlag ? slugFlag.slice("--slug=".length) : DEFAULT_SLUG;
  const positional = argv.filter((arg) => !arg.startsWith("--"));

  const [spaceId, imagePath, cardTitle] = positional;

  if (!spaceId || !/^\d+$/.test(spaceId) || !imagePath || !cardTitle) {
    console.error(
      "Name a space, an image and the card it belongs to.\n\n" +
        '  npm run storyblok:swap-claim-icon -- 123456 ./mark.tif "biodegradable fibers"\n',
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
  async function fetchStory(name) {
    const found = await api(`/stories?with_slug=${encodeURIComponent(name)}`);
    const match = found?.stories?.find((candidate) => candidate.slug === name);
    if (!match) throw new Error(`no story "${name}" in the space`);
    return (await api(`/stories/${match.id}`)).story;
  }

  const story = await fetchStory(slug);
  const cards = collect(story.content, "claim_card");
  const card = cards.find((item) => item.title === cardTitle);

  if (!card) {
    console.error(
      `No claim card titled "${cardTitle}" in ${slug}. It has:\n` +
        cards.map((item) => `  ${item.title}`).join("\n"),
    );
    process.exit(1);
  }

  const { png, ink, share } = await claimMark(await readFile(imagePath));
  const filename = `${slug}-claim-${basename(imagePath, extname(imagePath)).toLowerCase()}.png`;

  // Kept on disk either way: on a dry run it is the thing to look at before
  // committing to it, and on a real run it is a record of what was uploaded.
  const localCopy = join(dirname(imagePath), filename);
  await writeFile(localCopy, png);

  console.log(`card     ${cardTitle} (${slug})`);
  console.log(`source   ${hex(ink)} — ${(share * 100).toFixed(1)}% of the drawing`);
  console.log(`painted  ${hex(INK)} — the family ink`);
  console.log(`written  ${localCopy} — ${FRAME}x${FRAME}, ${png.length} bytes`);
  console.log(`was      ${card.icon?.filename ?? "(no icon)"}`);

  if (dryRun) {
    console.log("\nDry run — converted only. Nothing uploaded, nothing written to the space.");
    return;
  }

  // Storyblok takes assets in three steps: a signed S3 slot, the bytes, then a
  // GET to say the upload finished. A POST to `finish_upload` 404s after the
  // file has already landed, which reads as a failure when it is not one.
  const signed = await api("/assets", {
    method: "POST",
    body: JSON.stringify({ filename, size: `${FRAME}x${FRAME}`, validate_upload: 1 }),
  });

  const form = new FormData();
  for (const [key, value] of Object.entries(signed.fields)) form.append(key, value);
  form.append("file", new Blob([png], { type: "image/png" }), filename);

  const upload = await fetch(signed.post_url, { method: "POST", body: form });
  if (!upload.ok) throw new Error(`S3 upload → ${upload.status}: ${await upload.text()}`);

  const finished = await api(`/assets/${signed.id}/finish_upload`);
  const uploaded = finished?.filename ?? signed.pretty_url ?? signed.public_url;

  // The whole asset object is replaced. Writing `filename` alone would leave
  // `id` pointing at the mark that was there before.
  card.icon = {
    id: signed.id,
    alt: card.icon?.alt ?? "",
    name: card.icon?.name ?? "",
    focus: card.icon?.focus ?? null,
    title: card.icon?.title ?? cardTitle,
    filename: uploaded,
    copyright: card.icon?.copyright ?? "",
    fieldtype: "asset",
    meta_data: { size: `${FRAME}x${FRAME}` },
  };

  await api(`/stories/${story.id}`, {
    method: "PUT",
    body: JSON.stringify({
      story: { name: story.name, slug: story.slug, content: story.content },
      ...(publish ? { publish: 1 } : {}),
    }),
  });

  console.log(`now      ${uploaded}`);
  console.log(
    publish ? "\nWritten and published." : "\nSaved as a draft. Publish in Storyblok to put it live.",
  );
  console.log("The mark it replaced stays in the asset library — delete it there if it is spent.");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
