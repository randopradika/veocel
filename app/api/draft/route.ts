import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

/**
 * Entry point for the Storyblok Visual Editor.
 *
 * Set the space's preview URL to:
 *   https://<host>/api/draft?secret=<STORYBLOK_PREVIEW_SECRET>&slug=
 *
 * Storyblok appends the story's slug, so the editor lands on the right page with
 * draft mode enabled — which is what makes `getStory()` request `version=draft`
 * and `StoryView` mount the live-preview bridge.
 *
 * Draft mode exposes unpublished content, so the secret is required. Without
 * `STORYBLOK_PREVIEW_SECRET` configured the route refuses outright rather than
 * defaulting to open.
 */
export async function GET(request: NextRequest) {
  const expected = process.env.STORYBLOK_PREVIEW_SECRET;
  const provided = request.nextUrl.searchParams.get("secret");

  if (!expected || provided !== expected) {
    return new Response("Invalid preview secret", { status: 401 });
  }

  const slug = (request.nextUrl.searchParams.get("slug") ?? "").replace(/^\/+/, "");

  const draft = await draftMode();
  draft.enable();

  // Only ever redirect to a path on this site — never to a caller-supplied host.
  redirect(slug && slug !== "home" ? `/${slug}` : "/");
}
