import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { SmartLink } from "@/components/ui/SmartLink";
import type { ConfigBlok } from "@/lib/types";

import { Logo } from "./Logo";

/**
 * Pale blue footer: lockup and tagline on the left, link columns on the right,
 * legal row underneath.
 */
export function SiteFooter({ config }: { config: ConfigBlok }) {
  const columns = config.footer_columns ?? [];
  const legal = config.legal_links ?? [];

  return (
    <footer className="bg-brand-100 text-brand-800">
      <Container>
        <div className="grid gap-12 py-16 lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-20">
          <div>
            <Link
              href="/"
              className="inline-block text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
              aria-label="VEOCEL — home"
            >
              <Logo />
            </Link>
            {config.footer_tagline ? (
              <p className="mt-3 text-sm text-brand">{config.footer_tagline}</p>
            ) : null}
          </div>

          {columns.length > 0 ? (
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
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
        </div>

        <div className="flex flex-col gap-4 border-t border-brand-800/15 py-6 text-[0.7rem] md:flex-row md:items-center md:justify-between">
          {config.copyright ? <p className="opacity-70">{config.copyright}</p> : null}

          {legal.length > 0 ? (
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {legal.map((item) => (
                <li key={item._uid}>
                  <SmartLink
                    link={item.link}
                    className="transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
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
