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
      // Desktop rhythm from the "dev" board (2053:170): 136px under the hero tabs and to
      // the band (partners 2053:247). No padding below, or neighbours would stack; the
      // last block on a page keeps the gap to the band.
      className="bg-brand-50 md:bg-[#e6f1f8] xl:pt-[136px] xl:pb-0 xl:last:pb-[136px]"
    >
      <Container width="design">
        {/*
          From `xl` the frame's panel (2053:349): 572px tall at 1920, an 80px
          radius and a #4177b5 hairline; the 64px heading 76px in, 32/54 copy
          1125px wide 40px under it, and a 327 x 68 button 60px lower with 85px
          below it (less the 1px border here). The frame sets the button 28px left
          of centre; it is centred.
        */}
        <div className="rounded-panel border border-hairline bg-white px-8 py-12 text-center md:px-16 md:py-16 xl:rounded-[80px] xl:border-[#4177b5] xl:px-16 xl:pt-[75px] xl:pb-[84px]">
          {blok.heading ? (
            <h2 className="text-h2 font-bold text-brand md:text-h1 xl:leading-[81px]">
              {blok.heading}
            </h2>
          ) : null}

          <Markdown
            className="mx-auto mt-5 max-w-3xl text-base leading-[1.4] text-ink-muted md:text-xl xl:mt-10 xl:max-w-[1125px] xl:text-[2rem] xl:leading-[54px] xl:tracking-[-0.05em] xl:text-[#4d4d4d]"
            gap="loose"
          >
            {blok.body}
          </Markdown>

          {blok.link_label ? (
            <SmartLink
              link={blok.link}
              className="mt-9 inline-flex items-center justify-center rounded-full bg-brand px-8 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand xl:mt-[60px] xl:h-[68px] xl:w-[327px] xl:bg-[#0f7ab8] xl:px-0 xl:py-0 xl:text-2xl xl:font-medium"
            >
              {blok.link_label}
            </SmartLink>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
