import { BlockImage } from "@/components/ui/BlockImage";
import { Container, Section } from "@/components/ui/Container";
import { SmartLink } from "@/components/ui/SmartLink";
import type { FiberProductCardBlok, FiberProductGridBlok, StoryblokLink } from "@/lib/types";

import { editable } from "./editable";

/**
 * A fiber family's product catalogue: heading and intro on one line, then a
 * grid of cards — photograph, the fiber's name opposite its application, and
 * two spec rows. The fibers page runs two of these, Lyocell and Viscose.
 *
 * The spec-row labels live on the grid, not the cards, so ten cards can't
 * drift into nine "fiber diameter"s and one "fibre diameter".
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
  featuresLabel,
}: {
  blok: FiberProductCardBlok;
  diameterLabel: string;
  featuresLabel: string;
}) {
  const specs = [
    [diameterLabel, blok.diameter],
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

      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="text-sm font-bold text-brand md:text-base">
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

        {blok.application ? (
          <p className="text-right text-sm font-bold text-brand md:text-base">
            {blok.application}
          </p>
        ) : null}
      </div>

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
