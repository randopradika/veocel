import { Container, Section } from "@/components/ui/Container";
import type { CertificationGridBlok } from "@/lib/types";

import { CertificationTile } from "./CertificationTile";
import { editable } from "./editable";

/**
 * The wall of certification marks — FSC, PEFC, the OK biodegradable family,
 * OEKO-TEX and the rest.
 *
 * Laid out as a centred wrap rather than a fixed grid: the list grows and shrinks
 * as certificates are gained and expire, and a wrap leaves the final short row
 * centred instead of stranding one mark against the left margin.
 *
 * Each mark keeps a white plate with a hairline edge — certification artwork is
 * drawn for white, and several of these logos carry no background of their own.
 */
export function CertificationGrid({ blok }: { blok: CertificationGridBlok }) {
  const items = blok.items ?? [];
  const left = blok.align === "left";
  if (items.length === 0) return null;

  return (
    <Section {...editable(blok)} spacing="tight">
      <Container>
        {/*
          The left arrangement matches the sustainability frame, where the
          heading ranges with the page's other section headings — at their size,
          not the original wall's centred poster setting.
        */}
        {blok.heading ? (
          <h2
            className={
              left
                ? "mb-10 text-h2 font-bold text-brand md:text-h1"
                : "mb-4 text-center text-h2 font-bold text-brand md:text-h1"
            }
          >
            {blok.heading}
          </h2>
        ) : null}

        {blok.intro ? (
          <p
            className={`mb-12 max-w-xl text-sm leading-relaxed text-ink-muted ${
              left ? "" : "mx-auto text-center"
            }`}
          >
            {blok.intro}
          </p>
        ) : null}

        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-7">
          {items.map((item) => (
            <li
              key={item._uid}
              className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.75rem)] lg:w-[calc(20%-0.85rem)]"
            >
              <CertificationTile blok={item} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
