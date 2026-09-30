import { Fragment } from "react";

import { Container, Section } from "@/components/ui/Container";
import { headlineLines } from "@/lib/headlineLines";
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
    <Section
      {...editable(blok)}
      spacing="tight"
      // Desktop rhythm from the "dev" board (2053:170): 111px under the hero tabs and to the band, 106 between the two grids (2053:659) — 111 here. No padding below,
      // or neighbours would stack; the last block on a page keeps the gap to the band.
      className="xl:pt-[111px] xl:pb-0 xl:last:pb-[111px]"
    >
      <Container width="design">
        {/*
          Side by side only from `xl`: the heading's longer line is ~675px at
          64px, and below 1280 that leaves the intro a sliver beside it.
        */}
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between xl:gap-16">
          {blok.heading ? (
            /*
              Two lines with the break drawn in, as the design sets it (2053:718,
              2053:730) — "VEOCEL™ Lyocell Fibers / Nonwoven Portfolio". From `md`
              each line holds together, since the 688px column there already
              fits the longer one; on phones the heading wraps as it must.
            */
            <h2 className="text-h2 font-bold text-brand md:text-h1 xl:shrink-0">
              {headlineLines(blok.heading).map((line, i) => (
                <Fragment key={i}>
                  {i > 0 ? " " : null}
                  <span className="md:block md:whitespace-nowrap">{line}</span>
                </Fragment>
              ))}
            </h2>
          ) : null}

          {/*
            Body size, as the intro copy is set on every other page (`TextColumns`).
            624 of the 1446px column, as drawn — the same for both grids, so the
            Lyocell and Viscose intros line up (2053:719, 2053:731) whatever the heading.
            Where the column runs short of that, both cap at what the longer
            heading (~675px) and its gap leave, so they still line up at 1280.
          */}
          {blok.intro ? (
            <p className="text-base leading-[1.4] text-ink-muted md:text-xl xl:mt-2 xl:w-[43%] xl:max-w-[calc(100%_-_46.25rem)]">
              {blok.intro}
            </p>
          ) : null}
        </div>

        <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-x-9 lg:gap-y-14">
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
