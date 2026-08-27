import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

/*
 * Document shell only. Everything locale-specific — header, footer, newsletter,
 * the `lang` attribute — lives in `app/[lang]/layout.tsx`, which is the first
 * layout that actually knows which language is being served.
 *
 * Circular Std is the brand face and carries the whole site: display headlines
 * and body copy alike. It is self-hosted from `app/fonts` (converted to woff2
 * from the licensed OTFs) and exposed as one CSS variable, which `globals.css`
 * reads for both `--font-sans` and `--font-display`.
 *
 * The family is static, not variable, so each face declares the weight range it
 * should answer for. Circular has no semibold, so 600 is served by Medium and
 * 800 by Bold — that keeps `font-semibold` a step below `font-bold` instead of
 * collapsing the two. Black (900) is unused by the site today; the file sits in
 * `app/fonts` and only needs an entry below to bring it in.
 */
const circular = localFont({
  variable: "--font-circular",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  src: [
    { path: "./fonts/CircularStd-Book.woff2", weight: "400", style: "normal" },
    { path: "./fonts/CircularStd-BookItalic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/CircularStd-Medium.woff2", weight: "500 600", style: "normal" },
    { path: "./fonts/CircularStd-Bold.woff2", weight: "700 800", style: "normal" },
    { path: "./fonts/CircularStd-BoldItalic.woff2", weight: "700 800", style: "italic" },
  ],
});

export const metadata: Metadata = {
  title: {
    default: "VEOCEL™ — care begins within",
    template: "%s | VEOCEL™",
  },
  description:
    "VEOCEL™ branded cellulosic fibers for beauty, body, hygiene and surface care — derived from nature, returning to nature.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={circular.variable}>
      <body className="flex min-h-svh flex-col">{children}</body>
    </html>
  );
}
