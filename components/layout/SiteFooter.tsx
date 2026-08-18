import Link from "next/link";

import { BlockImage } from "@/components/ui/BlockImage";
import { Container } from "@/components/ui/Container";
import { SmartLink } from "@/components/ui/SmartLink";
import type { ConfigBlok } from "@/lib/types";

import { Logo } from "./Logo";

/**
 * Footer: lockup and site search on one row, the parent-company mark beneath, and
 * a legal row along the bottom.
 *
 * The search form is a plain GET to `/search`, so it works without JavaScript and
 * the query stays in the URL — shareable and back-button friendly.
 *
 * `footer_columns` still renders when the config story provides them; the current
 * design simply has none.
 */
export function SiteFooter({ config }: { config: ConfigBlok }) {
  const columns = config.footer_columns ?? [];
  const legal = config.legal_links ?? [];

  return (
    <footer className="bg-brand-50 text-brand-800">
      <Container>
        <div className="flex flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between">
          <Link
            href="/"
            className="inline-block text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            aria-label="VEOCEL — home"
          >
            <Logo />
          </Link>

          <form action="/search" method="get" role="search" className="flex items-center gap-3">
            <label htmlFor="site-search" className="sr-only">
              Search this site
            </label>
            <input
              id="site-search"
              type="search"
              name="q"
              placeholder={config.search_placeholder ?? "search …"}
              className="w-full min-w-0 rounded-full border border-hairline bg-white px-5 py-2.5 text-sm text-ink italic placeholder:text-ink-faint focus:border-brand focus:outline-none md:w-72"
            />
            <button
              type="submit"
              className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
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
          <div className="flex justify-end pb-10">
            <SmartLink link={config.parent_logo_link} ariaLabel="Parent company">
              <BlockImage
                asset={config.parent_logo}
                alt="Lenzing"
                sizes="140px"
                className="relative h-9 w-32"
                imageClassName="object-contain object-right"
              />
            </SmartLink>
          </div>
        ) : null}

        <div className="flex flex-col gap-4 border-t border-brand-800/15 py-6 text-[0.7rem] md:flex-row md:items-center md:justify-between">
          {config.copyright ? <p className="opacity-70">{config.copyright}</p> : null}

          {legal.length > 0 ? (
            <ul className="flex flex-wrap items-center gap-x-8 gap-y-2">
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
