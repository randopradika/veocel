import Image from "next/image";

import { ArrowTextLink } from "@/components/ui/ArrowButton";
import { Container, Section } from "@/components/ui/Container";
import { SmartLink } from "@/components/ui/SmartLink";
import { altText } from "@/lib/image";
import type { BrandStripBlok } from "@/lib/types";

import { editable } from "./editable";

/**
 * "where to buy" — a continuously scrolling row of retailer logos.
 *
 * The track is rendered twice and translated by -50%, which is what makes the
 * loop seamless. The duplicate is `aria-hidden` so screen readers hear each brand
 * once, and the animation is disabled under `prefers-reduced-motion` (see
 * `globals.css`).
 */
export function BrandStrip({ blok }: { blok: BrandStripBlok }) {
  const logos = (blok.logos ?? []).filter((logo) => logo.filename);

  return (
    <Section {...editable(blok)} spacing="default">
      <Container>
        {blok.heading ? (
          <h2 className="text-center text-h2 font-bold text-brand md:text-h1">{blok.heading}</h2>
        ) : null}

        <div className="mt-12 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          {logos.length > 0 ? (
            <div className="flex w-max animate-marquee items-center">
              <LogoTrack logos={logos} />
              <LogoTrack logos={logos} duplicate />
            </div>
          ) : (
            /* No logos uploaded yet — hold the row's height so the page still
               reads correctly instead of collapsing to nothing. */
            <ul className="flex flex-wrap justify-center gap-x-10 gap-y-6" aria-hidden>
              {Array.from({ length: 8 }).map((_, index) => (
                <li key={index} className="h-6 w-24 rounded bg-hairline" />
              ))}
            </ul>
          )}
        </div>

        {blok.link_label ? (
          <div className="mt-10 text-center">
            <SmartLink
              link={blok.link}
              className="inline-block text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            >
              <ArrowTextLink>{blok.link_label}</ArrowTextLink>
            </SmartLink>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}

function LogoTrack({
  logos,
  duplicate = false,
}: {
  logos: NonNullable<BrandStripBlok["logos"]>;
  duplicate?: boolean;
}) {
  return (
    <ul className="flex shrink-0 items-center gap-12 pr-12" aria-hidden={duplicate || undefined}>
      {logos.map((logo, index) => (
        <li key={`${logo.filename}-${index}`} className="relative h-7 w-28 shrink-0">
          <Image
            src={logo.filename}
            alt={duplicate ? "" : altText(logo)}
            fill
            sizes="112px"
            className="object-contain opacity-80"
          />
        </li>
      ))}
    </ul>
  );
}
