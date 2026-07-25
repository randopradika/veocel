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
   * The second argument is a cache-life profile describing how stale an entry may
   * be and still count as fresh. `{ expire: 0 }` means "nothing is fresh", which is
   * what actually purges the entry — a publish webhook must never serve the
   * previous version. The named `"max"` profile does NOT work here: it implies a
   * ~1-year freshness window, so the call succeeds while purging nothing.
   * (`updateTag` would be the alternative, but it refuses to run outside a Server
   * Action.)
   */
  revalidateTag("storyblok", { expire: 0 });

  return Response.json({ revalidated: true });
}
