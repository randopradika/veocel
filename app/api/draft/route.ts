import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { getLocales, previewPath } from "@/lib/i18n";

/**
 * Entry point for the Storyblok Visual Editor.
 *
 * Set the space's preview URL to:
 *   https://<host>/api/draft?secret=<STORYBLOK_PREVIEW_SECRET>&slug=
 *
 * Storyblok appends the story's slug, so the editor lands on the right page with
 * draft mode enabled — which is what makes `getStory()` request `version=draft`
 * and `StoryView` mount the live-preview bridge. The slug has no language in it,
 * so `previewPath` puts the page under one (`fiber-types` → `/en/fiber-types`);
 * left bare it reached the `[lang]` segment as a language and 404ed.
 *
 * Storyblok's own `_storyblok…` parameters travel on with the redirect: the
 * bridge reads the story id it is editing off the page's URL. Should they come
 * glued to the slug (`slug=fiber-types?_storyblok=…`) they are split off it.
 *
 * Draft mode exposes unpublished content, so the secret is required. Without
 * `STORYBLOK_PREVIEW_SECRET` configured the route refuses outright rather than
 * defaulting to open.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const expected = process.env.STORYBLOK_PREVIEW_SECRET;
  const provided = params.get("secret");

  if (!expected || provided !== expected) {
    return new Response("Invalid preview secret", { status: 401 });
  }

  const raw = params.get("slug") ?? "";
  const cut = raw.indexOf("?");
  const slug = cut < 0 ? raw : raw.slice(0, cut);

  const carried = new URLSearchParams();
  for (const [key, value] of [...new URLSearchParams(cut < 0 ? "" : raw.slice(cut + 1)), ...params]) {
    if (key.startsWith("_storyblok")) carried.append(key, value);
  }

  // Only ever a path on this site: `previewPath` cannot produce another host.
  const locales = (await getLocales()).map((locale) => locale.code);
  const path = previewPath(slug, locales);

  const draft = await draftMode();
  draft.enable();

  const query = carried.toString();
  redirect(query ? `${path}?${query}` : path);
}
