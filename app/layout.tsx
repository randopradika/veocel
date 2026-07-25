import type { Metadata } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";

import { NewsletterBand } from "@/components/layout/NewsletterBand";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getConfig } from "@/lib/storyblok";

import "./globals.css";

/*
 * The design is set in a rounded geometric sans with all-lowercase headings.
 * Nunito is the closest widely available match — swap in the licensed brand face
 * here and the rest of the site follows, since everything reads the two CSS
 * variables below via `--font-display` / `--font-sans` in `globals.css`.
 */
const display = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const sans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VEOCEL™ — advancing to cellulosics",
    template: "%s | VEOCEL™",
  },
  description:
    "VEOCEL™ branded cellulosic fibers for beauty, body, hygiene and surface care — derived from nature, returning to nature.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Header, newsletter band and footer are identical on every page, so the config
  // story is fetched once here rather than per page.
  const config = await getConfig();

  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="flex min-h-svh flex-col">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand"
        >
          Skip to content
        </a>

        <SiteHeader config={config} />

        {/* The header is fixed and overlays the hero, so no top offset here. */}
        <main id="content" className="flex-1">
          {children}
        </main>

        <NewsletterBand config={config} />
        <SiteFooter config={config} />
      </body>
    </html>
  );
}
