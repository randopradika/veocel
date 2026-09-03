import { Container, Section } from "@/components/ui/Container";
import type { IntroSectionBlok } from "@/lib/types";

import { editable } from "./editable";

const ALIGN = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

/**
 * Large statement heading with a small supporting paragraph — the "purely for
 * you." moment. In `split` layout the heading sits left and the copy occupies a
 * narrow column to its right, which is the deliberate imbalance in the design.
 */
export function IntroSection({ blok }: { blok: IntroSectionBlok }) {
  const align = ALIGN[blok.align ?? "left"];
  const split = (blok.layout ?? "split") === "split";

  return (
    <Section {...editable(blok)} spacing="default">
      <Container>
        <div
          className={
            split
              ? "grid items-start gap-8 md:grid-cols-[1fr_minmax(0,26rem)] md:gap-16"
              : `mx-auto max-w-3xl ${align}`
          }
        >
          {blok.heading ? (
            <h2 className={`text-h2 font-bold text-brand md:text-h1 ${split ? "" : align}`}>
              {blok.heading}
            </h2>
          ) : null}

          {blok.body ? (
            <p className="text-base leading-[1.4] text-ink-muted md:pt-3 md:text-xl">{blok.body}</p>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
