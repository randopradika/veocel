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
  title: "text-h1 md:text-hero",
} as const;

/**
 * Storyblok sends `""` for an option field an editor never opened, and `??` does
 * not treat that as missing — the lookup missed, the class came out as the literal
 * string "undefined", and the home headline fell back to 16px body type. Resolve
 * through the map and fall back on anything it does not recognise.
 */
function resolveHeadlineSize(size: HeroBlok["headline_size"]): keyof typeof HEADLINE_SIZE {
  return size && size in HEADLINE_SIZE ? size : "display";
}

/**
 * Where the section headline breaks.
 *
 * Every section hero in the design is two lines with the break drawn in, not
 * wrapped: the text nodes carry `whitespace-nowrap` and one `<p>` per line
 * (2053:1127, 2053:989, 2053:854, 2053:385, 2053:260), and the fibers page goes
 * further and uses two separate nodes (2053:780 and 2053:782). Left to wrap,
 * the browser fills the first line and puts "explore VEOCEL™ / fibers" where
 * the design has "explore / VEOCEL™ fibers".
 *
 * So the break is chosen here rather than by the box: take the split that makes
 * the longer of the two lines as short as it can be, and prefer the evener one
 * where two splits tie. That reproduces the design on all seven section pages.
 *
 * A newline in the field wins outright — that is the escape hatch for a headline
 * whose break an editor wants to pin, and for translations, where balancing the
 * two halves is not going to land where a designer would put it.
 */
function headlineLines(headline: string): string[] {
  if (/\r?\n/.test(headline)) {
    return headline
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  const words = headline.trim().split(/\s+/);
  if (words.length < 2) return [headline.trim()];

  let best: { longest: number; spread: number; lines: string[] } | null = null;
  for (let i = 1; i < words.length; i++) {
    const first = words.slice(0, i).join(" ");
    const second = words.slice(i).join(" ");
    const longest = Math.max(first.length, second.length);
    const spread = Math.abs(first.length - second.length);
    if (!best || longest < best.longest || (longest === best.longest && spread < best.spread)) {
      best = { longest, spread, lines: [first, second] };
    }
  }

  return best!.lines;
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

/**
 * One line of the headline, with `highlight` boxed if it falls in this line.
 * Runs per line rather than over the whole headline so the plate survives the
 * break — on the fibers page the boxed word sits on the second line.
 */
function HeadlineLine({ text, highlight }: { text: string; highlight?: string }) {
  const parts = splitHeadline(text, highlight);
  if (!parts) return <>{text}</>;

  return (
    <>
      {parts.before}
      {/*
        Square plate, not a rounded pill, and the literal hexes rather than the
        nearest tokens: #0f7ab8 on #bae4f4 is the pair the design calls for,
        near enough to the selected nav tab below that the boxed word and the
        current tab read as one marker.
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
  );
}

export function Hero({ blok }: { blok: HeroBlok }) {
  const cards = blok.nav_cards ?? [];
  const left = blok.align === "left";
  const size = resolveHeadlineSize(blok.headline_size);
  const headlineSize = HEADLINE_SIZE[size];
  /*
    Only the section headline is broken in two. The home headline is one line at
    140px in the design (node 2053:1190) and balancing it would read "care /
    begins within."
  */
  const lines = size === "title" ? headlineLines(blok.headline) : [blok.headline];

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

      {/*
        `wide`, not the default column: the design centres the headline on the
        whole 1920 frame, and its longest drawn line — "with VEOCEL™ fibers" on
        node 2053:385 — measures 1156px at 128px. The 1200px column leaves 1120px
        of it, which is what pushed that headline onto a third line.
      */}
      <Container
        width="wide"
        className="flex flex-1 flex-col justify-center pt-32 pb-10 text-center text-white md:pt-40"
      >
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

          {/*
            A block per line, held to one line from `md` so the drawn break is
            the only break. Below `md` they are allowed to wrap again: no
            section hero has a mobile frame, and at 64px "with VEOCEL™ fibers"
            measures 578px, wider than the phone the design does draw.
          */}
          <h1 className={`font-bold ${headlineSize}`}>
            {lines.map((line, index) => (
              <span key={index} className="block md:whitespace-nowrap">
                {/*
                  The pale blue plate is off for now, whatever `headline_highlight`
                  a story carries — only the fibers hero sets it. Restore the prop
                  to bring the boxed word back.
                */}
                <HeadlineLine text={line} /* highlight={blok.headline_highlight} */ />
              </span>
            ))}
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
        /*
          The mobile frame pins its dropdown 40px above the hero's bottom edge;
          the desktop strip keeps its 32px.

          Not the shared `Container`: that caps at 1440px, which leaves the
          seven tabs 187px wide against the design's 215px and costs every
          label a third line. The strip keeps the site's 40px gutter but caps
          at its own drawn width (`max-w-[1565px]` in HeroNavCards), which at
          1920 centres it as the design does (node 2053:1192), unchanged.
          The margin is not a percentage below that: the labels are fixed sizes
          now, and every pixel of tab width is what keeps them on two lines.
        */
        <div className="mx-auto w-full px-6 pb-10 md:px-10 lg:pb-8">
          <HeroNavCards cards={cards} placeholder={blok.nav_placeholder} />
        </div>
      ) : null}
    </section>
  );
}
