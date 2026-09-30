import { Container, Section } from "@/components/ui/Container";
import { Markdown } from "@/components/ui/Markdown";
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

export function CtaPanel({ blok }: { blok: CtaPanelBlok }) {
  if (!blok.heading && !blok.body && !blok.link_label) return null;

  return (
    <Section
      {...editable(blok)}
      spacing="tight"
      // Desktop rhythm from the "dev" board (2053:170): 136px under the hero tabs and to the band (partners 2053:247). No padding below,
      // or neighbours would stack; the last block on a page keeps the gap to the band.
      className="bg-brand-50 xl:pt-[136px] xl:pb-0 xl:last:pb-[136px]"
    >
      <Container width="design">
        <div className="rounded-panel border border-hairline bg-white px-8 py-12 text-center md:px-16 md:py-16">
          {blok.heading ? (
            <h2 className="text-h2 font-bold text-brand md:text-h1">
              {blok.heading}
            </h2>
          ) : null}

          <Markdown
            className="mx-auto mt-5 max-w-3xl text-base leading-[1.4] text-ink-muted md:text-xl"
            gap="loose"
          >
            {blok.body}
          </Markdown>

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
