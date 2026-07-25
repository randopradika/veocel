import { imageUrl } from "./image";

/**
 * Custom `next/image` loader, wired up in `next.config.ts`.
 *
 * Storyblok already runs a capable image service, so resizing happens there
 * rather than in Next's optimiser — no double processing and no image
 * transformation quota. Anything that isn't a Storyblok asset (local SVG logos,
 * for instance) is passed through untouched.
 *
 * Must be a default-exported function: Next imports this file by path.
 */
export default function storyblokImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  return imageUrl(src, { width, quality: quality ?? 80, smart: false });
}
