import { draftMode } from "next/headers";

import { mockConfig } from "./mock/config";
import { mockStories } from "./mock/pages";
import type { ConfigBlok, PageBlok, SbStory } from "./types";

/**
 * Content access layer.
 *
 * Content is read straight from the Storyblok CDN (Content Delivery API v2) with
 * `fetch`, so Next's own cache and tag-based revalidation apply. The
 * `@storyblok/react` SDK is still used in components — for `storyblokEditable`
 * and the Visual Editor bridge — but not for transport.
 *
 * Failure policy, deliberately asymmetric:
 *   - no token configured        -> serve `lib/mock/*` so the design is reviewable
 *   - configured, story missing  -> `null`, i.e. a real 404
 *   - configured, request failed -> throw for pages (never show stale mock copy as
 *     if it were real), but degrade to mock for `getConfig()` so a CDN blip can't
 *     take down the header and footer
 */

const CDN = "https://api.storyblok.com/v2/cdn";

/** Seconds. Storyblok webhooks can call `/api/revalidate` for instant updates. */
const REVALIDATE_SECONDS = 3600;

const CONFIG_SLUG = "config";

function accessToken(): string | undefined {
  return process.env.STORYBLOK_ACCESS_TOKEN || undefined;
}

export function isStoryblokConfigured(): boolean {
  return Boolean(accessToken());
}

/** True inside the Visual Editor / preview session. */
async function isDraft(): Promise<boolean> {
  try {
    const { isEnabled } = await draftMode();
    return isEnabled;
  } catch {
    // `draftMode()` throws outside a request scope (e.g. at build time).
    return false;
  }
}

type FetchResult<T> = { ok: true; data: T } | { ok: false; status: number };

async function cdnGet<T>(
  path: string,
  params: Record<string, string>,
  draft: boolean,
): Promise<FetchResult<T>> {
  const token = accessToken();
  if (!token) return { ok: false, status: 0 };

  const query = new URLSearchParams({
    token,
    version: draft ? "draft" : "published",
    ...params,
  });

  /*
   * Never cache when:
   *   - draft — the Visual Editor expects to see every change immediately
   *   - development — otherwise a publish in Storyblok can take up to an hour to
   *     appear locally, which makes content work unusable. Production keeps the
   *     tagged cache, purged on demand by the publish webhook (/api/revalidate).
   */
  const bypassCache = draft || process.env.NODE_ENV === "development";

  const response = await fetch(`${CDN}/${path}?${query}`, {
    ...(bypassCache
      ? { cache: "no-store" as const }
      : { next: { revalidate: REVALIDATE_SECONDS, tags: ["storyblok"] } }),
  });

  if (!response.ok) return { ok: false, status: response.status };
  return { ok: true, data: (await response.json()) as T };
}

/**
 * Fetches a single story by slug. `"home"` for the root page.
 * Returns `null` when the story genuinely does not exist.
 */
export async function getStory(slug: string): Promise<SbStory<PageBlok> | null> {
  const normalised = slug.replace(/^\/+|\/+$/g, "") || "home";

  if (!isStoryblokConfigured()) {
    return mockStories[normalised] ?? null;
  }

  const draft = await isDraft();
  const result = await cdnGet<{ story: SbStory<PageBlok> }>(
    `stories/${normalised}`,
    { resolve_links: "url" },
    draft,
  );

  if (result.ok) return result.data.story;
  if (result.status === 404) return null;

  throw new Error(
    `Storyblok request for "${normalised}" failed with status ${result.status}`,
  );
}

/** Slugs of every published page, for `generateStaticParams`. */
export async function getAllPageSlugs(): Promise<string[]> {
  if (!isStoryblokConfigured()) {
    return Object.keys(mockStories).filter((slug) => slug !== "home");
  }

  const result = await cdnGet<{ stories: { full_slug: string }[] }>(
    "stories",
    { per_page: "100", excluding_slugs: "config", content_type: "page" },
    false,
  );

  if (!result.ok) return [];
  return result.data.stories
    .map((story) => story.full_slug)
    .filter((slug) => slug && slug !== "home");
}

/**
 * Site-wide chrome (navigation, footer, newsletter). Always resolves —
 * a failure here degrades to the local mock rather than breaking every page.
 */
export async function getConfig(): Promise<ConfigBlok> {
  if (!isStoryblokConfigured()) return mockConfig;

  try {
    const draft = await isDraft();
    const result = await cdnGet<{ story: SbStory<ConfigBlok> }>(
      `stories/${CONFIG_SLUG}`,
      {},
      draft,
    );
    if (result.ok) return result.data.story.content;

    console.error(
      `[storyblok] config story unavailable (status ${result.status}); using local defaults`,
    );
  } catch (error) {
    console.error("[storyblok] config request threw; using local defaults", error);
  }

  return mockConfig;
}
