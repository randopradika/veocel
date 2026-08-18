import { BlockImage } from "@/components/ui/BlockImage";
import { Container } from "@/components/ui/Container";
import type { HeroBlok } from "@/lib/types";

import { editable } from "./editable";
import { HeroNavCards } from "./HeroNavCards";

/**
 * Full-bleed opening hero: photography, a very large lowercase headline, and a row
 * of numbered shortcut cards pinned along the bottom edge.
 *
 * The cards sit inside the hero rather than below it, so the photograph reads as a
 * single band down to the fold. They are the primary navigation into the site, so
 * they are ordinary links — numbered for scanning, not for sequence.
 *
 * `headline_size` picks the type: `display` for the home page, where one word is
 * the poster, and `title` for a section landing page, where the headline is the
 * section's name and the fluid display size would swamp it.
 */

const HEADLINE_SIZE = {
  display: "text-display-fluid",
  title: "text-h1 md:text-[4.5rem] md:leading-[1.05]",
} as const;

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

        <h1
          className={`font-bold drop-shadow-[0_2px_18px_rgba(0,0,0,0.25)] ${
            HEADLINE_SIZE[blok.headline_size ?? "display"]
          }`}
        >
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
          <HeroNavCards cards={cards} />
        </Container>
      ) : null}
    </section>
  );
}
