import { Container, Section } from "@/components/ui/Container";
import type { TextColumnsBlok } from "@/lib/types";

import { editable } from "./editable";

/**
 * Editorial copy block, in the two arrangements the design uses:
 *
 *   split  — heading left, body in a column to its right
 *   center — heading centred and full width, body in a narrow column beneath it,
 *            pushed to the right
 */
export function TextColumns({ blok }: { blok: TextColumnsBlok }) {
  const centered = blok.align === "center";

  return (
    <Section {...editable(blok)} spacing="default">
      <Container>
        {centered ? (
          <>
            {blok.heading ? (
              <h2 className="text-center text-h2 font-bold text-brand md:text-h1">
                {blok.heading}
              </h2>
            ) : null}
            {blok.body ? (
              <p className="mt-12 ml-auto max-w-xl text-base leading-[1.4] md:text-xl text-ink-muted">
                {blok.body}
              </p>
            ) : null}
          </>
        ) : (
          <div className="grid items-start gap-8 md:grid-cols-[1fr_minmax(0,28rem)] md:gap-16">
            {blok.heading ? (
              <h2 className="text-h2 font-bold text-brand md:text-h1">
                {blok.heading}
              </h2>
            ) : null}
            {blok.body ? (
              <p className="text-base leading-[1.4] text-ink-muted md:pt-2 md:text-xl">{blok.body}</p>
            ) : null}
          </div>
        )}
      </Container>
    </Section>
  );
}
