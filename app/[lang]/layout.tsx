import { notFound } from "next/navigation";

import { NewsletterBand } from "@/components/layout/NewsletterBand";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getLocales } from "@/lib/i18n";
import { getConfig } from "@/lib/storyblok";

/**
 * Locale shell: renders the chrome in the requested language.
 *
 * The config story is fetched once here rather than per page, and the locale list
 * is handed to the header so the picker offers exactly the languages the Storyblok
 * space serves.
 *
 * The `lang` attribute sits on a `display: contents` wrapper rather than on
 * `<html>`: the root layout owns `<html>` and cannot see this segment's params.
 * Assistive tech reads the language from the nearest ancestor that declares it, so
 * everything inside is announced correctly.
 */

export async function generateStaticParams() {
  const locales = await getLocales();
  return locales.map((locale) => ({ lang: locale.code }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locales = await getLocales();

  // An unknown prefix is a 404, not a silent fall back to English — otherwise
  // every mistyped URL would render a page and dilute the canonical ones.
  if (!locales.some((locale) => locale.code === lang)) notFound();

  const config = await getConfig(lang);

  return (
    <div lang={lang} className="contents">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand"
      >
        Skip to content
      </a>

      <SiteHeader locales={locales} locale={lang} />

      {/* The header is fixed and overlays the hero, so no top offset here. */}
      <main id="content" className="flex-1">
        {children}
      </main>

      <NewsletterBand config={config} />
      <SiteFooter config={config} locale={lang} />
    </div>
  );
}
