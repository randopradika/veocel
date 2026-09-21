import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { StoryblokBridge } from "@/components/StoryblokBridge";
import { DEFAULT_LOCALE, localePath } from "@/lib/i18n";
import { getNextArticle, getStory, storyPath } from "@/lib/storyblok";
import type { ArticleBlok, SbStory } from "@/lib/types";

import { Article } from "./Article";
import { BlockRenderer } from "./BlockRenderer";

/**
 * Renders one story by slug: fetch, 404 if missing, render it, and attach the
 * Visual Editor bridge in draft mode only.
 *
 * A `page` is its body of blocks; an `article` has a fixed shape of its own and
 * renders through `Article`.
 *
 * Shared by `app/page.tsx` (the home story) and `app/[...slug]/page.tsx` so the
 * two routes can't drift apart.
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
        <BlockRenderer blocks={content.body} locale={locale} />
      )}
    </>
  );
}

/**
 * Per-page `<title>` and description, from the story's SEO fields.
 *
 * A `seo_title` an editor typed is used verbatim (`absolute`), because they will
 * have written the brand into it themselves — otherwise the root layout's
 * `"%s | VEOCEL™"` template appends a second suffix. Stories with no SEO title
 * fall back to the story name and do go through the template.
 */
export async function storyMetadata(slug: string, locale?: string): Promise<Metadata> {
  const story = await getStory(slug, locale);
  if (!story) return {};

  const seoTitle = story.content.seo_title?.trim();
  const description = story.content.seo_description;

  return {
    title: seoTitle ? { absolute: seoTitle } : story.name,
    description,
    openGraph: { title: seoTitle || story.name, description },
  };
}
