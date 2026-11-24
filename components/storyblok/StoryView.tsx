import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { StoryblokBridge } from "@/components/StoryblokBridge";
import { DEFAULT_LOCALE, getLocales, localePath } from "@/lib/i18n";
import { getNextArticle, getProofLibrary, getStory, storyPath } from "@/lib/storyblok";
import { altText } from "@/lib/image";
import type { ArticleBlok, HeroBlok, SbBlock, SbStory } from "@/lib/types";

import { Article } from "./Article";
import { BlockRenderer } from "./BlockRenderer";

/**
 * Renders one story by slug: fetch, 404 if missing, render it, and attach the
 * Visual Editor bridge in draft mode only.
 *
 * A `page` is its body of blocks; an `article` has a fixed shape of its own and
 * renders through `Article`.
 *
 * Shared by `app/[lang]/page.tsx` (the home story) and
 * `app/[lang]/[...slug]/page.tsx` so the two routes can't drift apart.
 */
export async function StoryView({
  slug,
  locale = DEFAULT_LOCALE,
}: {
  slug: string;
  locale?: string;
}) {
  const story = await getStory(slug, locale);
  if (!story) notFound();

  const { isEnabled: draft } = await draftMode();
  const { content } = story;

  // An article's two buttons: back to the hub it sits in — its folder's start
  // page, /itsinourhands — and on to the next article there.
  const next =
    content.component === "article"
      ? await getNextArticle(story as SbStory<ArticleBlok>, locale)
      : null;
  const hub = story.full_slug.replace(/\/+$/, "").split("/").slice(0, -1).join("/");

  // A claims section links its proof lines to the site's certificates and documents.
  const library =
    content.component !== "article" &&
    (content.body ?? []).some((blok) => blok.component === "claim_grid")
      ? await getProofLibrary(locale)
      : undefined;

  return (
    <>
      {draft ? <StoryblokBridge storyId={story.id} /> : null}
      {content.component === "article" ? (
        <Article
          blok={content}
          backHref={localePath(locale, hub)}
          next={next ? { href: localePath(locale, storyPath(next)), title: next.content.title } : null}
        />
      ) : (
        <>
          {opensWithHeading(content.body) ? null : (
            <h1 className="sr-only">{pageHeading(story.name, content.seo_title)}</h1>
          )}
          <BlockRenderer blocks={content.body} locale={locale} library={library} />
        </>
      )}
    </>
  );
}

/** A 404's title, as `app/not-found.tsx` sets it — which a page segment's 404 cannot borrow. */
/**
 * Every page has one h1 (WCAG audit, 2026-11-24): the home page and claims &
 * certifications had none — the home headline is drawn into its photograph,
 * and claims opens on its sections' own h2s. A hero with a headline, or with
 * the words of its picture in the image's alt text, a page hero and the
 * #ItsInOurHands hub each set their own; anything else gets the page's title,
 * for screen readers only.
 */
function opensWithHeading(body: SbBlock[] = []): boolean {
  return body.some((blok) => {
    if (blok.component === "page_hero" || blok.component === "article_hub") return true;
    if (blok.component !== "hero") return false;
    const hero = blok as HeroBlok;
    return Boolean(hero.headline?.trim() || altText(hero.background_image) || altText(hero.background_image_mobile));
  });
}

/** The SEO title without the site name it ends on ("claims & certifications | VEOCEL™"). */
function pageHeading(name: string, seoTitle?: string): string {
  const title = seoTitle?.replace(/\s*\|\s*VEOCEL™\s*$/, "").trim();
  return title || name;
}

const NOT_FOUND_METADATA: Metadata = { title: "page not found" };

/**
 * Per-page `<title>` and description, from the story's SEO fields.
 *
 * A `seo_title` an editor typed is used verbatim (`absolute`), because they will
 * have written the brand into it themselves — otherwise the root layout's
 * `"%s | VEOCEL™"` template appends a second suffix. Stories with no SEO title
 * fall back to the story name and do go through the template.
 */
export async function storyMetadata(
  slug: string,
  locale: string = DEFAULT_LOCALE,
): Promise<Metadata> {
  // A page that 404s keeps the 404's title. Returning nothing let the tab fall
  // back to the site's default title once the page hydrated — and under an
  // unknown locale, which the layout 404s, the home story still answered here
  // and lent the 404 its own title and description.
  const known = (await getLocales()).some((entry) => entry.code === locale);
  const story = known ? await getStory(slug, locale) : null;
  if (!story) return NOT_FOUND_METADATA;

  const seoTitle = story.content.seo_title?.trim();
  const description = story.content.seo_description;

  return {
    title: seoTitle ? { absolute: seoTitle } : story.name,
    description,
    openGraph: { title: seoTitle || story.name, description },
  };
}
