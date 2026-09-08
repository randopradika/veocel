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
 *
 * The bar shows only at the top of the page. Scrolling down takes it away and it
 * stays away — a scroll back up does not summon it — until the reader returns to
 * the top, where it slides in again. That includes arriving part way down: a
 * refresh restores the reader's position, and the bar is not part of what they
 * come back to.
 */
/** Switch a little before the hero fully leaves, so type never sits on the seam. */
const HERO_EXIT_OFFSET = 96;

/** Back within this of the top counts as being at the top, and the bar returns. */
const REVEAL_WITHIN = 24;

/**
 * Past this the reader has committed to going down the page, and the bar goes with
 * them. The gap to `REVEAL_WITHIN` is hysteresis — a single boundary would let the
 * bar flicker in and out while they nudged around it.
 */
const RETRACT_BEYOND = 72;

type HeaderState = {
  /** Over a dark hero: transparent bar, white type. */
  overlay: boolean;
  /** Slid off the top because the reader has scrolled away from it. */
  retracted: boolean;
  /**
   * False while the markup on screen is still the server's guess at the two
   * above — see `SERVER_STATE`. The header carries it as `data-boot` so
   * `globals.css` can make that guess look right until the real measurement
   * arrives.
   */
  hydrated: boolean;
};

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

/**
 * Latched rather than derived, which is what separates this from `overlay`: in the
 * band between the two thresholds the bar keeps doing whatever it is already doing,
 * and that cannot be read back off a scroll position alone. Module scope rather
 * than a ref — the value describes the page, and there is one header on it.
 */
let isRetracted = false;

/**
 * Whether the reader is mid-interaction with the bar, in which case it stays put:
 * a focused control has to remain visible, and an open language menu should not be
 * pulled off the screen half way through choosing from it.
 *
 * Keyboard focus only — `:focus-visible`, not whatever holds `activeElement`. A
 * click leaves its target focused, so counting plain focus meant clicking in the
 * bar pinned it to the screen for the rest of the visit: click the lockup to go
 * home, scroll down, and the bar came along solid over the page, because the link
 * it had just navigated from was still the focused element. A mouse user has no
 * focus ring to lose when the bar leaves; a keyboard user does, and still keeps it.
 */
function headerIsBusy(): boolean {
  const header = document.querySelector("[data-site-header]");
  if (!header) return false;

  return (
    header.querySelector(":focus-visible") !== null ||
    header.querySelector('[aria-expanded="true"]') !== null
  );
}

function updateRetracted(): void {
  const y = Math.max(0, window.scrollY);

  // Between the two marks neither branch fires and the bar holds its ground.
  if (y > RETRACT_BEYOND) isRetracted = !headerIsBusy();
  else if (y < REVEAL_WITHIN) isRetracted = false;
}

/**
 * Cached because `useSyncExternalStore` compares snapshots by identity — a fresh
 * object per read would re-render forever. `overlay` is still measured on every
 * read rather than pushed in from the listener, so the backgrounded-tab reasoning
 * above still holds.
 */
let snapshot: HeaderState = { overlay: false, retracted: false, hydrated: true };

function readHeaderState(): HeaderState {
  const overlay = readOverlay();
  if (overlay === snapshot.overlay && isRetracted === snapshot.retracted) return snapshot;
  snapshot = { overlay, retracted: isRetracted, hydrated: true };
  return snapshot;
}

/**
 * The server has no scroll position and no DOM, so it renders the resting state:
 * shown, and solid because it cannot see whether a dark hero is under it. Both
 * halves are a guess, and both are wrong often enough to matter — every page but
 * search and 404 opens on a dark hero — so the markup marks itself `data-boot`
 * and `globals.css` corrects the appearance for the paint or two before this
 * component takes over.
 */
const SERVER_STATE: HeaderState = { overlay: false, retracted: false, hydrated: false };
const readServerHeaderState = (): HeaderState => SERVER_STATE;

