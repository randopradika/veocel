import { StoryView, storyMetadata } from "@/components/storyblok/StoryView";
import { getLocales } from "@/lib/i18n";
import { getAllPageSlugs } from "@/lib/storyblok";

/**
 * Every page other than the locale home: `beauty-skincare`, nested paths, and
 * whatever editors add later. Nothing here is per-page hardcoded — the route
 * follows the Storyblok content tree.
 */

type PageProps = { params: Promise<{ lang: string; slug: string[] }> };

/** Pre-renders every published page in every locale; new slugs fall back to on-demand. */
export async function generateStaticParams() {
  const [locales, slugs] = await Promise.all([getLocales(), getAllPageSlugs()]);

  return locales.flatMap((locale) =>
    slugs.map((slug) => ({ lang: locale.code, slug: slug.split("/") })),
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { lang, slug } = await params;
  return storyMetadata(slug.join("/"), lang);
}

export default async function StoryblokPage({ params }: PageProps) {
  const { lang, slug } = await params;
  return <StoryView slug={slug.join("/")} locale={lang} />;
}
