import type { Metadata } from "next";

import { Container, Section } from "@/components/ui/Container";
import { ResizingIframe } from "@/components/ui/ResizingIframe";
import { getConfig } from "@/lib/storyblok";

/**
 * Second step of the newsletter signup, carried over from the old veocel.com.
 *
 * The band above the footer only collects an address and lands here as
 * `/<lang>/subscribe?email=…`. The signup itself is Lenzing's ClickDimensions
 * form (their Dynamics CRM), embedded as the old site did: it asks for the name,
 * the data-processing consent and a "check to unlock" CAPTCHA, and posts
 * straight to ClickDimensions — this site stores nothing.
 *
 * The frame loads it through `/newsletter-form`, which pins the form to VEOCEL's
 * nonwovens newsletter and its consent text on any host — see that route. The
 * form prefills its e-mail field from its own `email` parameter, read with
 * `decodeURI`, which leaves "%40" and "%2B" as they are — so `@` and `+` go
 * across unescaped.
 */

const FORM_PATH = "/newsletter-form";

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
    ? `${FORM_PATH}?email=${encodeURI(address).replace(/[&#]/g, encodeURIComponent)}`
    : FORM_PATH;

  return (
    <Section className="pt-40 md:pt-header">
      <Container width="narrow">
        <h1 className="text-h2 font-bold text-brand md:text-h1">
          {config.newsletter_heading ?? "newsletter subscriptions"}
        </h1>

        {/* The frame follows the form's own height once it reports it. Until
            then these hold it: the form is 1101px tall in a frame under 490px
            wide and 798px or less from there up, so the step follows the frame's
            width, not the viewport's. */}
        <div className="mt-10 @container">
          <ResizingIframe
            src={src}
            title="Newsletter subscription form"
            className="block h-[1180px] w-full @min-[490px]:h-[860px]"
          />
        </div>
      </Container>
    </Section>
  );
}
