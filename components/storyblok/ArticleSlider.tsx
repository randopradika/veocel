"use client";

import Link from "next/link";
import { useRef, useState, type KeyboardEvent, type TouchEvent } from "react";

import { BlockImage } from "@/components/ui/BlockImage";
import { Container } from "@/components/ui/Container";
import type { StoryblokAsset } from "@/lib/types";

import {
  ArrowGlyph,
  ArticleDate,
  ArticlePill,
  ArticleScrim,
  STRETCHED_LINK,
  TAGS_VISIBLE,
} from "./ArticleParts";

/** One article in the banner, flattened for the client. */
export type ArticleSlide = {
  id: string;
  href: string;
  title: string;
  /** The tag, shown as a pill beside the date. */
  category?: string;
  /** Storyblok's raw date, for `<time dateTime>`. */
  date?: string;
  /** The date as shown. */
  dateLabel: string;
  image?: StoryblokAsset;
  objectPosition?: string;
};

/** Sideways travel, in px, that counts as a swipe rather than a wobble. */
const SWIPE_THRESHOLD = 50;

/** The photograph's box — shared by the slide and the arrow overlay, so the discs centre on it. */
const PHOTO_BOX = "aspect-[16/10] md:aspect-[1439/570]";

/**
 * The hub's banner, frame 2082:361: the highlighted articles one at a time, each a
 * photograph inset in the column (1439×570, 30px corners) with its tag, date
 * and title beneath. Two 64px brand discs sit centred on the photograph's side
 * edges, hanging 28 and 32px past them as drawn — inside the edges on phones,
 * where the gutter is narrower than the overhang.
 *
 * The arrows, a swipe and the arrow keys all move it, wrapping at either end.
 * There is no autoplay, so nothing moves that the reader didn't move. Slides out
 * of view are `inert`, so Tab only reaches the one on screen, and a lone
 * article renders without arrows.
 *
 * Every slide's photograph loads with the first: the others sit off to the side
 * of a clipping box, where lazy loading would leave them blank as they slide in.
 */
export function ArticleSlider({ slides }: { slides: ArticleSlide[] }) {
  const [current, setCurrent] = useState(0);
  const touchStart = useRef<number | null>(null);
  const count = slides.length;
  const several = count > 1;

  const go = (step: number) => setCurrent((index) => (index + step + count) % count);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") go(-1);
    else if (event.key === "ArrowRight") go(1);
  };

  const onTouchStart = (event: TouchEvent) => {
    touchStart.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: TouchEvent) => {
    const start = touchStart.current;
    const end = event.changedTouches[0]?.clientX;
    touchStart.current = null;
    if (start === null || end === undefined || Math.abs(end - start) < SWIPE_THRESHOLD) return;
    go(end < start ? 1 : -1);
  };

  return (
    // 80px of tint between the header and the photograph, as the frame draws it.
    <Container width="wide" className="pt-8 md:pt-20">
      <section
        aria-roledescription="carousel"
        aria-label="Featured articles"
        onKeyDown={several ? onKeyDown : undefined}
        className="relative"
      >
        <div
          className="overflow-hidden"
          onTouchStart={several ? onTouchStart : undefined}
          onTouchEnd={several ? onTouchEnd : undefined}
        >
          <div
            aria-live={several ? "polite" : undefined}
            className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <article
                key={slide.id}
                role={several ? "group" : undefined}
                aria-roledescription={several ? "slide" : undefined}
                aria-label={several ? `${index + 1} of ${count}` : undefined}
                inert={index !== current}
                className="group relative w-full shrink-0"
              >
                <div className={`relative overflow-hidden rounded-3xl md:rounded-[30px] ${PHOTO_BOX}`}>
                  <BlockImage
                    asset={slide.image}
                    alt=""
                    priority
                    sizes="(min-width: 1440px) 1360px, 100vw"
                    className="absolute inset-0"
                    objectPosition={slide.objectPosition}
                  />
                  <ArticleScrim />
                </div>

                <div className="flex flex-wrap items-center gap-5 pt-6">
                  {/* With tags hidden the pill is left out, not kept as space: the date takes its place. */}
                  {TAGS_VISIBLE && slide.category ? (
                    <ArticlePill size="lg">{slide.category}</ArticlePill>
                  ) : null}
                  {slide.dateLabel ? (
                    <ArticleDate value={slide.date}>{slide.dateLabel}</ArticleDate>
                  ) : null}
                </div>

                <h2 className="mt-1 max-w-[1112px] text-h2 font-bold text-brand md:text-h1">
                  <Link
                    href={slide.href}
                    className={`${STRETCHED_LINK} focus-visible:after:-outline-offset-4`}
                  >
                    {slide.title}
                  </Link>
                </h2>
              </article>
            ))}
          </div>
        </div>

        {several ? (
          <div className={`pointer-events-none absolute inset-x-0 top-0 ${PHOTO_BOX}`}>
            <SlideButton direction="previous" onClick={() => go(-1)} />
            <SlideButton direction="next" onClick={() => go(1)} />
          </div>
        ) : null}
      </section>

      <div className="mt-10 border-t border-ink-faint md:mt-17" aria-hidden />
    </Container>
  );
}

/** The frame's 64px disc (2082:369, 2082:366), with the exported arrow on it. */
function SlideButton({
  direction,
  onClick,
}: {
  direction: "previous" | "next";
  onClick: () => void;
}) {
  const previous = direction === "previous";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={previous ? "Previous article" : "Next article"}
      className={`pointer-events-auto absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:h-16 md:w-16 ${
        previous ? "left-3 md:-left-7" : "right-3 md:-right-8"
      }`}
    >
      <ArrowGlyph direction={direction} />
    </button>
  );
}
