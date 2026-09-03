import Image from "next/image";

import { altText } from "@/lib/image";
import type { StoryblokAsset } from "@/lib/types";

/**
 * The single way images enter the page.
 *
 * Resizing is delegated to Storyblok's image service via the custom loader in
 * `lib/imageLoader.ts`, so Next doesn't re-optimise an already-optimised asset.
 *
 * When an asset is empty it renders a tinted placeholder instead of a broken
 * image — that's what makes the mock content in `lib/mock/` reviewable before any
 * photography has been uploaded.
 */

const TONE_CLASSES = {
  brand: "from-brand-300 to-brand-600",
  sky: "from-brand-100 to-brand-300",
  neutral: "from-hairline to-ink-faint/40",
} as const;

type BlockImageProps = {
  asset?: StoryblokAsset;
  /** Used when the asset has no alt text of its own. */
  alt?: string;
  sizes?: string;
  /**
   * Wrapper classes — set the aspect ratio and radius here.
   *
   * Must establish a containing block for the `fill` image, so always include
   * either `relative` or `absolute inset-0`. It isn't defaulted: hardcoding
   * `relative` would collide with `absolute` on full-bleed backgrounds, and
   * which of the two wins would depend on Tailwind's stylesheet order.
   */
  className?: string;
  imageClassName?: string;
  /** Set on above-the-fold imagery only. */
  priority?: boolean;
  placeholderLabel?: string;
  placeholderTone?: keyof typeof TONE_CLASSES;
};

export function BlockImage({
  asset,
  alt = "",
  sizes = "100vw",
  className = "",
  imageClassName = "object-cover",
  priority = false,
  placeholderLabel,
  placeholderTone = "sky",
}: BlockImageProps) {
  const filename = asset?.filename;

  if (!filename) {
    return (
      <div
        className={`overflow-hidden bg-gradient-to-br ${TONE_CLASSES[placeholderTone]} ${className}`}
        role="presentation"
      >
        {placeholderLabel ? (
          <span className="absolute inset-0 flex items-center justify-center px-4 text-center text-[0.9375rem] tracking-wide text-white/70">
            {placeholderLabel}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      <Image
        src={filename}
        alt={altText(asset, alt)}
        fill
        sizes={sizes}
        priority={priority}
        className={imageClassName}
      />
    </div>
  );
}
