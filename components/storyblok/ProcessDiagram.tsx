import { BlockImage } from "@/components/ui/BlockImage";
import { Container, Section } from "@/components/ui/Container";
import type { ProcessDiagramBlok } from "@/lib/types";

import { editable } from "./editable";

/**
 * A production-process illustration on a tinted panel — the lyocell and viscose
 * closed loops.
 *
 * The diagram arrives as one piece of artwork rather than as steps this site
 * arranges, because the loop is the point: recovery arrows fold back on the
 * chain, so the parts can't be re-flowed independently the way `ProcessRow`
 * re-flows its steps.
 *
 * That makes the asset's own alt text the only description a screen reader gets.
 * `caption` is shown to everyone and states the flow in words; it does not
 * replace the alt text, and neither should be written from the other.
 */
export function ProcessDiagram({ blok }: { blok: ProcessDiagramBlok }) {
  return (
    <Section {...editable(blok)} spacing="tight">
      <Container>
        {blok.heading ? (
          <h2 className="max-w-3xl text-h2 font-bold text-brand md:text-h1">
            {blok.heading}
          </h2>
        ) : null}

        <figure className="mt-10">
          <BlockImage
            asset={blok.image}
            alt={blok.heading ?? ""}
            sizes="(max-width: 768px) 100vw, 768px"
            className="relative mx-auto aspect-[5/2] w-full max-w-3xl rounded-panel bg-brand-50"
            imageClassName="object-contain p-6 md:p-10"
            placeholderTone="sky"
          />

          {blok.caption ? (
            <figcaption className="mx-auto mt-4 max-w-3xl text-center text-[0.9375rem] leading-relaxed text-ink-muted">
              {blok.caption}
            </figcaption>
          ) : null}
        </figure>
      </Container>
    </Section>
  );
}
