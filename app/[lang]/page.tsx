import { StoryView, storyMetadata } from "@/components/storyblok/StoryView";

/**
 * Home page for a locale — the `home` story, translated.
 *
 * A separate route from the catch-all because Storyblok's root story is addressed
 * by the slug "home" while the site serves it at "/<lang>".
 */

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  return storyMetadata("home", lang);
}

export default async function HomePage({ params }: PageProps) {
  const { lang } = await params;
  return <StoryView slug="home" locale={lang} />;
}
