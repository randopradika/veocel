import type { NextRequest } from "next/server";

/**
 * Lenzing's newsletter form, served from this site with VEOCEL's newsletter
 * pinned.
 *
 * The form (ClickDimensions, Lenzing's Dynamics CRM) picks the newsletter, the
 * consent text and the "From …" source flag off the embedding page's hostname.
 * Only `www.veocel.com` gets the „beyond fiber - nonwovens newsletter“ consent;
 * anywhere else — the vercel.app host this site runs on before the domain moves
 * over, localhost — falls through to the Carved in Blue denim newsletter. So this
 * route fetches the form and swaps that one hostname lookup for `www.veocel.com`,
 * and puts the newsletter's name in English quotes in place of the form's German
 * „…“. Nothing else changes: its scripts, styles and post target are absolute
 * URLs on ClickDimensions, a submit posts straight there (`target="_parent"`),
 * and this site still stores nothing.
 *
 * If the lookup is missing — Lenzing has changed the form — or the fetch fails,
 * the frame is sent to the original form instead, which picks by hostname as
 * before and keeps the frame's fixed height.
 */

const FORM_URL =
  "https://analytics-eu.clickdimensions.com/lenzingcom-aaucu/pages/eiafr7z7eeqbbgbqvpsvia.html?PageId=479f8678fbbcea1181060050569b2f88";

/** The form's own line, character for character. */
const HOSTNAME_LOOKUP =
  "var url = new URL((window.location != window.parent.location) ? document.referrer : document.location.href);";
const PINNED = 'var url = new URL("https://www.veocel.com/");';

const GERMAN_QUOTED = "„beyond fiber - nonwovens newsletter“";
const ENGLISH_QUOTED = "“beyond fiber - nonwovens newsletter”";

export async function GET(request: NextRequest) {
  const response = await fetch(FORM_URL, { next: { revalidate: 3600 } }).catch(() => null);
  const html = response?.ok ? await response.text() : "";

  if (!html.includes(HOSTNAME_LOOKUP)) {
    console.error(
      `[newsletter-form] ${html ? "hostname lookup not found" : "form fetch failed"}; sending the frame to the original`,
    );
    // The form prefills from its own query string, so the address goes along.
    const query = request.nextUrl.search.slice(1);
    return Response.redirect(query ? `${FORM_URL}&${query}` : FORM_URL);
  }

  return new Response(html.replace(HOSTNAME_LOOKUP, PINNED).replace(GERMAN_QUOTED, ENGLISH_QUOTED), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex",
    },
  });
}
