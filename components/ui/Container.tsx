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
