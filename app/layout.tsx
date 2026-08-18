import type { Metadata } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";

import "./globals.css";

/*
 * Document shell only. Everything locale-specific — header, footer, newsletter,
 * the `lang` attribute — lives in `app/[lang]/layout.tsx`, which is the first
 * layout that actually knows which language is being served.
 *
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
    default: "VEOCEL™ — care begins within",
    template: "%s | VEOCEL™",
  },
  description:
    "VEOCEL™ branded cellulosic fibers for beauty, body, hygiene and surface care — derived from nature, returning to nature.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${display.variable} ${sans.variable}`}>
      <body className="flex min-h-svh flex-col">{children}</body>
    </html>
  );
}
