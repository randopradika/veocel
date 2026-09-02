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
 *
 * `align: left` starts the type at the column edge instead of centring it — the
 * home revision's arrangement, where the right half of the photograph carries
 * the magnifier motif and the type stays clear of it.
 *
 * `headline_highlight` names a run of the headline to sit on a pale blue plate —
 * the fibers page boxes its last word that way.
 */

const HEADLINE_SIZE = {
  display: "text-display-fluid",
  title: "text-h1 md:text-[4.5rem] md:leading-[1.05]",
} as const;

/**
 * Splits the headline around `highlight` so the matched run can be boxed. The
 * first occurrence only, and nothing at all when the run isn't there — editors
 * rename headlines without touching this field.
 */
function splitHeadline(headline: string, highlight?: string) {
  const at = highlight ? headline.indexOf(highlight) : -1;
  if (at < 0 || !highlight) return null;

  return {
    before: headline.slice(0, at),
    match: headline.slice(at, at + highlight.length),
    after: headline.slice(at + highlight.length),
  };
}

export function Hero({ blok }: { blok: HeroBlok }) {
  const cards = blok.nav_cards ?? [];
  const left = blok.align === "left";
  const parts = splitHeadline(blok.headline, blok.headline_highlight);

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

      <Container
        className={`flex flex-1 flex-col justify-center pt-32 pb-10 text-white md:pt-40 ${
          left ? "text-left" : "text-center"
        }`}
      >
        {blok.eyebrow ? (
          <p className="mb-3 text-sm font-medium text-white/85 md:text-base">{blok.eyebrow}</p>
        ) : null}

        <h1
          className={`font-bold drop-shadow-[0_2px_18px_rgba(0,0,0,0.25)] ${
            HEADLINE_SIZE[blok.headline_size ?? "display"]
          }`}
        >
          {parts ? (
            <>
              {parts.before}
              {/*
                Square plate, not a rounded pill, and the literal hexes rather
                than the nearest tokens: #0f7ab8 on #bae4f4 is the pair the
                design calls for, near enough to the selected nav tab below
                that the boxed word and the current tab read as one marker.
              */}
              <span className="inline-block bg-[#bae4f4] px-[0.12em] text-[#0f7ab8]">
                {parts.match}
              </span>
              {parts.after}
            </>
          ) : (
            blok.headline
          )}
        </h1>

        {blok.subline ? (
          // The narrower measure on the left arrangement makes the subline break
          // at its commas instead of mid-phrase, as the design draws it.
          <p
            className={`mt-6 text-lg leading-snug font-medium text-white/95 md:text-2xl ${
              left ? "max-w-sm" : "mx-auto max-w-xl"
            }`}
          >
            {blok.subline}
          </p>
        ) : null}
      </Container>

      {cards.length > 0 ? (
        // The mobile frame pins its dropdown 40px above the hero's bottom edge;
        // the desktop strip keeps its 32px.
        <Container width="wide" className="pb-10 lg:pb-8">
          <HeroNavCards cards={cards} placeholder={blok.nav_placeholder} />
        </Container>
      ) : null}
    </section>
  );
}
