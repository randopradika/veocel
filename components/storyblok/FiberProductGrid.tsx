import { Container, Section } from "@/components/ui/Container";
import type { FiberProductGridBlok } from "@/lib/types";

import { editable } from "./editable";
import { FiberProductCard } from "./FiberProductCard";

/**
 * A fiber family's product catalogue: heading and intro on one line, then a
 * grid of cards — photograph and the fiber's centred, underlined name. The
 * fibers page runs two of these, Lyocell and Viscose.
 *
 * Since the "Desktop Dev" revision (frame 2039:961) the three spec rows no
 * longer sit on the card: the name opens a pop-up carrying the description
 * and the rows — see `FiberProductCard`. The spec-row labels still live on
 * the grid, not the cards, so eight cards can't drift into seven "fiber
 * diameter"s and one "fibre diameter".
 */
export function FiberProductGrid({ blok }: { blok: FiberProductGridBlok }) {
  const items = blok.items ?? [];
  if (items.length === 0) return null;

  const labels = {
    diameter: blok.diameter_label || "fiber diameter",
    applications: blok.applications_label || "key applications",
    features: blok.features_label || "fiber features",
  };

  return (
    <Section {...editable(blok)} spacing="tight">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          {blok.heading ? (
            <h2 className="max-w-3xl text-h2 font-bold text-brand md:text-h1">
              {blok.heading}
            </h2>
          ) : null}

          {/* Body size, as the intro copy is set on every other page (`TextColumns`). */}
          {blok.intro ? (
            <p className="text-base leading-[1.4] text-ink-muted md:text-xl lg:mt-2 lg:max-w-[43%]">
              {blok.intro}
            </p>
          ) : null}
        </div>

        <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item._uid}>
              <FiberProductCard blok={item} labels={labels} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
