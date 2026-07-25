import { BlockImage } from "@/components/ui/BlockImage";
import { Container } from "@/components/ui/Container";
import type { HeroBlok } from "@/lib/types";

import { editable } from "./editable";

/**
 * Full-bleed opening hero: sky photography, a very large lowercase headline, and
 * a scroll cue. The bottom third fades to white so the clouds resolve into the
 * white section that follows, as in the design.
 */
export function Hero({ blok }: { blok: HeroBlok }) {
  return (
    <section
      {...editable(blok)}
      // Read by SiteHeader to decide when to switch out of transparent mode.
      data-hero=""
      className="relative isolate flex min-h-[88svh] items-center justify-center overflow-hidden bg-brand-300"
    >
      <BlockImage
        asset={blok.background_image}
        alt={blok.headline}
        priority
        sizes="100vw"
        className="absolute inset-0 -z-10"
        placeholderTone="brand"
      />

      {/* Resolves the image into the white page below. */}
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-b from-transparent to-white"
        aria-hidden
      />

      <Container className="py-32 text-center text-white">
        {blok.eyebrow ? (
          <p className="mb-3 text-sm font-medium tracking-[0.02em] text-white/85 md:text-base">
            {blok.eyebrow}
          </p>
        ) : null}

        <h1 className="text-display-fluid font-bold drop-shadow-[0_2px_18px_rgba(0,0,0,0.15)]">
          {blok.headline}
        </h1>

        {blok.subline ? (
          <p className="mt-5 text-sm font-medium text-white/90 md:text-base">{blok.subline}</p>
        ) : null}
      </Container>

      {blok.scroll_hint ? (
        <div className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-2 text-[0.7rem] tracking-[0.12em] text-white/70">
          <span>{blok.scroll_hint}</span>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.2}
            strokeLinecap="round"
            className="h-4 w-4 animate-bounce"
            aria-hidden
          >
            <path d="M8 2v11M3.5 8.5 8 13l4.5-4.5" />
          </svg>
        </div>
      ) : null}
    </section>
  );
}