function subscribeToScroll(onChange: () => void): () => void {
  let frame = 0;

  // rAF here only throttles change notifications; `overlay` itself is read
  // synchronously above, so a suspended frame loop cannot leave it stale.
  const schedule = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      updateRetracted();
      onChange();
    });
  };

  // Focus arriving in the bar — the skip link, or Tab from the top of the page —
  // must never land on something parked off-screen.
  const onFocusIn = (event: FocusEvent) => {
    if (!(event.target as Element | null)?.closest("[data-site-header]")) return;
    isRetracted = false;
    onChange();
  };

  // Read the position once, here, rather than waiting for a scroll event: the
  // browser restores it on a refresh before this listener exists, so a reader
  // who reloads half way down the page produces no scroll at all — and the bar
  // sat there, solid, across the middle of their page until they moved.
  updateRetracted();

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("focusin", onFocusIn);
  // The restore can also land *after* hydration — the document only reaches its
  // full height once the images are in — so take the reading again at load.
  window.addEventListener("load", schedule);
  // The hero can change height while the tab is hidden — images finishing load, a
  // font swapping — so re-measure when it comes back rather than trusting the last
  // value computed before it went away.
  document.addEventListener("visibilitychange", schedule);

  return () => {
    if (frame) window.cancelAnimationFrame(frame);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    window.removeEventListener("focusin", onFocusIn);
    window.removeEventListener("load", schedule);
    document.removeEventListener("visibilitychange", schedule);
  };
}

export function SiteHeader({ locales, locale }: { locales: Locale[]; locale: string }) {
  const { overlay, retracted, hydrated } = useSyncExternalStore(
    subscribeToScroll,
    readHeaderState,
    readServerHeaderState,
  );

  return (
    <header
      data-site-header
      // Dropped on the first client render, which is the point the appearance
      // stops being a guess. `globals.css` hangs the stand-in styling off it.
      data-boot={hydrated ? undefined : ""}
      // Padding, not a fixed height: over the hero the content sits at the frame's
      // 70/1920 offset (fluid, so it stays proportional at any width), then the bar
      // compacts once it turns solid so it doesn't blanket the page while scrolled.
      // On phones the mobile frame (2035:137) draws the lockup and the pill 26px
      // from the top, 1:1, so the offset is fixed below `md`.
      // The border is always present and only changes colour, so the switch never
      // shifts content by a pixel.
      // Retracting is a transform rather than a height or `top` change, so leaving
      // costs no layout and nothing underneath reflows as the bar comes and goes.
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[color,background-color,border-color,padding,transform] duration-300 motion-reduce:transition-none ${
        retracted ? "-translate-y-full" : "translate-y-0"
      } ${
        overlay
          ? "border-transparent pt-[26px] pb-4 text-white md:pt-[min(3.65vw,70px)] md:pb-6"
          : "border-hairline bg-white/95 py-3 text-brand backdrop-blur"
      }`}
    >
      {/* The frame top-aligns the lockup and the pill (both at y=70), not centres. */}
      <Container className="flex items-start justify-between gap-6">
        <Link
          href={localePath(locale, "")}
          // `flex` so the link hugs the artwork — as an inline box its own
          // line-height strut would add a phantom ~7px below the lockup, and the
          // bar's height is sized from this content.
          className="flex rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
          aria-label="VEOCEL — home"
        >
          {/* 40px on phones (the mobile frame's 141×40 lockup), 56px from `md`. */}
          <Logo variant={overlay ? "light" : "dark"} height="h-10 md:h-14" />
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
        // Marked so the header's pre-hydration styling can reach the one thing
        // on the pill that differs between the two appearances, its border.
        data-language-pill
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="language-menu"
        // A single language still shows the control, so the bar never looks like
        // it lost something — but there is nothing to choose.
        disabled={locales.length < 2}
        // Sized to the frame's 127×46 pill at 0.75: ~34px tall, 12px type at the
        // regular weight (Circular Book in the design), solid white in both states.
        // On phones the mobile frame draws it 1:1 instead — 117×40 with 16px type
        // and a 16px globe — so the pill and its glyphs step down at `md`.
        // The border also stays in both states (transparent over the hero) so the
        // pill never changes size when the header switches appearance.
        className={`flex h-10 items-center gap-1.5 rounded-full border px-4 text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current disabled:cursor-default md:h-auto md:py-2 md:text-[0.9375rem] ${
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
      className="h-4 w-4 md:h-3 md:w-3"
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
      className={`h-3 w-3 transition-transform duration-200 md:h-2.5 md:w-2.5 ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
