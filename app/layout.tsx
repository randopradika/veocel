import type { Metadata } from "next";

import { CONSENT_BOOTSTRAP } from "@/lib/consent";
import { DEFAULT_LOCALE } from "@/lib/i18n";

import { circular } from "./fonts";
import "./globals.css";

/*
 * Document shell only. Everything locale-specific — header, footer, newsletter,
 * the page's own `lang` — lives in `app/[lang]/layout.tsx`, which is the first
 * layout that actually knows which language is being served. `<html>` carries
 * the default language, for what renders outside a locale (the 404) and for
 * tools that read only the root element; the locale layout overrides it.
 *
 * The brand face, Circular Std, is defined in `app/fonts`, where
 * `app/global-error.tsx` picks it up too.
 */

export const metadata: Metadata = {
  title: {
    default: "VEOCEL™ — care begins within",
    template: "%s | VEOCEL™",
  },
  description:
    "VEOCEL™ branded cellulosic fibers for beauty, body, hygiene and surface care — derived from nature, returning to nature.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // The body is capped at the design's width and centred (`max-w-page`), so
  // past 1920 — a wider screen, or zooming out — the page shrinks as one piece.
  // The fixed header carries the same cap: it is placed against the window.
  // `data-scroll-behavior` keeps the stylesheet's smooth scrolling to in-page
  // jumps: Next switches it off around a navigation, so a new page opens at its
  // top rather than gliding up from where the last one was left.
  //
  // The consent script (see `lib/consent.ts`) is a plain inline script in the
  // head, so it runs while the page is parsed, on every route. Not `next/script`'s
  // `beforeInteractive`: in the App Router that queues the script at the end of
  // the body for Next's async bootstrap to pick up, and a bootstrap that runs
  // before the parser gets there never sees it.
  return (
    <html lang={DEFAULT_LOCALE} className={circular.variable} data-scroll-behavior="smooth">
      <head>
        <script dangerouslySetInnerHTML={{ __html: CONSENT_BOOTSTRAP }} />
      </head>
      <body className="mx-auto flex min-h-svh w-full max-w-page flex-col">{children}</body>
    </html>
  );
}
