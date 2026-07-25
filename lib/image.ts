import type { StoryblokAsset } from "./types";

/**
 * Helpers for Storyblok's image service. Assets live on `a.storyblok.com` and
 * accept transforms appended to the path:
 *
 *   https://a.storyblok.com/f/<space>/<w>x<h>/<hash>/<file>.jpg/m/800x0/filters:quality(80)
 *
 * `0` in a dimension means "keep the aspect ratio".
 */

const STORYBLOK_ASSET_HOST = "a.storyblok.com";

export function isStoryblokAsset(filename?: string | null): boolean {
  return Boolean(filename && filename.includes(STORYBLOK_ASSET_HOST));
}

/** Natural pixel size, parsed out of the asset path. `null` for SVGs and non-Storyblok URLs. */
export function naturalSize(
  filename?: string | null,
): { width: number; height: number } | null {
  if (!filename) return null;
  const match = filename.match(/\/(\d+)x(\d+)\//);
  if (!match) return null;
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!width || !height) return null;
  return { width, height };
}

type TransformOptions = {
  width?: number;
  height?: number;
  quality?: number;
  /** Smart cropping keeps faces in frame — most of these images are portraits. */
  smart?: boolean;
  focus?: string | null;
};

/**
 * Builds a transformed asset URL. Returns the input untouched when the asset
 * isn't served by Storyblok (local files, SVG logos) since the service would 404.
 */
export function imageUrl(
  filename: string | undefined | null,
  { width = 0, height = 0, quality = 80, smart = true, focus }: TransformOptions = {},
): string {
  if (!filename) return "";
  if (!isStoryblokAsset(filename) || filename.endsWith(".svg")) return filename;

  const filters = [`quality(${quality})`];
  if (focus) filters.push(`focal(${focus})`);

  const crop = smart && width && height ? "/smart" : "";
  return `${filename}/m/${width}x${height}${crop}/filters:${filters.join(":")}`;
}

/** `srcSet` across the widths we actually lay out, so mobile doesn't pull a 2400px hero. */
export function imageSrcSet(
  filename: string | undefined | null,
  widths: number[] = [480, 768, 1024, 1440, 1920],
  options: Omit<TransformOptions, "width"> = {},
): string | undefined {
  if (!filename || !isStoryblokAsset(filename)) return undefined;
  return widths
    .map((width) => `${imageUrl(filename, { ...options, width })} ${width}w`)
    .join(", ");
}

/** Storyblok leaves `alt` empty more often than not; fall back to the title. */
export function altText(asset?: StoryblokAsset, fallback = ""): string {
  return asset?.alt?.trim() || asset?.title?.trim() || fallback;
}

export function hasImage(asset?: StoryblokAsset): boolean {
  return Boolean(asset?.filename);
}
