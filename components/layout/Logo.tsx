/**
 * The VEOCEL wordmark, using the design file's own artwork — a colored version
 * for light grounds and a white one for dark photography. Both render stacked
 * and crossfade on `variant`, so the header's switch between its transparent
 * and solid appearances stays the same 300ms fade its colours make.
 *
 * The rasters are the "purely-you-logo" images the Figma frames carry, with
 * the "Purely for you" tagline cropped off — every placement in the design
 * crops it. The sources are 193px/341px wide: enough for these rendered sizes,
 * but replace with vector artwork if the logo ever needs to grow.
 *
 * Plain `<img>` on purpose: `next/image` runs every source through the
 * Storyblok image service loader, which cannot serve files from /public.
 */
export function Logo({
  variant = "dark",
  className = "",
}: {
  /** `light` is the white lockup for dark photography. */
  variant?: "dark" | "light";
  className?: string;
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/veocel-logo.png"
        alt=""
        width={193}
        height={53}
        className={`h-9 w-auto transition-opacity duration-300 ${
          variant === "dark" ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/veocel-logo-white.png"
        alt=""
        width={341}
        height={92}
        className={`absolute inset-0 h-9 w-auto transition-opacity duration-300 ${
          variant === "light" ? "opacity-100" : "opacity-0"
        }`}
      />
    </span>
  );
}
