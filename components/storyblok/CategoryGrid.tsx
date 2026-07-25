import { ArrowMarker } from "@/components/ui/ArrowButton";
import { BlockImage } from "@/components/ui/BlockImage";
import { Container, Section } from "@/components/ui/Container";
import { SmartLink } from "@/components/ui/SmartLink";
import type { CategoryCardBlok, CategoryGridBlok } from "@/lib/types";

import { editable } from "./editable";

const COLUMNS = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
} as const;

/** Photographic entry points to the four application areas. */
export function CategoryGrid({ blok }: { blok: CategoryGridBlok }) {
  const items = blok.items ?? [];
  if (items.length === 0) return null;

  return (
    <Section {...editable(blok)} spacing="tight">
      <Container>
        <ul className={`grid gap-4 ${COLUMNS[blok.columns ?? "2"]} md:gap-5`}>
          {items.map((item) => (
            <li key={item._uid}>
              <CategoryCard blok={item} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

function CategoryCard({ blok }: { blok: CategoryCardBlok }) {
  return (
    <SmartLink
      link={blok.link}
      className="group relative flex aspect-[3/2] overflow-hidden rounded-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
    >
      <span {...editable(blok)} className="absolute inset-0">
        <BlockImage
          asset={blok.image}
          alt={blok.title}
          sizes="(max-width: 640px) 100vw, 50vw"
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]"
          placeholderTone="brand"
        />
      </span>

      <span className="card-scrim pointer-events-none absolute inset-0" aria-hidden />

      {blok.kicker ? (
        <span className="absolute top-5 left-6 text-[0.7rem] tracking-[0.08em] text-white/85">
          {blok.kicker}
        </span>
      ) : null}

      <span className="absolute top-5 right-5">
        <ArrowMarker tone="onImage" size="md" />
      </span>

      <span className="absolute bottom-6 left-6 pr-14 font-display text-h3 font-semibold text-white">
        {blok.title}
      </span>
    </SmartLink>
  );
}
