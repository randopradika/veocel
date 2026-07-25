import { BlockImage } from "@/components/ui/BlockImage";
import { Container, Section } from "@/components/ui/Container";
import { SmartLink } from "@/components/ui/SmartLink";
import type { ExploreTabBlok, ExploreTabsBlok } from "@/lib/types";

import { editable } from "./editable";

/**
 * "more from VEOCEL™" — a row of navigation cards.
 *
 * These read as tabs in the mockup, but each one leads to a different page, so
 * they're links, not a tab widget: the blue tint is a hover/focus state rather
 * than client-side selection. That keeps the block a server component and keeps
 * keyboard and middle-click behaviour intact.
 */
export function ExploreTabs({ blok }: { blok: ExploreTabsBlok }) {
  const tabs = blok.tabs ?? [];
  if (tabs.length === 0) return null;

  return (
    <Section {...editable(blok)} spacing="default">
      <Container>
        {blok.heading ? (
          <h2 className="text-center text-h2 font-bold text-brand md:text-h1">{blok.heading}</h2>
        ) : null}

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tabs.map((tab, index) => (
            <li key={tab._uid}>
              <ExploreTab blok={tab} index={index} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

function ExploreTab({ blok, index }: { blok: ExploreTabBlok; index: number }) {
  return (
    <SmartLink
      link={blok.link}
      className="group flex h-full flex-col rounded-card bg-brand-50 p-5 transition-colors duration-200 hover:bg-brand-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
    >
      <span {...editable(blok)} className="flex flex-1 flex-col">
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full border border-brand/30 text-[0.65rem] font-semibold text-brand transition-colors group-hover:border-transparent group-hover:bg-brand group-hover:text-white"
          aria-hidden
        >
          {index + 1}
        </span>

        <span className="mt-6 font-display text-h3 font-semibold text-brand">
          {blok.title}
        </span>

        {blok.description ? (
          <span className="mt-2 mb-6 block text-xs leading-relaxed text-ink-muted">
            {blok.description}
          </span>
        ) : null}

        <BlockImage
          asset={blok.image}
          alt={blok.title}
          sizes="(max-width: 640px) 100vw, 25vw"
          className="relative mt-auto aspect-[4/3] rounded-[0.5rem]"
          placeholderTone="sky"
        />
      </span>
    </SmartLink>
  );
}
