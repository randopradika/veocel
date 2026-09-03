import { Container, Section } from "@/components/ui/Container";
import { SmartLink } from "@/components/ui/SmartLink";
import type { CtaPanelBlok } from "@/lib/types";

import { editable } from "./editable";

/**
 * A white call-to-action panel on the tinted band: centred heading, a short
 * pitch, and one filled button — the partner page's "LENZING Pro" and
 * brochure panels.
 *
 * Consecutive panels share the band because every panel's section carries the
 * same tint, the way `brand_directory` colours its band.
 */

/** Blank lines start a new paragraph, as elsewhere in the block library. */
function paragraphs(body?: string): string[] {
  if (!body) return [];
  return body
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function CtaPanel({ blok }: { blok: CtaPanelBlok }) {
  if (!blok.heading && !blok.body && !blok.link_label) return null;

  return (
    <Section {...editable(blok)} spacing="tight" className="bg-brand-50">
      <Container>
        <div className="rounded-panel border border-hairline bg-white px-8 py-12 text-center md:px-16 md:py-16">
          {blok.heading ? (
            <h2 className="text-h2 font-bold text-brand md:text-h1">
              {blok.heading}
            </h2>
          ) : null}

          {paragraphs(blok.body).map((paragraph, index) => (
            <p
              key={index}
              className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-ink-muted"
            >
              {paragraph}
            </p>
          ))}

          {blok.link_label ? (
            <SmartLink
              link={blok.link}
              className="mt-9 inline-flex items-center justify-center rounded-full bg-brand px-8 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {blok.link_label}
            </SmartLink>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
