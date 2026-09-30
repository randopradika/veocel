import type { HTMLAttributes, ReactNode } from "react";

/**
 * Page gutters and vertical rhythm.
 *
 * The design is built on a single centred column with wide margins and very
 * generous space between blocks. Both live here so spacing decisions are made in
 * one place rather than re-guessed per block.
 */

const WIDTHS = {
  /** Default content column. */
  default: "max-w-[1200px]",
  /** Slightly narrower, for long-form copy. */
  narrow: "max-w-[900px]",
  /** Edge-to-edge blocks that still want gutters on mobile. */
  wide: "max-w-[1440px]",
  /**
   * The design's own column: 1440px of content between 240px margins at 1920,
   * plus the 40px gutters. Every section page below the hero tabs sits on it
   * (wipes 2053:1040, hygiene 2053:904, beauty 2053:783, sustainability
   * 2053:474, partners 2053:247, fibers 2053:659), and so does the footer.
   */
  design: "max-w-[1520px]",
} as const;

export function Container({
  children,
  width = "default",
  className = "",
}: {
  children: ReactNode;
  width?: keyof typeof WIDTHS;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full px-6 md:px-10 ${WIDTHS[width]} ${className}`}>
      {children}
    </div>
  );
}

const SPACING = {
  default: "py-section-sm md:py-section",
  tight: "py-12 md:py-16",
  none: "",
} as const;

export function Section({
  children,
  spacing = "default",
  className = "",
  ...rest
}: {
  children: ReactNode;
  spacing?: keyof typeof SPACING;
  className?: string;
} & HTMLAttributes<HTMLElement>) {
  return (
    <section className={`${SPACING[spacing]} ${className}`} {...rest}>
      {children}
    </section>
  );
}
