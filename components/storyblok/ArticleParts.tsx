import { isoDate } from "@/lib/date";

/**
 * Small pieces shared by the #ItsInOurHands hub, its banner slider, its pager
 * and the article: the photograph's shade, the tag pill, the date, the stretched
 * title link and the arrow. No hooks and nothing server-only, so the client-side slider
 * and pager can use them as well as the server components.
 */

/**
 * The frame's shade on every article photograph, hub and article alike: clear
 * to 61% of the height, 20% black by 89%.
 */
export function ArticleScrim() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 bg-gradient-to-b from-transparent from-60% to-black/20 to-90%"
    />
  );
}

/**
 * Whether the tag pills show. Off for now (2026-09-15). While off, a list row
 * still holds the pill's space, so its title stays where the frame draws it,
 * under the tag; the banner leaves the pill out altogether, so its date moves
 * into the pill's place. Set it to `true` to show the tags in both.
 */
export const TAGS_VISIBLE = false;

/**
 * An article's tag, 45px tall wherever it appears: 20px type in the banner, 16px
 * in the list. The frame's `#d8f4ff` plate is barely apart from the hub's ground,
 * so it steps to `brand-200` to still read as a pill on `brand-100`. While
 * `TAGS_VISIBLE` is off it renders `invisible` — keeping its space, and skipped
 * by screen readers.
 */
export function ArticlePill({ size, children }: { size: "lg" | "md"; children: string }) {
  return (
    <span
      className={`${TAGS_VISIBLE ? "" : "invisible "}inline-flex h-[45px] items-center rounded-full bg-brand-200 font-bold tracking-[-0.05em] text-ink ${
        size === "lg" ? "px-4.5 text-xl" : "px-5 text-base"
      }`}
    >
      {children}
    </span>
  );
}

export function ArticleDate({
  value,
  className = "",
  children,
}: {
  /** Storyblok's raw date, for `dateTime`. */
  value?: string;
  className?: string;
  children: string;
}) {
  return (
    <time
      dateTime={isoDate(value)}
      className={`text-base leading-[48px] tracking-[-0.05em] text-ink-muted ${className}`}
    >
      {children}
    </time>
  );
}

/**
 * A card's title link, stretched over the whole card so the photograph clicks
 * through without a second, duplicate link for screen readers. The focus ring
 * follows the card; add an outline offset — outside the card where there is
 * room, inside where the card sits in a clipping box.
 */
export const STRETCHED_LINK =
  "decoration-2 underline-offset-[0.12em] group-hover:underline after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-brand";

/**
 * The slider's arrow (2082:369, 2082:366): the exported paths in their 64px
 * grid, filling whatever box holds it. The disc behind it is the caller's own
 * fill — `#4177b5` in the frame, `brand` here.
 */
export function ArrowGlyph({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-full w-full"
      aria-hidden
    >
      <path
        d={
          direction === "previous"
            ? "M30.6667 25L24 32L30.6667 39M24 32L40 32"
            : "M33.3333 39L40 32L33.3333 25M40 32L24 32"
        }
      />
    </svg>
  );
}
