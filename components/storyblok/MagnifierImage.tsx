"use client";

import Image from "next/image";
import { useRef, useState, useSyncExternalStore } from "react";

import { altText, imageUrl } from "@/lib/image";
import type { StoryblokAsset } from "@/lib/types";

/**
 * Before/after image with a magnifying lens.
 *
 * Moving the pointer over the image shows a circular loupe containing the second
 * image, magnified — so a sheet mask can be shown going translucent exactly where
 * the reader is looking.
 *
 * Hover is not an interaction everyone has, so the lens is an enhancement rather
 * than the only way in:
 *   - fine pointer with hover  → lens follows the cursor
 *   - touch or keyboard        → activating the image swaps to the full second
 *                                image, and again to swap back
 *
 * The whole thing is a `<button>`, which is what makes it reachable by keyboard at
 * all — Enter and Space toggle it like any other control.
 */

/** Diameter of the loupe, in CSS pixels. */
const LENS_SIZE = 190;

/** How much the revealed image is enlarged inside the loupe. */
const ZOOM = 2;

/** Wide enough that the magnified layer still looks sharp at 2x. */
const REVEAL_WIDTH = 1800;

const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

/**
 * Tracks pointer capability reactively — a laptop with a touchscreen can gain or
 * lose a mouse mid-session.
 *
 * `useSyncExternalStore` rather than an effect: it has a server snapshot (false,
 * so the server never renders a lens) and needs no state write during render.
 */
function useHoverCapablePointer(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(HOVER_QUERY);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(HOVER_QUERY).matches,
    () => false,
  );
}

type LensState = { x: number; y: number; width: number; height: number };

export function MagnifierImage({
  base,
  reveal,
  alt,
  sizes = "(max-width: 768px) 100vw, 50vw",
  className = "",
}: {
  base: StoryblokAsset;
  reveal: StoryblokAsset;
  alt?: string;
  sizes?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLButtonElement>(null);
  const [lens, setLens] = useState<LensState | null>(null);
  const [showFullReveal, setShowFullReveal] = useState(false);
  const canHover = useHoverCapablePointer();

  const revealUrl = imageUrl(reveal.filename, {
    width: REVEAL_WIDTH,
    quality: 85,
    smart: false,
  });

  function trackPointer(event: React.MouseEvent<HTMLButtonElement>) {
    const element = containerRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    setLens({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    });
  }

  const lensVisible = canHover && lens !== null && !showFullReveal;

  return (
    <button
      ref={containerRef}
      type="button"
      onClick={() => setShowFullReveal((shown) => !shown)}
      onMouseMove={canHover ? trackPointer : undefined}
      onMouseLeave={() => setLens(null)}
      aria-pressed={showFullReveal}
      aria-label={showFullReveal ? "Show the original image" : "Reveal the comparison image"}
      className={`group relative block w-full overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${className}`}
    >
      <Image
        src={base.filename}
        alt={altText(base, alt)}
        fill
        sizes={sizes}
        className="object-cover"
      />

      {/* Full swap — the touch and keyboard equivalent of the lens. */}
      <Image
        src={reveal.filename}
        alt=""
        fill
        sizes={sizes}
        aria-hidden={!showFullReveal}
        className={`object-cover transition-opacity duration-300 motion-reduce:transition-none ${
          showFullReveal ? "opacity-100" : "opacity-0"
        }`}
      />

      {lensVisible ? (
        <span
          aria-hidden
          className="pointer-events-none absolute rounded-full border-2 border-white/85 shadow-[0_8px_28px_rgba(0,0,0,0.28)]"
          style={{
            width: LENS_SIZE,
            height: LENS_SIZE,
            left: lens.x - LENS_SIZE / 2,
            top: lens.y - LENS_SIZE / 2,
            backgroundImage: `url("${revealUrl}")`,
            /*
             * The background is the revealed image scaled to the container's size
             * times the zoom, then offset so the point under the cursor sits at the
             * centre of the loupe.
             */
            backgroundSize: `${lens.width * ZOOM}px ${lens.height * ZOOM}px`,
            backgroundPosition: `${LENS_SIZE / 2 - lens.x * ZOOM}px ${
              LENS_SIZE / 2 - lens.y * ZOOM
            }px`,
            backgroundRepeat: "no-repeat",
          }}
        />
      ) : null}

      {/* Hint, so the interaction is discoverable rather than hidden. */}
      <span
        aria-hidden
        className={`pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1.5 text-[0.7rem] whitespace-nowrap text-white transition-opacity duration-200 motion-reduce:transition-none ${
          lensVisible ? "opacity-0" : "opacity-100"
        }`}
      >
        {canHover ? "hover to compare" : "tap to compare"}
      </span>
    </button>
  );
}
