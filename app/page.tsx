import { StoryView, storyMetadata } from "@/components/storyblok/StoryView";

/**
 * Home page — the `home` story in Storyblok.
 *
 * A separate route from the catch-all because Storyblok's root story is addressed
 * by the slug "home" while the site serves it at "/".
 */
export function generateMetadata() {
  return storyMetadata("home");
}

export default function HomePage() {
  return <StoryView slug="home" />;
}
