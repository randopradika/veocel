import { ArrowTextLink } from "@/components/ui/ArrowButton";
import { BlockImage } from "@/components/ui/BlockImage";
import { Container, Section } from "@/components/ui/Container";
import { SmartLink } from "@/components/ui/SmartLink";
import type { ProcessRowBlok, ProcessStepBlok } from "@/lib/types";

import { editable } from "./editable";

const ALIGN = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

/**
 * The wood-to-fiber-to-nature lifecycle, in two arrangements:
 *
 *   ring — steps spaced evenly around a circle, copy alongside. This is the
 *          natural-circularity diagram: the shape is the argument, so the last
 *          step sits next to the first rather than at the end of a line.
 *   row  — a single horizontal strip under a statement heading.
 */
export function ProcessRow({ blok }: { blok: ProcessRowBlok }) {
  const steps = blok.steps ?? [];

  if ((blok.layout ?? "row") === "ring") {
    return <ProcessRing blok={blok} steps={steps} />;
  }

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
              <RowStep key={step._uid} blok={step} />
            ))}
          </ol>
        ) : null}
      </Container>
    </Section>
  );
}

/** Distance from the centre to each step, as a percentage of the diagram's width. */
const RING_RADIUS = 37;

function ProcessRing({ blok, steps }: { blok: ProcessRowBlok; steps: ProcessStepBlok[] }) {
  return (
    <Section {...editable(blok)} spacing="default">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {steps.length > 0 ? (
            <>
              {/*
                Below `lg` the ring becomes a plain grid: at narrow widths the
                circles would overlap and the labels collide.
              */}
              <ol className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:hidden">
                {steps.map((step) => (
                  <RowStep key={step._uid} blok={step} />
                ))}
              </ol>

              <div className="relative hidden aspect-square w-full lg:block" aria-hidden>
                {/* The connecting circle passes through every step's centre. */}
                <div
                  className="absolute rounded-full border border-brand-200"
                  style={{ inset: `${50 - RING_RADIUS}%` }}
                />

                {steps.map((step, index) => {
                  // Start at twelve o'clock and go clockwise.
                  const angle = (index / steps.length) * 2 * Math.PI - Math.PI / 2;
                  return (
                    <div
                      key={step._uid}
                      className="absolute w-[30%] -translate-x-1/2 -translate-y-1/2 text-center"
                      style={{
                        left: `${50 + RING_RADIUS * Math.cos(angle)}%`,
                        top: `${50 + RING_RADIUS * Math.sin(angle)}%`,
                      }}
                    >
                      <BlockImage
                        asset={step.image}
                        alt=""
                        sizes="220px"
                        className="relative aspect-square w-full rounded-full ring-8 ring-white"
                        placeholderTone="sky"
                      />
                      <p className="mt-3 text-sm font-semibold text-brand">{step.title}</p>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}

          <div>
            {blok.heading ? (
              <h2 className="text-h2 font-bold text-brand md:text-[2.25rem] md:leading-[1.15]">
                {blok.heading}
              </h2>
            ) : null}

            {blok.body
              ? blok.body
                  .split(/\n\s*\n/)
                  .map((paragraph, index) => (
                    <p key={index} className="mt-5 text-sm leading-relaxed text-ink-muted">
                      {paragraph}
                    </p>
                  ))
              : null}

            {blok.link_label ? (
              <SmartLink
                link={blok.link}
                className="mt-8 inline-block text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
              >
                <ArrowTextLink>{blok.link_label}</ArrowTextLink>
              </SmartLink>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}

function RowStep({ blok }: { blok: ProcessStepBlok }) {
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
