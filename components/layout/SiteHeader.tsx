"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

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
/** Switch a little before the hero fully leaves, so type never sits on the seam. */
const HERO_EXIT_OFFSET = 96;

/**
 * Whether the header is currently over a dark hero.
 *
 * Read during render rather than written from an effect. An effect that measured
 * inside `requestAnimationFrame` looked equivalent but was not: rAF is suspended in
 * a backgrounded tab, so a page opened in one kept a white bar over its hero until
 * the tab was focused and scrolled. Reading synchronously also removes the flash of
 * solid header on every load.
 */
function readOverlay(): boolean {
  const hero = document.querySelector<HTMLElement>("[data-hero]");
  return hero ? window.scrollY < hero.offsetHeight - HERO_EXIT_OFFSET : false;
}

function subscribeToScroll(onChange: () => void): () => void {
  let frame = 0;

  // rAF here only throttles change notifications; the value itself is read
  // synchronously above, so a suspended frame loop cannot leave state stale.
  const schedule = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      onChange();
    });
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  // The hero can change height while the tab is hidden — images finishing load, a
  // font swapping — so re-measure when it comes back rather than trusting the last
  // value computed before it went away.
  document.addEventListener("visibilitychange", schedule);

  return () => {
    if (frame) window.cancelAnimationFrame(frame);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    document.removeEventListener("visibilitychange", schedule);
  };
}

export function SiteHeader({ locales, locale }: { locales: Locale[]; locale: string }) {
  // The server has no scroll position and no DOM, so it renders the solid state.
  const overlay = useSyncExternalStore(subscribeToScroll, readOverlay, () => false);

  return (
    <header
      // Padding, not a fixed height: over the hero the content sits at the frame's
      // 70/1920 offset (fluid, so it stays proportional at any width), then the bar
      // compacts once it turns solid so it doesn't blanket the page while scrolled.
      // The border is always present and only changes colour, so the switch never
      // shifts content by a pixel.
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[color,background-color,border-color,padding] duration-300 ${
        overlay
          ? "border-transparent pt-4 pb-4 text-white md:pt-[min(3.65vw,70px)] md:pb-6"
          : "border-hairline bg-white/95 py-3 text-brand backdrop-blur"
      }`}
    >
      {/* The frame top-aligns the lockup and the pill (both at y=70), not centres. */}
      <Container className="flex items-start justify-between gap-6">
        <Link
          href={localePath(locale, "")}
          // `flex` so the link hugs the 56px artwork — as an inline box its own
          // line-height strut would add a phantom ~7px below the lockup, and the
          // bar's height is sized from this content.
          className="flex rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
          aria-label="VEOCEL — home"
        >
          <Logo variant={overlay ? "light" : "dark"} />
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
        // Sized to the frame's 127×46 pill at 0.75: ~34px tall, 12px type at the
        // regular weight (Circular Book in the design), solid white in both states.
        // The border also stays in both states (transparent over the hero) so the
        // pill never changes size when the header switches appearance.
        className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current disabled:cursor-default ${
          overlay
            ? "border-transparent bg-white text-brand hover:bg-brand-50"
            : "border-hairline bg-white text-brand hover:border-brand/40"
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
      className="h-3 w-3"
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
      className={`h-2.5 w-2.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
