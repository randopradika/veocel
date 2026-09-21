import { draftMode } from "next/headers";

import { DEFAULT_LOCALE, storyblokLanguage } from "./i18n";
import { mockConfig } from "./mock/config";
import { mockStories } from "./mock/pages";
import type { ArticleBlok, ConfigBlok, SbStory, StoryContent } from "./types";

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

/** Content types that render as a page of their own — see `StoryContent`. */
const PAGE_TYPES = "page,article";

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
 * A story's in-app path: `itsinourhands/` → `itsinourhands`, and `home` → "".
 *
 * A folder's start page carries the folder's slug with a trailing slash, which
 * would otherwise leak into URLs as a redirect.
 */
export function storyPath(story: Pick<SbStory, "full_slug">): string {
  const path = story.full_slug.replace(/\/+$/, "");
  return path === "home" ? "" : path;
}

/**
 * Fetches a single story by slug. `"home"` for the root page.
 * Returns `null` when the story genuinely does not exist.
 */
export async function getStory(
  slug: string,
  locale: string = DEFAULT_LOCALE,
): Promise<SbStory<StoryContent> | null> {
  const normalised = slug.replace(/^\/+|\/+$/g, "") || "home";

  if (!isStoryblokConfigured()) {
    // The mock has no translations; every locale sees the same content.
    return mockStories[normalised] ?? null;
  }

  const language = storyblokLanguage(locale);
  const draft = await isDraft();
  // A folder's start page (`itsinourhands/`) answers at its folder's slug too.
  const result = await cdnGet<{ story: SbStory<StoryContent> }>(
    `stories/${normalised}`,
    { resolve_links: "url", ...(language ? { language } : {}) },
    draft,
  );

  if (result.ok) return result.data.story;
  if (result.status === 404) return null;

  throw new Error(
    `Storyblok request for "${normalised}" failed with status ${result.status}`,
  );
}

/**
 * Full-text search across pages and articles, backing the footer's search form.
 *
 * Storyblok does the matching server-side via `search_term`. Without a token the
 * local mock is scanned instead, so search still works offline.
 */
export async function searchStories(
  term: string,
  locale: string = DEFAULT_LOCALE,
): Promise<SbStory<StoryContent>[]> {
  const query = term.trim();
  if (!query) return [];

  if (!isStoryblokConfigured()) {
    const needle = query.toLowerCase();
    return Object.values(mockStories).filter((story) =>
      JSON.stringify(story.content).toLowerCase().includes(needle),
    );
  }

  const language = storyblokLanguage(locale);
  const draft = await isDraft();
  const result = await cdnGet<{ stories: SbStory<StoryContent>[] }>(
    "stories",
    {
      search_term: query,
      per_page: "25",
      "filter_query[component][in]": PAGE_TYPES,
      ...(language ? { language } : {}),
    },
    draft,
  );

  // A failed search should read as "nothing found", not take the page down.
  if (!result.ok) {
    console.error(`[storyblok] search for "${query}" failed with status ${result.status}`);
    return [];
  }

  return result.data.stories;
}

/** Paths of every published page and article, for `generateStaticParams`. */
export async function getAllPageSlugs(): Promise<string[]> {
  if (!isStoryblokConfigured()) {
    return Object.keys(mockStories).filter((slug) => slug !== "home");
  }

  const result = await cdnGet<{ stories: { full_slug: string }[] }>(
    "stories",
    { per_page: "100", excluding_slugs: "config", "filter_query[component][in]": PAGE_TYPES },
    false,
  );

  if (!result.ok) return [];
  return result.data.stories.map(storyPath).filter(Boolean);
}

/**
 * Latest first: by the article's own date, then — for articles sharing a date —
 * by when each was first published.
 */
function newestFirst(a: SbStory<ArticleBlok>, b: SbStory<ArticleBlok>): number {
  const byDate = (b.content.date ?? "").localeCompare(a.content.date ?? "");
  if (byDate !== 0) return byDate;
  return (b.first_published_at ?? "").localeCompare(a.first_published_at ?? "");
}

/**
 * Every article in a folder, for the `article_hub` block. The folder's start page
 * — the hub itself — is a `page`, so it is never among them.
 *
 * Fails like `getStory` does: a hub rendered empty because the CDN blinked would
 * be cached for an hour looking like a platform with nothing on it.
 */
export async function getArticles(
  folder: string,
  locale: string = DEFAULT_LOCALE,
): Promise<SbStory<ArticleBlok>[]> {
  const prefix = `${folder.replace(/^\/+|\/+$/g, "")}/`;

  if (!isStoryblokConfigured()) {
    return Object.values(mockStories)
      .filter(
        (story): story is SbStory<ArticleBlok> =>
          story.content.component === "article" && story.full_slug.startsWith(prefix),
      )
      .sort(newestFirst);
  }

  const language = storyblokLanguage(locale);
  const draft = await isDraft();
  const result = await cdnGet<{ stories: SbStory<ArticleBlok>[] }>(
    "stories",
    {
      starts_with: prefix,
      content_type: "article",
      per_page: "100",
      ...(language ? { language } : {}),
    },
    draft,
  );

  if (!result.ok) {
    throw new Error(`Storyblok articles under "${prefix}" failed with status ${result.status}`);
  }

  return result.data.stories.sort(newestFirst);
}

/**
 * The article after this one in its folder, in the hub's order — latest first —
 * for the article's "next article" button. Wraps from the oldest back to the
 * newest, so the button always leads somewhere; `null` when the folder holds
 * nothing else.
 */
export async function getNextArticle(
  story: Pick<SbStory<ArticleBlok>, "full_slug" | "uuid">,
  locale: string = DEFAULT_LOCALE,
): Promise<SbStory<ArticleBlok> | null> {
  const folder = story.full_slug.replace(/\/+$/, "").split("/").slice(0, -1).join("/");
  if (!folder) return null;

  const articles = await getArticles(folder, locale);
  if (!articles.some((article) => article.uuid !== story.uuid)) return null;

  // Missing from the list (a draft the CDN does not list yet) is index -1, which
  // leads to the newest, as the oldest wrapping round does.
  const index = articles.findIndex((article) => article.uuid === story.uuid);
  return articles[(index + 1) % articles.length];
}

/**
 * Site-wide chrome (navigation, footer, newsletter). Always resolves —
 * a failure here degrades to the local mock rather than breaking every page.
 */
export async function getConfig(locale: string = DEFAULT_LOCALE): Promise<ConfigBlok> {
  if (!isStoryblokConfigured()) return mockConfig;

  try {
    const language = storyblokLanguage(locale);
    const draft = await isDraft();
    const result = await cdnGet<{ story: SbStory<ConfigBlok> }>(
      `stories/${CONFIG_SLUG}`,
      language ? { language } : {},
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
