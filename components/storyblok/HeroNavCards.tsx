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
 * Below `xl` seven cards cannot sit side by side, so the strip collapses into
 * the mobile frame's dropdown (2035:137 / 2035:211): one pill naming the page
 * you are on — or inviting you to "select destination" where no card matches,
 * as on the home page — that opens the same list of links. It used to scroll
 * sideways there, which left five of the seven destinations off-screen.
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

        Seven across only from `xl`, where it used to be `lg`. The label sizing
        below is a fixed fraction of the tab, which is what holds the two lines
        steady, but it also means a narrow strip buys narrow type: at 1024 the
        tabs are 111px and the labels land near 11px. The dropdown is the
        design's own answer at that width, so it now covers everything under
        1280 rather than everything under 1024.
      */}
      <ul className="mx-auto hidden max-w-[1565px] gap-2.5 pb-1 xl:grid xl:grid-cols-7">
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
                className={`group flex h-full rounded-panel border border-white px-4 py-3.5 [container-type:inline-size] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
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
                    Two lines, always, and pinned to the same place at every
                    zoom level.

                    The size is a fraction of the tab rather than a px value:
                    `container-type: inline-size` on the tab makes `cqw` 1% of
                    its content box, and the design's ratio is 22px of type in a
                    176px label box (12.5%). Holding that ratio is what fixes
                    the line breaks — the browser wraps on the type-to-box
                    ratio, so keeping it constant keeps the break identical at
                    any tab width. Zooming changes the CSS viewport, which would
                    otherwise re-wrap a px-sized label; here it cannot, because
                    the gutters on the strip are a percentage too.

                    Deliberately a bare ratio, with no `clamp()` around it.
                    Any bound on the type re-wraps the label the moment it
                    binds: a lower bound pinned the type while the tab kept
                    shrinking and pushed a third line at 1280, and an upper one
                    pinned it while the tab kept growing, which moved the break
                    to "explore VEOCEL™ / fibers" by 2560. The size is bounded
                    by the strip's own `max-w-[1565px]` instead — the design's
                    width at 1920 — so past that width nothing moves at all,
                    and below it the ratio holds. 22px is the ceiling either
                    way, and the break never shifts.

                    `h-[2.5455em]` is two lines at the design's 28/22 leading,
                    which reserves the second line even for the one-word tab —
                    the design does the same with an empty first line on node
                    2053:1207 — so all seven labels sit on a common baseline.
                    `justify-end` is what puts that lone word on the lower line.
                  */}
                  <span
                    className={`flex h-[2.5455em] flex-col justify-end overflow-hidden leading-[1.2727] font-bold ${
                      long
                        ? "text-[10.4cqw]"
                        : "text-[12.2cqw]"
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
 * The phone-width form of the strip: a 64px pill (20px radius, white hairline)
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
    <div ref={containerRef} className="relative xl:hidden">
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
