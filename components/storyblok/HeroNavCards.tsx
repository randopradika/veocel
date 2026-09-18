"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { resolveHref, SmartLink, useLocale } from "@/components/ui/SmartLink";
import { localePath } from "@/lib/i18n";
import type { HeroNavCardBlok } from "@/lib/types";

import { editable } from "./editable";

/**
 * The numbered shortcut cards along the bottom edge of the hero.
 *
 * A section landing page includes itself in this strip, so the card matching the
 * current URL fills in and carries `aria-current="page"` — the strip doubles as a
 * "you are here" marker for the section.
 *
 * That match is made from the pathname rather than from a field an editor sets:
 * the same strip is repeated across every page in a section, so a flag would have
 * to be re-pointed on each copy and would go stale the moment a slug changed.
 *
 * On a phone or tablet the strip collapses into the mobile frame's dropdown
 * (2035:137 / 2035:211): one pill naming the page you are on — or inviting you
 * to "select destination" where no card matches, as on the home page — that
 * opens the same list of links. It used to scroll sideways there, which left
 * five of the seven destinations off-screen.
 *
 * A mouse or trackpad keeps the cards at every width. Browser zoom narrows the
 * CSS viewport — Cmd + to 125% puts a 1440 laptop at 1152 — so a width
 * breakpoint alone swapped the cards for the pill as soon as a desktop reader
 * zoomed in. Width cannot tell a zoomed laptop from a tablet; the pointer can.
 * `pointer: fine` is a mouse or trackpad, the kind of screen that zooms by
 * resizing the viewport, where a pinch on a phone leaves the layout alone.
 */
