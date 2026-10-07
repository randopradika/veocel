import Link from "next/link";

import { BlockImage } from "@/components/ui/BlockImage";
import { Container } from "@/components/ui/Container";
import { SmartLink } from "@/components/ui/SmartLink";
import { DEFAULT_LOCALE, localePath } from "@/lib/i18n";
import type { ConfigBlok } from "@/lib/types";

import { Logo } from "./Logo";

/**
 * Footer: lockup and site search on one row, the parent-company mark beneath, and
 * a legal row along the bottom.
 *
 * On phones the mobile frame (2035:191) reorders it: the search row first, the
 * lockup beneath, the Lenzing mark right-aligned (left in the frame; moved on
 * the client's request, 2026-10-07), a full-bleed rule, the legal
 * links in one 16px row, and the copyright centred under them.
 *
 * The search form is a plain GET to `/search`, so it works without JavaScript and
 * the query stays in the URL — shareable and back-button friendly.
 *
 * `footer_columns` still renders when the config story provides them; the current
 * design simply has none.
 */
export function SiteFooter({
  config,
  locale = DEFAULT_LOCALE,
}: {
  config: ConfigBlok;
  locale?: string;
}) {
  const columns = config.footer_columns ?? [];
  const legal = config.legal_links ?? [];

  return (
    // From `md` the desktop frame (2053:732) as drawn: its #e6f1f8 ground, a 263px
    // lockup and 68px search pills from 242 to 1682, the Lenzing mark 100px under
    // them, then a full-bleed rule and a 16px legal row.
    <footer className="bg-brand-50 text-brand-800 md:bg-[#e6f1f8]">
      <Container width="design">
        {/*
          Column-reversed on phones so the search row leads, as the frame draws
          it; the DOM keeps the lockup first on every width.
        */}
        <div className="flex flex-col-reverse gap-8 pt-10 pb-12 md:flex-row md:items-center md:justify-between md:pt-11 md:pb-0">
          <div className="flex flex-wrap items-center gap-8">
            <Link
              href={localePath(locale, "")}
              className="inline-block text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand md:flex"
              aria-label="VEOCEL — home"
            >
              <Logo height="h-14 md:h-[72px]" />
            </Link>

            {config.secondary_logo?.filename ? (
              <SmartLink link={config.secondary_logo_link} ariaLabel="#ItsInOurHands">
                <BlockImage
                  asset={config.secondary_logo}
                  alt="#ItsInOurHands"
                  sizes="120px"
                  className="relative h-12 w-24"
                  imageClassName="object-contain object-left"
                />
              </SmartLink>
            ) : null}
          </div>

          {/*
            48px controls with 20px type on phones — the frame's 240 + 108 pills
            with a 6px gap — and the desktop frame's 336 + 151 pills, 68px tall
            and 8px apart, from `lg` (2053:744, 2053:747). Between the two the
            pills stay compact, or they would squeeze the 263px lockup.
          */}
          <form
            action={localePath(locale, "search")}
            method="get"
            role="search"
            className="flex items-center gap-1.5 md:gap-3 lg:gap-2"
          >
            <label htmlFor="site-search" className="sr-only">
              Search this site
            </label>
            <input
              id="site-search"
              type="search"
              name="q"
              placeholder={config.search_placeholder ?? "search …"}
              className="h-12 w-full min-w-0 rounded-full border border-hairline bg-white px-5 text-xl text-ink italic placeholder:text-ink-faint focus:border-brand focus:outline-none md:h-auto md:w-72 md:border-[#afcee0] md:bg-[#f8f8f8] md:py-2.5 md:text-sm md:placeholder:text-[#7c7c7c] lg:h-[68px] lg:w-[336px] lg:px-[34px] lg:py-0 lg:text-xl"
            />
            <button
              type="submit"
              className="h-12 rounded-full bg-brand px-6 text-2xl font-medium text-white transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:h-auto md:bg-[#0f7ab8] md:py-2.5 md:text-sm md:font-semibold lg:h-[68px] lg:w-[151px] lg:px-0 lg:py-0 lg:text-2xl lg:font-medium"
            >
              search
            </button>
          </form>
        </div>

        {columns.length > 0 ? (
          <div className="grid gap-10 border-t border-brand-800/10 py-12 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((column) => (
              <div key={column._uid}>
                {column.title ? (
                  <h2 className="font-display text-sm font-bold text-brand">{column.title}</h2>
                ) : null}

                <ul className="mt-4 space-y-2.5">
                  {(column.links ?? []).map((item) => (
                    <li key={item._uid}>
                      <SmartLink
                        link={item.link}
                        className="text-[0.9375rem] leading-relaxed transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      >
                        {item.label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}

        {config.parent_logo?.filename ? (
          // The frame's 145×46 at every width, right-set — on phones too since
          // 2026-10-07, opposite the lockup — and from `md` 6px short of the
          // search button (2053:741).
          <div className="flex justify-end pb-10 md:justify-end md:pt-[100px] md:pr-1.5 md:pb-[29px]">
            <SmartLink link={config.parent_logo_link} ariaLabel="Parent company">
              <BlockImage
                asset={config.parent_logo}
                alt="Lenzing"
                sizes="150px"
                className="relative h-[46px] w-[145px]"
                imageClassName="object-contain object-left md:object-right"
              />
            </SmartLink>
          </div>
        ) : null}
      </Container>

      {/*
        The rule runs edge to edge at every width, as both frames draw it
        (2053:740 spans the full 1920). The copyright is last and centred on
        phones, first and left-set from `md`; it stays first in the DOM.
      */}
      <div className="border-t border-brand-800/15 md:border-[#afcee0]">
        <Container width="design">
          <div className="flex flex-col gap-7 py-7 text-base md:flex-row md:items-center md:justify-between md:gap-4 md:pt-7 md:pb-8 md:leading-5">
            {config.copyright ? (
              <p className="order-last text-center font-bold text-ink md:order-none md:text-left md:text-black">
                {config.copyright}
              </p>
            ) : null}

            {legal.length > 0 ? (
              <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 md:gap-x-10 md:text-[#299dc1]">
                {legal.map((item) => (
                  <li key={item._uid}>
                    <SmartLink
                      link={item.link}
                      className="underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      {item.label}
                    </SmartLink>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </Container>
      </div>
    </footer>
  );
}
