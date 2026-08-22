import { BlockImage } from "@/components/ui/BlockImage";
import { Container, Section } from "@/components/ui/Container";
import { SmartLink } from "@/components/ui/SmartLink";
import type { FiberProductCardBlok, FiberProductGridBlok, StoryblokLink } from "@/lib/types";

import { editable } from "./editable";

/**
 * A fiber family's product catalogue: heading and intro on one line, then a
 * grid of cards — photograph, the fiber's centred name, and three spec rows
 * (diameter, key applications, features — the 2019:1326 revision's set). The
 * fibers page runs two of these, Lyocell and Viscose.
 *
 * The spec-row labels live on the grid, not the cards, so seven cards can't
 * drift into six "fiber diameter"s and one "fibre diameter".
 *
 * The design underlines every fiber name as a link. The detail pages don't
 * exist yet, so the underline is drawn only when a card actually has a link —
 * an underline that goes nowhere is a broken promise, not a style.
 */
export function FiberProductGrid({ blok }: { blok: FiberProductGridBlok }) {
  const items = blok.items ?? [];
  if (items.length === 0) return null;

  return (
    <Section {...editable(blok)} spacing="tight">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          {blok.heading ? (
            <h2 className="max-w-xl text-h2 font-bold text-brand md:text-[2.5rem] md:leading-[1.2]">
              {blok.heading}
            </h2>
          ) : null}

          {blok.intro ? (
            <p className="text-sm leading-relaxed text-ink-muted lg:mt-2 lg:max-w-[43%]">
              {blok.intro}
            </p>
          ) : null}
        </div>

        <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item._uid}>
              <FiberProductCard
                blok={item}
                diameterLabel={blok.diameter_label || "fiber diameter"}
                applicationsLabel={blok.applications_label || "key applications"}
                featuresLabel={blok.features_label || "fiber features"}
              />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

function hasTarget(link?: StoryblokLink): boolean {
  return Boolean(link && (link.url || link.cached_url));
}

function FiberProductCard({
  blok,
  diameterLabel,
  applicationsLabel,
  featuresLabel,
}: {
  blok: FiberProductCardBlok;
  diameterLabel: string;
  applicationsLabel: string;
  featuresLabel: string;
}) {
  const specs = [
    [diameterLabel, blok.diameter],
    [applicationsLabel, blok.applications],
    [featuresLabel, blok.features],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  return (
    <article {...editable(blok)}>
      <BlockImage
        asset={blok.image}
        alt=""
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="relative aspect-[2/1] w-full rounded-card"
        placeholderTone="sky"
      />

      {/* Centred, as the 2019:1326 revision draws it — the application tag
          that used to sit opposite left the design with that revision. */}
      <h3 className="mt-5 text-center text-sm font-bold text-brand md:text-base">
        <SmartLink
          link={blok.link}
          className={`focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand ${
            hasTarget(blok.link)
              ? "underline underline-offset-4 transition-opacity hover:opacity-75"
              : ""
          }`}
        >
          {blok.name}
        </SmartLink>
      </h3>

      {specs.length > 0 ? (
        <dl className="mt-4 space-y-1 text-sm">
          {specs.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4">
              <dt className="font-bold text-ink">{label}</dt>
              <dd className="text-right text-ink-muted">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </article>
  );
}
