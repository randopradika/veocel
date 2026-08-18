import { BlockImage } from "@/components/ui/BlockImage";
import { Container } from "@/components/ui/Container";
import { SmartLink } from "@/components/ui/SmartLink";
import type { HeroBlok } from "@/lib/types";

import { editable } from "./editable";

/**
 * Full-bleed opening hero: photography, a very large lowercase headline, and a row
 * of numbered shortcut cards pinned along the bottom edge.
 *
 * The cards sit inside the hero rather than below it, so the photograph reads as a
 * single band down to the fold. They are the primary navigation into the site, so
 * they are ordinary links — numbered for scanning, not for sequence.
 */
export function Hero({ blok }: { blok: HeroBlok }) {
  const cards = blok.nav_cards ?? [];

  return (
    <section
      {...editable(blok)}
      // Read by SiteHeader to decide when to switch out of transparent mode.
      data-hero=""
      className="relative isolate flex min-h-[92svh] flex-col justify-center overflow-hidden bg-brand-800"
    >
      <BlockImage
        asset={blok.background_image}
        alt={blok.headline}
        priority
        sizes="100vw"
        className="absolute inset-0 -z-10"
        placeholderTone="brand"
      />

      {/* Keeps the white type legible over whatever photograph is used. */}
      <div className="absolute inset-0 -z-10 bg-black/25" aria-hidden />

      <Container className="flex flex-1 flex-col justify-center pt-32 pb-10 text-center text-white md:pt-40">
        {blok.eyebrow ? (
          <p className="mb-3 text-sm font-medium text-white/85 md:text-base">{blok.eyebrow}</p>
        ) : null}

        <h1 className="text-display-fluid font-bold drop-shadow-[0_2px_18px_rgba(0,0,0,0.25)]">
          {blok.headline}
        </h1>

        {blok.subline ? (
          <p className="mx-auto mt-6 max-w-xl text-lg leading-snug font-medium text-white/95 md:text-2xl">
            {blok.subline}
          </p>
        ) : null}
      </Container>

      {cards.length > 0 ? (
        <Container width="wide" className="pb-8">
          {/*
            Scrolls sideways on narrow screens rather than wrapping into a tall
            stack that would push the headline off the fold.
          */}
          <ul className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 lg:grid lg:grid-cols-7 lg:overflow-visible">
            {cards.map((card, index) => (
              <li key={card._uid} className="w-52 shrink-0 snap-start lg:w-auto">
                <SmartLink
                  link={card.link}
                  className="group flex h-full rounded-[0.9rem] border border-white/45 px-4 py-3.5 text-white transition-colors duration-200 hover:border-white hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <span {...editable(card)} className="flex flex-1 flex-col justify-between gap-6">
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full border border-white/55 text-[0.6rem] leading-none"
                      aria-hidden
                    >
                      {index + 1}
                    </span>
                    <span className="text-[0.82rem] leading-snug font-medium">{card.label}</span>
                  </span>
                </SmartLink>
              </li>
            ))}
          </ul>
        </Container>
      ) : null}
    </section>
  );
}
