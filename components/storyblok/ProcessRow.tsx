import { BlockImage } from "@/components/ui/BlockImage";
import { Container, Section } from "@/components/ui/Container";
import type { ProcessRowBlok, ProcessStepBlok } from "@/lib/types";

import { editable } from "./editable";

const ALIGN = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

/**
 * The wood-to-fiber-to-nature lifecycle: a statement heading over a single row of
 * small circular images. Six steps at desktop, wrapping to two or three columns
 * on narrower screens rather than scrolling horizontally.
 */
export function ProcessRow({ blok }: { blok: ProcessRowBlok }) {
  const steps = blok.steps ?? [];

  return (
    <Section {...editable(blok)} spacing="default">
      <Container>
        {blok.heading ? (
          <h2
            className={`mx-auto max-w-4xl text-h2 font-bold text-brand md:text-h1 ${
              ALIGN[blok.align ?? "center"]
            }`}
          >
            {blok.heading}
          </h2>
        ) : null}

        {steps.length > 0 ? (
          <ol className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
            {steps.map((step) => (
              <ProcessStep key={step._uid} blok={step} />
            ))}
          </ol>
        ) : null}
      </Container>
    </Section>
  );
}

function ProcessStep({ blok }: { blok: ProcessStepBlok }) {
  return (
    <li {...editable(blok)} className="flex flex-col items-center text-center">
      <BlockImage
        asset={blok.image}
        alt={blok.title}
        sizes="72px"
        className="relative h-16 w-16 rounded-full"
        placeholderTone="sky"
      />
      <h3 className="mt-4 text-sm font-semibold text-brand">{blok.title}</h3>
      {blok.description ? (
        <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{blok.description}</p>
      ) : null}
    </li>
  );
}
