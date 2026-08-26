import type { ReactNode } from "react";

/**
 * The circular marker that recurs across the design: top-right of every image
 * card, at the end of each news row, and on the feature accordion.
 *
 * Rendered as a `<span>` by default because it almost always sits inside a link
 * or button that already owns the interaction — nesting a real `<button>` in an
 * `<a>` is invalid HTML. `FeatureAccordion` supplies its own `<button>` wrapper.
 */

const SIZES = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-11 w-11",
} as const;

const TONES = {
  /** Sitting on photography. */
  onImage: "bg-white/95 text-brand shadow-sm",
  /** Filled blue dot, as on the news rows. */
  brand: "bg-brand text-white",
  /** Hairline ring on a light surface, as on the accordion tiles. */
  outline: "border border-brand/35 bg-white text-brand",
  ghost: "border border-white/60 text-white",
} as const;

type IconName =
  | "arrow-right"
  | "arrow-down"
  | "plus"
  | "minus"
  | "chevron-down"
  | "chevron-up"
  | "close";

function Icon({ name }: { name: IconName }) {
  const common = {
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-[45%] w-[45%]",
    "aria-hidden": true,
  };

  switch (name) {
    case "arrow-down":
      return (
        <svg {...common}>
          <path d="M8 2.5v11M3.5 9.5 8 14l4.5-4.5" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M8 3v10M3 8h10" />
        </svg>
      );
    case "minus":
      return (
        <svg {...common}>
          <path d="M3 8h10" />
        </svg>
      );
    case "chevron-down":
      return (
        <svg {...common}>
          <path d="M4 6.5 8 10.5l4-4" />
        </svg>
      );
    case "chevron-up":
      return (
        <svg {...common}>
          <path d="M4 9.5 8 5.5l4 4" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
        </svg>
      );
  }
}

type ArrowMarkerProps = {
  icon?: IconName;
  tone?: keyof typeof TONES;
  size?: keyof typeof SIZES;
  className?: string;
};

export function ArrowMarker({
  icon = "arrow-right",
  tone = "onImage",
  size = "md",
  className = "",
}: ArrowMarkerProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105 ${SIZES[size]} ${TONES[tone]} ${className}`}
      aria-hidden
    >
      <Icon name={icon} />
    </span>
  );
}

/** Text link with a trailing marker — "join the movement →". */
export function ArrowTextLink({
  children,
  tone = "brand",
}: {
  children: ReactNode;
  tone?: keyof typeof TONES;
}) {
  return (
    <span className="group inline-flex items-center gap-3 text-sm font-semibold">
      {children}
      <ArrowMarker tone={tone} size="sm" />
    </span>
  );
}
