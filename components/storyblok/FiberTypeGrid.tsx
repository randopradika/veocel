import { BlockImage } from "@/components/ui/BlockImage";
import { Container, Section } from "@/components/ui/Container";
import { SmartLink } from "@/components/ui/SmartLink";
import type { FiberTypeCardBlok, FiberTypeGridBlok } from "@/lib/types";

import { editable } from "./editable";

/**
 * The fiber families — lyocell, viscose, viscostar — as the first thing under the
 * hero.
 *
 * Unlike `CategoryGrid` and `ProductGrid`, the caption sits *below* the picture
 * rather than on it: these are electron micrographs, and a scrim over one would
 * hide the very detail that distinguishes the fibers. Each card ends in an
 * explicit button because the destination is a deeper spec page, not a teaser.
 */
export function FiberTypeGrid({ blok }: { blok: FiberTypeGridBlok }) {
  const items = blok.items ?? [];
  if (items.length === 0) return null;

  return (
    <Section {...editable(blok)} spacing="tight">
      <Container>
        {blok.heading ? (
          <h2 className="mb-4 text-center text-h2 font-bold text-brand md:text-h1">
            {blok.heading}
          </h2>
        ) : null}

        {blok.intro ? (
          <p className="mx-auto mb-12 max-w-xl text-center text-sm leading-relaxed text-ink-muted">
            {blok.intro}
          </p>
        ) : null}

        <ul className="grid gap-8 sm:grid-cols-3 sm:gap-5">
          {items.map((item) => (
            <li key={item._uid}>
              <FiberTypeCard blok={item} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

function FiberTypeCard({ blok }: { blok: FiberTypeCardBlok }) {
  return (
    <div {...editable(blok)} className="flex h-full flex-col items-center text-center">
      <BlockImage
        asset={blok.image}
        alt={blok.title}
        sizes="(max-width: 640px) 100vw, 33vw"
        className="relative aspect-[16/9] w-full rounded-card"
        placeholderTone="neutral"
      />

      <h3 className="mt-4 text-base font-bold text-brand">{blok.title}</h3>

      {blok.subtitle ? (
        <p className="mt-1 text-sm leading-snug text-ink-muted">{blok.subtitle}</p>
      ) : null}

      {/* Pushed to the bottom so the buttons line up across cards of unequal height. */}
      <div className="mt-auto pt-5">
        <SmartLink
          link={blok.link}
          className="inline-flex items-center justify-center rounded-full bg-brand px-8 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {blok.link_label || "explore"}
        </SmartLink>
      </div>
    </div>
  );
}
