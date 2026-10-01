import type { TextSize } from "@/lib/types";

/**
 * The copy sizes an editor can pick in Storyblok — a text block's body
 * (`body_size`) or a section's intro (`intro_size`). `regular` is the design's
 * 20/32 (2053:1041); each step keeps a smaller phone size and its own leading.
 */
export const TEXT_SIZE: Record<TextSize, string> = {
  small: "text-sm leading-[1.5] md:text-base md:leading-7",
  regular: "text-base leading-[1.4] md:text-xl xl:leading-8",
  large: "text-lg leading-[1.4] md:text-2xl md:leading-9",
  xlarge: "text-xl leading-[1.4] md:text-[2rem] md:leading-[1.6]",
};

/**
 * The size classes for a picked size. Storyblok's `""` and anything unknown
 * get `fallback` — the block's own setting, so an untouched field changes
 * nothing.
 */
export function textSizeClass(size: string | undefined, fallback: string): string {
  return size && size in TEXT_SIZE ? TEXT_SIZE[size as TextSize] : fallback;
}
