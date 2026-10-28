import { permanentRedirect } from "next/navigation";

import { StoryView, storyMetadata } from "@/components/storyblok/StoryView";
import { getLocales, localePath } from "@/lib/i18n";
import { getAllPageSlugs } from "@/lib/storyblok";

/**
 * Every page other than the locale home: `fiber-types`, nested paths, and
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
  // The home story answers at the locale root; this would be a second address for it.
  if (slug.join("/") === "home") permanentRedirect(localePath(lang, ""));
  return <StoryView slug={slug.join("/")} locale={lang} />;
}
