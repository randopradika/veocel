import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { StoryblokBridge } from "@/components/StoryblokBridge";
import { getStory } from "@/lib/storyblok";

import { BlockRenderer } from "./BlockRenderer";

/**
 * Renders one story by slug: fetch, 404 if missing, render its blocks, and attach
 * the Visual Editor bridge in draft mode only.
 *
 * Shared by `app/page.tsx` (the home story) and `app/[...slug]/page.tsx` so the
 * two routes can't drift apart.
 */
export async function StoryView({ slug, locale }: { slug: string; locale?: string }) {
  const story = await getStory(slug, locale);
  if (!story) notFound();

  const { isEnabled: draft } = await draftMode();

  return (
    <>
      {draft ? <StoryblokBridge storyId={story.id} /> : null}
      <BlockRenderer blocks={story.content.body} />
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