export function HeroNavCards({
  cards,
  placeholder,
}: {
  cards: HeroNavCardBlok[];
  /** What the dropdown says when no card matches the page. */
  placeholder?: string;
}) {
  const pathname = usePathname();
  const locale = useLocale();

  const currentIndex = cards.findIndex((card) => {
    const href = resolveHref(card.link);
    // "/" would match every locale root, which is not a section marker.
    if (!href || href === "/") return false;
    return localePath(locale, href) === pathname;
  });

  return (
    <>
      <HeroNavDropdown cards={cards} currentIndex={currentIndex} placeholder={placeholder} />

      {/*
        `gap-2.5` is the design's 10px between tabs (nodes 2053:1230 and
        2053:1224 sit 225px apart on a 215px card).

        Seven across from `xl`. Narrower than that, seven tabs would squeeze
        the fixed-size labels below onto a third line, so the cards wrap
        instead — four to a row from `md`, two below it — and stay separate
        cards. Only a touch screen under `xl` swaps them for the dropdown.
      */}
      <ul className="mx-auto grid max-w-[1565px] grid-cols-2 gap-2.5 pb-1 md:grid-cols-4 xl:grid-cols-7 max-xl:not-pointer-fine:hidden">
        {cards.map((card, index) => {
          const current = index === currentIndex;
          /*
            Every tab is two lines in the design, and it buys the last two — the
            only ones over four words — a step of type to keep them there: 20px
            on nodes 2053:1195 and 2053:1201 against 22px everywhere else.
          */
          const long = card.label.trim().split(/\s+/).length > 4;

          return (
            <li key={card._uid}>
              <SmartLink
                link={card.link}
                current={current}
                /*
                  Figma "1 Menu Tab" (492:1152): the selected tab is a pale fill
                  with blue type, not a solid blue plate — `bg-[#bae4f4]` and
                  `text-[#4177b5]` there, taken here from the nearest tokens.
                  Hovering previews that same appearance, so the fill means one
                  thing across the strip: the page you are on, or the one you are
                  about to open.
                */
                className={`group flex h-full rounded-panel border border-white px-4 py-3.5 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  current ? "bg-brand-200 text-brand" : "text-white hover:bg-brand-200 hover:text-brand"
                }`}
              >
                <span {...editable(card)} className="flex flex-1 flex-col justify-between gap-6">
                  {/* Outlined on a plain tab, filled once the tab is selected. */}
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-sm leading-none text-white transition-colors duration-200 ${
                      current
                        ? "border-brand bg-brand"
                        : "border-white group-hover:border-brand group-hover:bg-brand"
                    }`}
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  {/*
                    Two lines, in fixed sizes that zoom with the page.

                    The size used to be a fraction of the tab (`cqw`). That held
                    the breaks at any width, but it also meant the labels never
                    grew under browser zoom, then jumped to the dropdown's 20px
                    when zoom crossed `xl`. Now there are three fixed steps, each
                    close to what the tab showed at 100% on the usual screens
                    and small enough to keep two lines in the narrowest tab it
                    gets: 16px (a 1440 laptop), 19px from `2xl`, and the design's
                    22px from `3xl`, its own 1920 width. The two longest labels
                    — the only ones over four words — go a step smaller, the
                    design's device for keeping them on two lines (20px on nodes
                    2053:1195 and 2053:1201 against 22px elsewhere), and a pixel
                    further here: "daily care products" wants 184px at 20px and
                    the tab gives it 181.

                    The breaks are held the way the fraction held them, as a
                    ratio: the label is capped at the width the design gives it
                    in ems — its 181px box over 22px, or over 19px for the long
                    pair — so it wraps where the 1920 frame does in any tab at
                    least that wide. Left to fill a wider tab it wraps late
                    ("explore VEOCEL™ / fibers"), and `text-wrap: balance`
                    splits "VEOCEL™ / fibers for wipes" even at 1920.

                    `min-h-[2.5455em]` is two lines at the design's 28/22
                    leading, which reserves the second line even for the one-word
                    tab — the design does the same with an empty first line on
                    node 2053:1207 — so all seven labels sit on a common
                    baseline, and `justify-end` puts that lone word on the lower
                    line. A minimum rather than a height, so a longer label
                    grows the tab instead of losing its third line.
                  */}
                  <span
                    className={`flex min-h-[2.5455em] flex-col justify-end leading-[1.2727] font-bold ${
                      long
                        ? "max-w-[9.53em] text-sm 2xl:text-base 3xl:text-[1.1875rem]"
                        : "max-w-[8.23em] text-base 2xl:text-[1.1875rem] 3xl:text-h3"
                    }`}
                  >
                    {card.label}
                  </span>
                </span>
              </SmartLink>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/**
 * The touch-screen form of the strip, under `xl`: a 64px pill (20px radius, white hairline)
 * with a 40px chevron disc, drawn as the frame does — outlined in white with
 * white type when nothing is selected, the strip's pale plate with blue type
 * and a filled disc when the page is in the list. The pill is drawn 1:1 from
 * the 402-wide frame: 20px bold type on a 30px line, 24px inset.
 *
 * The list opens upwards: the pill is pinned near the hero's bottom edge and
 * the hero clips its overflow, so a menu dropping below it would be cut off.
 * Closes on Escape, on an outside tap, and once a destination is chosen.
 *
 * A plain disclosure (button + list of links) rather than an ARIA menu: these
 * are ordinary links, and Tab already moves through them in order.
 */
function HeroNavDropdown({
  cards,
  currentIndex,
  placeholder,
}: {
  cards: HeroNavCardBlok[];
  currentIndex: number;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const current = currentIndex >= 0 ? cards[currentIndex] : undefined;

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

  return (
    <div ref={containerRef} className="relative hidden max-xl:not-pointer-fine:block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        aria-expanded={open}
        aria-controls={listId}
        // `min-h`, not a fixed height: a long label ("daily care products w/
        // VEOCEL™ fibers") wraps to two lines rather than being cut off.
        className={`flex min-h-16 w-full items-center justify-between gap-4 rounded-panel border border-white py-2 pr-5 pl-6 text-left text-xl leading-[1.5] font-bold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
          current ? "bg-brand-200 text-brand" : "text-white"
        }`}
      >
        <span>{current?.label ?? placeholder ?? "select destination"}</span>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-transform duration-200 ${
            open ? "rotate-180" : ""
          } ${current ? "border-brand bg-brand text-white" : "border-white text-white"}`}
          aria-hidden
        >
          <ChevronIcon />
        </span>
      </button>

      <ul
        id={listId}
        hidden={!open}
        className="absolute inset-x-0 bottom-full z-10 mb-2 overflow-hidden rounded-panel border border-hairline bg-white py-2 text-brand shadow-lg"
      >
        {cards.map((card, index) => {
          const isCurrent = index === currentIndex;

          return (
            // Bubbled from the link: choosing a destination closes the list, so it
            // is not left open when the hero re-renders on the next page.
            <li key={card._uid} onClick={() => setOpen(false)}>
              <SmartLink
                link={card.link}
                current={isCurrent}
                className={`flex items-center gap-3 px-5 py-3 text-base font-bold transition-colors hover:bg-brand-50 focus-visible:bg-brand-50 focus-visible:outline-none ${
                  isCurrent ? "bg-brand-200" : ""
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-brand text-sm leading-none ${
                    isCurrent ? "bg-brand text-white" : ""
                  }`}
                  aria-hidden
                >
                  {index + 1}
                </span>
                <span {...editable(card)}>{card.label}</span>
              </SmartLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** The frame's chevron (2035:158): a 14×7 stroke centred in the 40px disc. */
function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-full w-full"
      aria-hidden
    >
      <path d="M27 17 20 24l-7-7" />
    </svg>
  );
}
