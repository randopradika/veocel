"use client";

import { usePathname } from "next/navigation";

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
 */
export function HeroNavCards({ cards }: { cards: HeroNavCardBlok[] }) {
  const pathname = usePathname();
  const locale = useLocale();

  function isCurrent(card: HeroNavCardBlok): boolean {
    const href = resolveHref(card.link);
    // "/" would match every locale root, which is not a section marker.
    if (!href || href === "/") return false;
    return localePath(locale, href) === pathname;
  }

  return (
    /*
      Scrolls sideways on narrow screens rather than wrapping into a tall stack
      that would push the headline off the fold.
    */
    <ul className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 lg:grid lg:grid-cols-7 lg:overflow-visible">
      {cards.map((card, index) => {
        const current = isCurrent(card);

        return (
          <li key={card._uid} className="w-52 shrink-0 snap-start lg:w-auto">
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
                  className={`flex h-5 w-5 items-center justify-center rounded-full border text-[0.6rem] leading-none text-white transition-colors duration-200 ${
                    current
                      ? "border-brand bg-brand"
                      : "border-white group-hover:border-brand group-hover:bg-brand"
                  }`}
                  aria-hidden
                >
                  {index + 1}
                </span>
                <span className="text-[0.95rem] leading-[1.27] font-bold">{card.label}</span>
              </span>
            </SmartLink>
          </li>
        );
      })}
    </ul>
  );
}
