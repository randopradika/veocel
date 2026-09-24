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

/**
 * `title` is the `--text-hero` token (48/96) taken down an eighth to 42/84,
 * asked for on 2026-09-23 across every section page. The sizes are written out
 * here rather than folded into the token, because `--text-hero` is also what
 * `PageHero` and the `#ItsInOurHands` banner read, and those keep the drawn
 * size. Leading and tracking are the token's, spelled out alongside.
 */
const HEADLINE_SIZE = {
  display: "hero-display",
  title: "text-[2.625rem] leading-[1.09375] tracking-[-0.05em] md:text-[5.25rem]",
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
 * Where the headline block sits in the hero, picked per page in Storyblok
 * (added on request 2026-09-23). The defaults — centre, middle — are the layout
 * every frame draws, so a story that never sets them is unchanged.
 *
 * `x` places the block and aligns its lines to the same side; `text` is the
 * alignment the block's own lines take. Centre leaves both to the `align` field,
 * which is what hangs the home subline from the headline's left edge.
 */
const HEADLINE_X = {
  center: { block: "", text: "text-center" },
  left: { block: "mr-auto w-fit max-w-full", text: "text-left" },
  right: { block: "ml-auto w-fit max-w-full", text: "text-right" },
} as const;

const HEADLINE_Y = {
  middle: "justify-center",
  top: "justify-start",
  bottom: "justify-end",
} as const;

/** As `resolveHeadlineSize`: Storyblok's `""` and anything unknown fall back. */
function resolveOption<T extends object>(map: T, value: string | undefined, fallback: keyof T): keyof T {
  return value && value in map ? (value as keyof T) : fallback;
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
    Only the section headline is broken in two. The home headline is one line in
    the design (node 2053:1190), and still one line at the title size it was set
    to on 2026-09-23 — balancing it would read "care begins / within." The home
    hero is the left-aligned one, with the subline hanging from its edge.
  */
  const lines =
    size === "title" && !left ? headlineLines(blok.headline) : [blok.headline];
  const x = resolveOption(HEADLINE_X, blok.headline_horizontal, "center");
  const y = resolveOption(HEADLINE_Y, blok.headline_vertical, "middle");
  const placed = x !== "center";

  return (
    <section
      {...editable(blok)}
      // Read by SiteHeader to decide when to switch out of transparent mode.
      data-hero=""
      // Fills the screen, but no taller than 92% of the 1920×1080 frame: once
      // the page stops at 1920 (a wide screen, or zooming out), a screen-tall
      // hero would stay screen-tall while everything else shrank.
      //
      // On a desktop screen it is a picture instead: the frame's proportions at
      // any width, so the photograph and the stage over it (`.hero-stage`)
      // scale as one under browser zoom. `min-h-auto` lets a long translation
      // grow it rather than spill. It is also the container the stage measures.
      className="relative isolate flex min-h-[min(92svh,calc(1080px*0.92))] flex-col justify-center overflow-hidden bg-brand-800 desktop:@container desktop:aspect-[1920/994] desktop:min-h-auto"
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
        node 2053:385 — measures 1156px at the design's 128px. The 1200px column leaves 1120px
        of it, which is what pushed that headline onto a third line.
      */}
      {/*
        A headline placed left or right takes the header's column instead, so it
        ranges with the logo or the language pill rather than the window edge.
      */}
      {/*
        Everything over the photograph, as one stage: a pass-through column on
        phones and tablets, laid out at 1440 and zoomed to fit on a desktop
        screen (`.hero-stage` in globals.css).
      */}
      <div className="hero-stage flex flex-1 flex-col">
        <Container
          width={placed ? "default" : "wide"}
          className={`flex flex-1 flex-col ${HEADLINE_Y[y]} pt-32 pb-10 ${HEADLINE_X[x].text} text-white md:pt-40`}
        >
          {/*
            Both frames centre the headline; they part company under it. The phone
            frame centres the subline too, so below `md` this is an ordinary centred
            column. From `md` the block shrinks to the headline, which is what lets
            the subline hang from the headline's own left edge rather than sit
            centred under it (nodes 2053:1190 and 2053:1189 begin 10px apart, which
            is side bearings, not an indent).

            Neither headline is held to one line the way the frames draw them: at
            the sizes in `hero-display` the wrap falls where the design puts
            it anyway — after "begins" on the phone, nowhere on the desktop — and
            letting it happen naturally is what keeps a longer translation readable.
          */}
          <div className={placed ? HEADLINE_X[x].block : left ? "md:mx-auto md:w-fit" : undefined}>
            {blok.eyebrow ? (
              <p className="mb-3 text-sm font-medium text-white/85 md:text-base">{blok.eyebrow}</p>
            ) : null}

            {/*
              A block per line, so the drawn break is the only break wherever a
              line fits — which at 100% is every width from `md`. A line that no
              longer fits wraps rather than running off the page: the title is a
              fixed 96px, and browser zoom narrows the page under it. Held to one
              line at the design's 128px, "with VEOCEL™ fibers" (1150px) was cut
              off at 125% zoom on a 1440 laptop.
            */}
            <h1 className={`font-bold ${headlineSize}`}>
              {lines.map((line, index) => (
                <span key={index} className="block">
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
                className={`${
                  left
                    ? // `hero-subline` carries the size, measure and clearance the
                      // two frames give it; only the alignment differs between them.
                      "hero-subline font-normal text-white"
                    : "mt-6 max-w-xl text-lg leading-snug font-medium text-white/95 md:text-2xl"
                } ${
                  // A placed block takes its side for the subline too.
                  x === "left"
                    ? "mr-auto"
                    : x === "right"
                      ? "ml-auto"
                      : left
                        ? "mx-auto text-center md:mx-0 md:text-left"
                        : "mx-auto"
                }`}
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
            label a third line. The strip keeps the site's 40px gutter and
            centres tabs of a fixed width (see HeroNavCards), 1220px seven
            across — narrower than the design's 1565 at 1920 (node 2053:1192),
            the price of a strip that zooms with the page.
          */
          <div className="mx-auto w-full px-6 pb-10 md:px-10 lg:pb-8">
            <HeroNavCards cards={cards} placeholder={blok.nav_placeholder} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
