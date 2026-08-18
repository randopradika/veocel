"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Container } from "@/components/ui/Container";
import { localePath, splitLocale, type Locale } from "@/lib/i18n";

import { Logo } from "./Logo";

/**
 * Fixed header: the lockup on the left, the language picker on the right.
 *
 * There are no nav links by design — the hero's numbered cards carry navigation,
 * so the bar stays out of the way of the photography.
 *
 * Two appearances: transparent with white type over a dark hero, solid white with
 * brand type once past it. Which one applies is decided by measuring the
 * `[data-hero]` element that `Hero` and `PageHero` mark, so no prop threading from
 * the page and pages without a dark hero simply start solid.
 */
export function SiteHeader({
  locales,
  locale,
}: {
  locales: Locale[];
  locale: string;
}) {
  const [overlay, setOverlay] = useState(false);
  const pathname = usePathname();

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

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        overlay ? "text-white" : "border-b border-hairline bg-white/95 text-brand backdrop-blur"
      }`}
    >
      <Container className="flex h-16 items-center justify-between gap-6 md:h-20">
        <Link
          href={localePath(locale, "")}
          className="rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
          aria-label="VEOCEL — home"
        >
          <Logo />
        </Link>

        <LanguagePicker locales={locales} current={locale} overlay={overlay} />
      </Container>
    </header>
  );
}

/**
 * Language menu.
 *
 * A disclosure button over a list of links, not a `<select>`: each language is a
 * real URL, so it can be opened in a new tab, bookmarked and crawled. Closes on
 * Escape and on outside click, returning focus to the button when dismissed by
 * keyboard.
 */
function LanguagePicker({
  locales,
  current,
  overlay,
}: {
  locales: Locale[];
  current: string;
  overlay: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname() ?? "/";

  // The path without its language prefix, so switching keeps you on the same page.
  const { path } = splitLocale(
    pathname,
    locales.map((entry) => entry.code),
  );

  const active = locales.find((entry) => entry.code === current) ?? locales[0];

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (locales.length === 0) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="language-menu"
        // A single language still shows the control, so the bar never looks like
        // it lost something — but there is nothing to choose.
        disabled={locales.length < 2}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current disabled:cursor-default ${
          overlay
            ? "bg-white/95 text-brand hover:bg-white"
            : "border border-hairline bg-white text-brand hover:border-brand/40"
        }`}
      >
        <GlobeIcon />
        <span>{active?.label}</span>
        {locales.length > 1 ? <ChevronIcon open={open} /> : null}
      </button>

      <ul
        id="language-menu"
        role="menu"
        hidden={!open}
        className="absolute right-0 z-10 mt-2 min-w-[10rem] overflow-hidden rounded-xl border border-hairline bg-white py-1 text-brand shadow-lg"
      >
        {locales.map((entry) => {
          const isCurrent = entry.code === current;
          return (
            <li key={entry.code} role="none">
              <Link
                role="menuitem"
                href={localePath(entry.code, path)}
                hrefLang={entry.code}
                aria-current={isCurrent ? "true" : undefined}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2 text-sm transition-colors hover:bg-brand-50 focus-visible:bg-brand-50 focus-visible:outline-none ${
                  isCurrent ? "font-semibold" : ""
                }`}
              >
                {entry.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-4 w-4"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
