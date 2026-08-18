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
