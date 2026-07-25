import { BlockImage } from "@/components/ui/BlockImage";
import { Container, Section } from "@/components/ui/Container";
import { SmartLink } from "@/components/ui/SmartLink";
import type { ProductCardBlok, ProductGridBlok } from "@/lib/types";

import { editable } from "./editable";

/**
 * Product-format cards — sheet mask, cleansing wipes, makeup removal wipes.
 * Same photographic treatment as `CategoryGrid` but three-up and without the
 * corner marker, matching the beauty page.
 */
export function ProductGrid({ blok }: { blok: ProductGridBlok }) {
  const items = blok.items ?? [];
  if (items.length === 0) return null;

  return (
    <Section {...editable(blok)} spacing="tight">
      <Container>
        {blok.heading ? (
          <h2 className="mb-10 text-center text-h2 font-bold text-brand md:text-h1">
            {blok.heading}
          </h2>
        ) : null}

        {blok.intro ? (
          <p className="mx-auto mb-12 max-w-xl text-center text-sm leading-relaxed text-ink-muted">
            {blok.intro}
          </p>
        ) : null}

        <ul className="grid gap-4 sm:grid-cols-3 md:gap-5">
          {items.map((item) => (
            <li key={item._uid}>
              <ProductCard blok={item} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

function ProductCard({ blok }: { blok: ProductCardBlok }) {
  return (
    <SmartLink
      link={blok.link}
      className="group relative flex aspect-[4/3] overflow-hidden rounded-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
    >
      <span {...editable(blok)} className="absolute inset-0">
        <BlockImage
          asset={blok.image}
          alt={blok.title}
          sizes="(max-width: 640px) 100vw, 33vw"
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]"
          placeholderTone="sky"
        />
      </span>

      <span className="card-scrim pointer-events-none absolute inset-0" aria-hidden />

      <span className="absolute bottom-5 left-5 pr-5 font-display text-base font-semibold text-white md:text-h3">
        {blok.title}
      </span>
    </SmartLink>
  );
}
