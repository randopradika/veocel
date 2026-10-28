/**
 * Locales.
 *
 * The list is not hardcoded: it comes from the Storyblok space, so adding or
 * removing a language in Settings › Languages changes the site and the picker
 * without a deploy. Only the human-readable labels live here, since the CDN
 * returns bare codes.
 *
 * URLs are always prefixed (`/en`, `/en/beauty-skincare`). Keeping the default
 * locale prefixed too means one URL shape for every language — no special case
 * that quietly breaks when a second language is added.
 */

export const DEFAULT_LOCALE = "en";

/** Falls back to the uppercased code for languages added after this was written. */
const LABELS: Record<string, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  pt: "Português",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  tr: "Türkçe",
};

export type Locale = { code: string; label: string };

export function localeLabel(code: string): string {
  return LABELS[code] ?? code.toUpperCase();
}

const SPACE_ENDPOINT = "https://api.storyblok.com/v2/cdn/spaces/me";

/**
 * Every locale the space serves, default first.
 *
 * Degrades to just the default locale when the token is missing or the request
 * fails — a language list is not worth failing a page render over.
 */
export async function getLocales(): Promise<Locale[]> {
  const token = process.env.STORYBLOK_ACCESS_TOKEN;
  const fallback = [{ code: DEFAULT_LOCALE, label: localeLabel(DEFAULT_LOCALE) }];

  if (!token) return fallback;

  try {
    const response = await fetch(`${SPACE_ENDPOINT}?token=${token}`, {
      next: { revalidate: 3600, tags: ["storyblok"] },
    });
    if (!response.ok) return fallback;

    const data = (await response.json()) as { space?: { language_codes?: string[] } };
    const codes = [DEFAULT_LOCALE, ...(data.space?.language_codes ?? [])];

    return [...new Set(codes)].map((code) => ({ code, label: localeLabel(code) }));
  } catch {
    return fallback;
  }
}

export async function isKnownLocale(code: string): Promise<boolean> {
  return (await getLocales()).some((locale) => locale.code === code);
}

/**
 * The Storyblok `language` parameter. The default locale is Storyblok's own
 * default dimension, which it addresses by omitting the parameter entirely.
 */
export function storyblokLanguage(locale: string): string | undefined {
  return locale === DEFAULT_LOCALE ? undefined : locale;
}

/** Prefixes an in-app path with a locale: ("de", "/beauty-skincare") → "/de/beauty-skincare". */
export function localePath(locale: string, path: string): string {
  const clean = path.replace(/^\/+/, "");
  return clean ? `/${locale}/${clean}` : `/${locale}`;
}

/**
 * Splits a pathname into its locale and the rest.
 * "/de/beauty-skincare" → { locale: "de", path: "/beauty-skincare" }
 */
export function splitLocale(pathname: string, known: string[]): { locale: string; path: string } {
  const [, first = "", ...rest] = pathname.split("/");

  if (known.includes(first)) {
    return { locale: first, path: `/${rest.join("/")}` };
  }

  return { locale: DEFAULT_LOCALE, path: pathname };
}

/**
 * A story slug's path segments, or `null` when it is not a slug at all.
 *
 * Route params arrive decoded, so a `%2F` or `%3F` typed into a URL reaches
 * here as `/` or `?`. Dot segments are refused — built into a CDN path they
 * walk out of `stories/` — and callers encode each segment, so a `?` cannot
 * cut the access token off the request. Empty segments (`a//b`, a trailing
 * slash) are dropped.
 */
export function slugSegments(slug: string): string[] | null {
  const segments = slug.split("/").filter(Boolean);
  return segments.some((segment) => segment === "." || segment === "..") ? null : segments;
}

/**
 * The page the Visual Editor's preview opens for a story slug.
 *
 * Storyblok appends a story's `full_slug` to the space's preview URL, and a
 * slug carries no language — `fiber-types`, `itsinourhands/` — while every
 * page here sits under one. A bare slug therefore opens in the default locale;
 * one that already leads with a known locale keeps it. `home` is the locale's
 * root. Backslashes are read as slashes, the way browsers read them, so the
 * result is always a path on this site and never `//host`.
 */
export function previewPath(slug: string, known: string[]): string {
  const segments = slugSegments(slug.replace(/\\/g, "/")) ?? [];
  const locale = known.includes(segments[0]) ? segments.shift()! : DEFAULT_LOCALE;
  const path = segments.length === 1 && segments[0] === "home" ? [] : segments;
  return localePath(locale, path.map(encodeURIComponent).join("/"));
}
