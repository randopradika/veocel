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
 * `align: left` is the home arrangement drawn in node 2053:1175: the headline
 * stays centred on the page, the block shrinks to it, and the subline is
 * left-aligned so it hangs from the headline's own left edge instead of being
 * centred under it.
 *
 * `headline_highlight` names a run of the headline to sit on a pale blue plate —
 * the fibers page boxes its last word that way.
 */

const HEADLINE_SIZE = {
  display: "text-display-fluid",
  title: "text-h1 md:text-[4.5rem] md:leading-[1.05]",
} as const;

/**
 * Storyblok sends `""` for an option field an editor never opened, and `??` does
 * not treat that as missing — the lookup missed, the class came out as the literal
 * string "undefined", and the home headline fell back to 16px body type. Resolve
 * through the map and fall back on anything it does not recognise.
 */
function headlineSizeClass(size: HeroBlok["headline_size"]): string {
  return (size && HEADLINE_SIZE[size]) || HEADLINE_SIZE.display;
}

/**
 * Splits the headline around `highlight` so the matched run can be boxed. The
 * first occurrence only, and nothing at all when the run isn't there — editors
 * rename headlines without touching this field.
 *
 * The run does not have to be a whole word: the fibers page boxes "fiber" and
 * leaves the "s" outside. `padded` reports which sides of the plate may carry
 * breathing room — a side that runs into the rest of a word takes none, or the
 * padding would open a gap mid-word.
 */
function splitHeadline(headline: string, highlight?: string) {
  const at = highlight ? headline.indexOf(highlight) : -1;
  if (at < 0 || !highlight) return null;

  const before = headline.slice(0, at);
  const after = headline.slice(at + highlight.length);

  return {
    before,
    match: headline.slice(at, at + highlight.length),
    after,
    padded: {
      left: before === "" || /\s$/.test(before),
      right: after === "" || /^\s/.test(after),
    },
  };
}

export function Hero({ blok }: { blok: HeroBlok }) {
  const cards = blok.nav_cards ?? [];
  const left = blok.align === "left";
  const parts = splitHeadline(blok.headline, blok.headline_highlight);
  const headlineSize = headlineSizeClass(blok.headline_size);

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

      {/*
        The scrim the design draws over the photograph: nothing at the top, easing
        to 20% black by 82% of the way down, so it weights the bottom edge where
        the nav cards sit and leaves the picture alone up top. Both frames use it.
      */}
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(0,0,0,0.2)_82.212%)]"
        aria-hidden
      />

      <Container className="flex flex-1 flex-col justify-center pt-32 pb-10 text-center text-white md:pt-40">
        {/*
          Both frames centre the headline; they part company under it. The phone
          frame centres the subline too, so below `md` this is an ordinary centred
          column. From `md` the block shrinks to the headline, which is what lets
          the subline hang from the headline's own left edge rather than sit
          centred under it (nodes 2053:1190 and 2053:1189 begin 10px apart, which
          is side bearings, not an indent).

          Neither headline is held to one line the way the frames draw them: at
          the sizes in `text-display-fluid` the wrap falls where the design puts
          it anyway — after "begins" on the phone, nowhere on the desktop — and
          letting it happen naturally is what keeps a longer translation readable.
        */}
        <div className={left ? "md:mx-auto md:w-fit" : undefined}>
          {blok.eyebrow ? (
            <p className="mb-3 text-sm font-medium text-white/85 md:text-base">{blok.eyebrow}</p>
          ) : null}

          <h1 className={`font-bold ${headlineSize}`}>
            {parts ? (
              <>
                {parts.before}
                {/*
                  Square plate, not a rounded pill, and the literal hexes rather
                  than the nearest tokens: #0f7ab8 on #bae4f4 is the pair the
                  design calls for, near enough to the selected nav tab below
                  that the boxed word and the current tab read as one marker.
                */}
                <span
                  className={`inline-block bg-[#bae4f4] text-[#0f7ab8] ${
                    parts.padded.left ? "pl-[0.12em]" : ""
                  } ${parts.padded.right ? "pr-[0.12em]" : ""}`}
                >
                  {parts.match}
                </span>
                {parts.after}
              </>
            ) : (
              blok.headline
            )}
          </h1>

          {blok.subline ? (
            <p
              className={
                left
                  ? // `hero-subline` carries the size, measure and clearance the
                    // two frames give it; only the alignment differs between them.
                    "hero-subline mx-auto text-center font-normal text-white md:mx-0 md:text-left"
                  : "mx-auto mt-6 max-w-xl text-lg leading-snug font-medium text-white/95 md:text-2xl"
              }
            >
              {blok.subline}
            </p>
          ) : null}
        </div>
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
