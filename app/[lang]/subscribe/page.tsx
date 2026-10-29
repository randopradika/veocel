import type { Metadata } from "next";

import { Container, Section } from "@/components/ui/Container";
import { getConfig } from "@/lib/storyblok";

/**
 * Second step of the newsletter signup, carried over from the old veocel.com.
 *
 * The band above the footer only collects an address and lands here as
 * `/<lang>/subscribe?email=…`. The signup itself is Lenzing's ClickDimensions
 * form (their Dynamics CRM), embedded the way the old site did: it asks for the
 * name, the data-processing consent and a "check to unlock" CAPTCHA, and posts
 * straight to ClickDimensions — this site stores nothing.
 *
 * Two things the form decides for itself:
 * - It prefills its e-mail field from its own `email` parameter, read with
 *   `decodeURI`, which leaves "%40" and "%2B" as they are — so `@` and `+` go
 *   across unescaped.
 * - It picks the newsletter, the consent text and the "From …" source flag off
 *   the embedding page's hostname (the referrer). Only `www.veocel.com` gets the
 *   nonwovens list; anywhere else — the vercel.app dev box, localhost — falls
 *   through to the Carved in Blue denim newsletter. So real signups belong on
 *   www.veocel.com, and the iframe must never get `referrerPolicy="no-referrer"`.
 */

const FORM_URL =
  "https://analytics-eu.clickdimensions.com/lenzingcom-aaucu/pages/eiafr7z7eeqbbgbqvpsvia.html?PageId=479f8678fbbcea1181060050569b2f88";

/** The form's e-mail field holds at most 100 characters. */
const MAX_EMAIL = 100;

export const metadata: Metadata = {
  title: "newsletter",
  // The page echoes the address in its URL into the form, so it stays out of search engines.
  robots: { index: false },
};

export default async function SubscribePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ email?: string | string[] }>;
}) {
  const [{ lang }, { email }] = await Promise.all([params, searchParams]);
  const config = await getConfig(lang);

  // `?email=a&email=b` arrives as an array; the first one is the address. Only
  // printable ASCII around an "@" is handed on — anything else, the visitor types
  // into the form.
  const address = ((Array.isArray(email) ? email[0] : email) ?? "").trim();
  const prefill = address.length <= MAX_EMAIL && /^[!-~]+@[!-~]+$/.test(address);
  const src = prefill
    ? `${FORM_URL}&email=${encodeURI(address).replace(/[&#]/g, encodeURIComponent)}`
    : FORM_URL;

  return (
    <Section className="pt-40 md:pt-header">
      <Container width="narrow">
        <h1 className="text-h2 font-bold text-brand md:text-h1">
          {config.newsletter_heading ?? "newsletter subscriptions"}
        </h1>

        {/* A fixed height, as on the old site — the form doesn't report its own.
            It is 1101px tall in a frame under 490px wide and 798px or less from
            there up, so the step follows the frame's width, not the viewport's.
            The slack is for its validation messages. */}
        <div className="mt-10 @container">
          <iframe
            src={src}
            title="Newsletter subscription form"
            className="block h-[1180px] w-full @min-[490px]:h-[860px]"
          />
        </div>
      </Container>
    </Section>
  );
}
