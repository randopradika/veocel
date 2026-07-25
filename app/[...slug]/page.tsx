import { StoryView, storyMetadata } from "@/components/storyblok/StoryView";
import { getAllPageSlugs } from "@/lib/storyblok";

/**
 * Every page other than the home story: `beauty-skincare`, nested paths, and
 * whatever editors add later. Nothing here is per-page hardcoded — the route
 * follows the Storyblok content tree.
 */

type PageProps = { params: Promise<{ slug: string[] }> };

/** Pre-renders published pages at build time; new slugs fall back to on-demand. */
export async function generateStaticParams() {
  const slugs = await getAllPageSlugs();
  return slugs.map((slug) => ({ slug: slug.split("/") }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return storyMetadata(slug.join("/"));
}

export default async function StoryblokPage({ params }: PageProps) {
  const { slug } = await params;
  return <StoryView slug={slug.join("/")} />;
}
