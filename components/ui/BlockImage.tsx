import Image, { getImageProps } from "next/image";
import type { CSSProperties, MouseEventHandler } from "react";

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

/** Where `mobileAsset` takes over: below Tailwind's `md`, the site's phone/desktop split. */
const MOBILE_MEDIA = "(width < 48rem)";

type BlockImageProps = {
  asset?: StoryblokAsset;
  /**
   * A separate crop for phones, swapped in below `md` through `<picture>` so a
   * phone downloads only its own file. Empty falls back to `asset`.
   */
  mobileAsset?: StoryblokAsset;
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
  /** Wrapper styles that can't be classes — an aspect ratio read off the asset. */
  style?: CSSProperties;
  imageClassName?: string;
  /** Where a cover crop anchors — `focusPosition(asset)` to follow the editor's focal point. */
  objectPosition?: string;
  /** Set on above-the-fold imagery only. */
  priority?: boolean;
  placeholderLabel?: string;
  placeholderTone?: keyof typeof TONE_CLASSES;
  /**
   * A soft deterrent against the one-click ways of lifting the image out of the
   * page — the browser's own "save image" on right-click and its built-in
   * drag-to-desktop. Neither stops a screenshot, which no code can; only for
   * the certificate pop-up (`CertificationTile`), where that's worth doing
   * anyway.
   */
  draggable?: boolean;
  onContextMenu?: MouseEventHandler<HTMLImageElement>;
};

export function BlockImage({
  asset,
  mobileAsset,
  alt = "",
  sizes = "100vw",
  className = "",
  style,
  imageClassName = "object-cover",
  objectPosition,
  priority = false,
  placeholderLabel,
  placeholderTone = "sky",
  draggable,
  onContextMenu,
}: BlockImageProps) {
  const mobileFilename = mobileAsset?.filename;
  // With only a mobile image set, it stands in at every width.
  const filename = asset?.filename || mobileFilename;

  if (!filename) {
    return (
      <div
        className={`overflow-hidden bg-gradient-to-br ${TONE_CLASSES[placeholderTone]} ${className}`}
        style={style}
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

  if (mobileFilename && mobileFilename !== filename) {
    const common = { alt: altText(asset, alt), fill: true, sizes, priority };
    const { props: mobile } = getImageProps({ ...common, src: mobileFilename });
    const { props: desktop } = getImageProps({ ...common, src: filename });

    return (
      <div className={`overflow-hidden ${className}`} style={style}>
        <picture>
          <source media={MOBILE_MEDIA} srcSet={mobile.srcSet} sizes={mobile.sizes} />
          <img
            {...desktop}
            alt={desktop.alt}
            className={imageClassName}
            style={objectPosition ? { ...desktop.style, objectPosition } : desktop.style}
            draggable={draggable}
            onContextMenu={onContextMenu}
          />
        </picture>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${className}`} style={style}>
      <Image
        src={filename}
        alt={altText(asset, alt)}
        fill
        sizes={sizes}
        priority={priority}
        className={imageClassName}
        style={objectPosition ? { objectPosition } : undefined}
        draggable={draggable}
        onContextMenu={onContextMenu}
      />
    </div>
  );
}
