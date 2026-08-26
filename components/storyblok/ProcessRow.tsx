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
 * A sequence of steps, in three arrangements:
 *
 *   ring  — steps spaced evenly around a circle, copy alongside. This is the
 *           natural-circularity diagram: the shape is the argument, so the last
 *           step sits next to the first rather than at the end of a line.
 *   row   — a single horizontal strip under a statement heading.
 *   cards — white, photo-led cards three up on the tinted band: the partner
 *           page's licensing steps (frame 2039:549). One block rather than a
 *           third that would drift, the same reasoning as `feature_accordion`.
 */
export function ProcessRow({ blok }: { blok: ProcessRowBlok }) {
  const steps = blok.steps ?? [];

  if (blok.layout === "cards") {
    return <ProcessCards blok={blok} steps={steps} />;
  }

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

/**
 * Where each step's title sits over the segmented-wheel artwork, as percentages
 * of the square — measured from the design frame, in the order the wedges run
 * clockwise from the top. The artwork's five wedges are unevenly sized, so the
 * positions are transcribed rather than computed.
 */
const WHEEL_LABELS: ReadonlyArray<readonly [number, number]> = [
  [50, 30], // forest — top
  [81.5, 53], // wood — right
  [68, 84], // pulp — lower right
  [33, 84], // fibers — lower left
  [16, 53], // biodegradability — left
];

function ProcessRing({ blok, steps }: { blok: ProcessRowBlok; steps: ProcessStepBlok[] }) {
  // The wheel artwork has exactly five wedges; with any other step count the
  // titles would land on the wrong photograph, so fall back to the circles.
  const wheel = Boolean(blok.diagram_image?.filename) && steps.length === WHEEL_LABELS.length;

  return (
    <Section {...editable(blok)} spacing="default">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {wheel ? (
            <figure className="relative mx-auto w-full max-w-[570px]">
              <BlockImage
                asset={blok.diagram_image}
                alt=""
                sizes="(min-width: 1024px) 570px, 100vw"
                className="relative aspect-square w-full"
                imageClassName="object-contain"
              />
              <ol className="absolute inset-0">
                {steps.map((step, index) => (
                  <li
                    key={step._uid}
                    {...editable(step)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 text-center text-base font-semibold whitespace-nowrap text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)] sm:text-xl lg:text-2xl"
                    style={{
                      left: `${WHEEL_LABELS[index][0]}%`,
                      top: `${WHEEL_LABELS[index][1]}%`,
                    }}
                  >
                    {step.title}
                  </li>
                ))}
              </ol>
            </figure>
          ) : null}

          {!wheel && steps.length > 0 ? (
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

/**
 * Step cards on the tinted band — the band is part of the layout, not an
 * option, because white cards on the white page would have no edge at all.
 */
function ProcessCards({ blok, steps }: { blok: ProcessRowBlok; steps: ProcessStepBlok[] }) {
  return (
    <Section {...editable(blok)} spacing="tight" className="bg-brand-50">
      <Container>
        {blok.heading ? (
          <h2
            className={`text-h2 font-bold text-brand md:text-[2.5rem] md:leading-[1.2] ${
              ALIGN[blok.align ?? "center"]
            }`}
          >
            {blok.heading}
          </h2>
        ) : null}

        {steps.length > 0 ? (
          <ol className={`${blok.heading ? "mt-12 " : ""}grid gap-6 md:grid-cols-3`}>
            {steps.map((step) => (
              <StepCard key={step._uid} blok={step} />
            ))}
          </ol>
        ) : null}
      </Container>
    </Section>
  );
}

/**
 * Photograph, title, copy. The card spans three subgrid rows so the titles of
 * a row of cards share a baseline whether they run to one line or two — the
 * frame bottom-aligns them and starts every description on the same line.
 */
function StepCard({ blok }: { blok: ProcessStepBlok }) {
  return (
    <li
      {...editable(blok)}
      className="row-span-3 grid grid-rows-subgrid rounded-panel bg-white p-2.5 pb-9 text-center"
    >
      <BlockImage
        asset={blok.image}
        alt=""
        sizes="(max-width: 768px) 100vw, 33vw"
        className="relative aspect-[433/262] w-full rounded-card"
        placeholderTone="sky"
      />
      <h3 className="mt-7 self-end px-4 text-2xl leading-tight font-bold tracking-tight text-brand">
        {blok.title}
      </h3>
      {blok.description ? (
        <p className="mt-4 px-4 text-xs leading-[1.75] text-ink">{blok.description}</p>
      ) : null}
    </li>
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
