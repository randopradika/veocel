"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Container } from "@/components/ui/Container";
import { resolveHref, SmartLink } from "@/components/ui/SmartLink";
import type { ConfigBlok } from "@/lib/types";

import { Logo } from "./Logo";

/**
 * Fixed header with two appearances: transparent white type over a dark hero, and
 * solid white with brand type once past it.
 *
 * Which one applies is decided by measuring the `[data-hero]` element that `Hero`
 * and `PageHero` mark — no prop threading from the page, and pages without a dark
 * hero simply start solid. Scroll work is throttled to one measurement per frame.
 */
export function SiteHeader({ config }: { config: ConfigBlok }) {
  const [overlay, setOverlay] = useState(false);
  const pathname = usePathname();

  /*
   * The mobile panel records *which* route it was opened on rather than a plain
   * boolean, so navigating away closes it as a consequence of the route change
   * instead of needing an effect to reset it.
   */
  const [openPath, setOpenPath] = useState<string | null>(null);
  const menuOpen = openPath === pathname;

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("[data-hero]");

    let frame = 0;
    const measure = () => {
      frame = 0;
      // Switch a little before the hero fully leaves, so type never sits on the seam.
      setOverlay(hero ? window.scrollY < hero.offsetHeight - 96 : false);
    };

    // Measured in a frame callback, never synchronously in the effect body —
    // a direct setState here would cascade an extra render on every navigation.
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    schedule();

    if (!hero) return () => window.cancelAnimationFrame(frame);

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  const transparent = overlay && !menuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        transparent ? "text-white" : "border-b border-hairline bg-white/95 text-brand backdrop-blur"
      }`}
    >
      <Container className="flex h-16 items-center justify-between gap-6 md:h-20">
        <Link
          href="/"
          className="rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
          aria-label="VEOCEL — home"
        >
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {(config.main_nav ?? []).map((item) => (
            <NavLink key={item._uid} href={resolveHref(item.link)} label={item.label} />
          ))}

          {(config.utility_nav ?? []).length > 0 ? (
            <span className="ml-1 flex items-center gap-5 border-l border-current/25 pl-6 text-xs opacity-80">
              {(config.utility_nav ?? []).map((item) => (
                <SmartLink
                  key={item._uid}
                  link={item.link}
                  className="transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
                >
                  {item.label}
                </SmartLink>
              ))}
            </span>
          ) : null}
        </nav>

        <button
          type="button"
          onClick={() => setOpenPath(menuOpen ? null : pathname)}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="-mr-2 flex h-10 w-10 items-center justify-center rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current md:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            className="h-6 w-6"
            aria-hidden
          >
            {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
          </svg>
        </button>
      </Container>

      <div
        id="site-menu"
        hidden={!menuOpen}
        className="border-t border-hairline bg-white text-brand md:hidden"
      >
        <Container className="flex flex-col gap-1 py-4">
          {[...(config.main_nav ?? []), ...(config.utility_nav ?? [])].map((item) => (
            <SmartLink
              key={item._uid}
              link={item.link}
              className="rounded px-1 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {item.label}
            </SmartLink>
          ))}
        </Container>
      </div>
    </header>
  );
}

function NavLink({ href, label }: { href: string | null; label: string }) {
  const className =
    "text-xs font-semibold transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current";

  if (!href) return <span className={className}>{label}</span>;

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}
