import localFont from "next/font/local";

/*
 * Circular Std is the brand face and carries the whole site: display headlines
 * and body copy alike. It is self-hosted from this folder (converted to woff2
 * from the licensed OTFs) and exposed as one CSS variable, which `globals.css`
 * reads for both `--font-sans` and `--font-display`.
 *
 * It is defined once, here, because two documents carry it — the root layout
 * and `app/global-error.tsx`, which replaces that layout when it fails — and
 * every `localFont` call is hosted as a separate copy of the font.
 *
 * The family is static, not variable, so each face declares the weight range it
 * should answer for. Circular has no semibold, so 600 is served by Medium and
 * 800 by Bold — that keeps `font-semibold` a step below `font-bold` instead of
 * collapsing the two. Black (900) is unused by the site today; the file sits in
 * this folder and only needs an entry below to bring it in.
 */
export const circular = localFont({
  variable: "--font-circular",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  src: [
    { path: "./CircularStd-Book.woff2", weight: "400", style: "normal" },
    { path: "./CircularStd-BookItalic.woff2", weight: "400", style: "italic" },
    { path: "./CircularStd-Medium.woff2", weight: "500 600", style: "normal" },
    { path: "./CircularStd-Bold.woff2", weight: "700 800", style: "normal" },
    { path: "./CircularStd-BoldItalic.woff2", weight: "700 800", style: "italic" },
  ],
});
