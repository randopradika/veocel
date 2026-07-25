import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";

/**
 * Storyblok publish webhook.
 *
 * Point a webhook at `https://<host>/api/revalidate?secret=<STORYBLOK_WEBHOOK_SECRET>`
 * so published changes appear immediately instead of waiting out the one-hour
 * `revalidate` window in `lib/storyblok.ts`.
 *
 * Every content request is tagged `storyblok`, so one tag invalidation covers
 * pages and the shared config story alike. Deliberately coarse: the config story
 * feeds the header and footer of every page, so a per-slug invalidation would
 * leave stale navigation behind.
 */
export async function POST(request: NextRequest) {
  const expected = process.env.STORYBLOK_WEBHOOK_SECRET;
  const provided = request.nextUrl.searchParams.get("secret");

  if (!expected || provided !== expected) {
    return Response.json({ revalidated: false, reason: "invalid secret" }, { status: 401 });
  }

  /*
   * Next 16 requires a cache-life profile as the second argument. "max" is what
   * Next itself prescribes for on-demand purges, and it invalidates entries of any
   * age — correct for a publish webhook, which must never serve the old version.
   * (`updateTag` is the other option but refuses to run in a route handler.)
   */
  revalidateTag("storyblok", "max");

  return Response.json({ revalidated: true });
}
