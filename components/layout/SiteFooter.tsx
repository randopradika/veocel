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
 * lockup beneath, the Lenzing mark left-aligned, a full-bleed rule, the legal
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
    <footer className="bg-brand-50 text-brand-800">
      <Container>
        {/*
          Column-reversed on phones so the search row leads, as the frame draws
          it; the DOM keeps the lockup first on every width.
        */}
        <div className="flex flex-col-reverse gap-8 pt-10 pb-12 md:flex-row md:items-center md:justify-between md:py-12">
          <div className="flex flex-wrap items-center gap-8">
            <Link
              href={localePath(locale, "")}
              className="inline-block text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
              aria-label="VEOCEL — home"
            >
              <Logo />
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
            with a 6px gap — stepping down to the desktop sizes at `md`.
          */}
          <form
            action={localePath(locale, "search")}
            method="get"
            role="search"
            className="flex items-center gap-1.5 md:gap-3"
          >
            <label htmlFor="site-search" className="sr-only">
              Search this site
            </label>
            <input
              id="site-search"
              type="search"
              name="q"
              placeholder={config.search_placeholder ?? "search …"}
              className="h-12 w-full min-w-0 rounded-full border border-hairline bg-white px-5 text-xl text-ink italic placeholder:text-ink-faint focus:border-brand focus:outline-none md:h-auto md:w-72 md:py-2.5 md:text-sm"
            />
            <button
              type="submit"
              className="h-12 rounded-full bg-brand px-6 text-xl font-medium text-white transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:h-auto md:py-2.5 md:text-sm md:font-semibold"
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
                        className="text-xs leading-relaxed transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
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
          // Left-set at the frame's 145×46 on phones, right-set at 0.75 from `md`.
          <div className="flex justify-start pb-10 md:justify-end">
            <SmartLink link={config.parent_logo_link} ariaLabel="Parent company">
              <BlockImage
                asset={config.parent_logo}
                alt="Lenzing"
                sizes="(min-width: 768px) 140px, 150px"
                className="relative h-[46px] w-[145px] md:h-9 md:w-32"
                imageClassName="object-contain object-left md:object-right"
              />
            </SmartLink>
          </div>
        ) : null}

        {/*
          The rule runs edge to edge on phones (negative gutter margins), inside
          the gutters from `md`. The copyright is last and centred on phones,
          first and left-set from `md`; it stays first in the DOM.
        */}
        <div className="-mx-6 flex flex-col gap-7 border-t border-brand-800/15 px-6 py-7 text-base md:mx-0 md:flex-row md:items-center md:justify-between md:gap-4 md:px-0 md:py-6 md:text-[0.7rem]">
          {config.copyright ? (
            <p className="order-last text-center font-bold text-ink md:order-none md:text-left md:font-normal md:text-inherit md:opacity-70">
              {config.copyright}
            </p>
          ) : null}

          {legal.length > 0 ? (
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 md:gap-x-8">
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
    </footer>
  );
}
