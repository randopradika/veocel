import { ArrowTextLink } from "@/components/ui/ArrowButton";
import { BlockImage } from "@/components/ui/BlockImage";
import { Container, Section } from "@/components/ui/Container";
import { Markdown } from "@/components/ui/Markdown";
import { SmartLink } from "@/components/ui/SmartLink";
import { headlineLines } from "@/lib/headlineLines";
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
  // With no steps at all the artwork stands alone — deleting the labels in
  // Storyblok must not take the picture with them.
  const wheel =
    Boolean(blok.diagram_image?.filename) &&
    (steps.length === 0 || steps.length === WHEEL_LABELS.length);

  return (
    // From `xl` the home frame (2053:1175) as drawn at 1920: the wheel 633px wide
    // from 280, 101px under the hero; heading and copy 616px wide from 1000, 87px
    // beside it, the heading 40px below the wheel's top; 112px to the footer
    // band. The grid sits on the design column with 40px/64px insets, which is
    // where 280 and 1616 fall.
    <Section {...editable(blok)} spacing="default" className="xl:pt-[101px] xl:pb-[112px]">
      <Container width="design">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20 xl:grid-cols-[633fr_616fr] xl:items-start xl:gap-[87px] xl:pr-16 xl:pl-10">
          {wheel ? (
            <figure className="relative mx-auto w-full max-w-[570px] xl:max-w-none">
              <BlockImage
                asset={blok.diagram_image}
                alt=""
                sizes="(min-width: 1280px) 633px, (min-width: 1024px) 570px, 100vw"
                className="relative aspect-square w-full"
                imageClassName="object-contain"
              />
              {steps.length > 0 ? (
                <ol className="absolute inset-0">
                  {steps.map((step, index) => (
                    <li
                      key={step._uid}
                      {...editable(step)}
                      className="absolute -translate-x-1/2 -translate-y-1/2 text-center text-base font-bold tracking-[-0.05em] whitespace-nowrap text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)] sm:text-2xl"
                      style={{
                        left: `${WHEEL_LABELS[index][0]}%`,
                        top: `${WHEEL_LABELS[index][1]}%`,
                      }}
                    >
                      {step.title}
                    </li>
                  ))}
                </ol>
              ) : null}
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
                      <p className="mt-3 text-2xl font-bold tracking-[-0.05em] text-brand">{step.title}</p>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}

          <div className="xl:pt-10">
            {/* 48px on two lines in the frame (2053:1177), not the 64px section size. */}
            {blok.heading ? (
              <h2 className="text-h2 font-bold text-brand md:text-h1 lg:text-h2">
                {blok.heading}
              </h2>
            ) : null}

            {/* 20/28 copy 47px under the heading, a blank 28px line between paragraphs (2053:1176). */}
            <Markdown
              className="mt-5 text-base leading-[1.4] text-ink-muted md:text-xl xl:mt-[47px] xl:leading-7 xl:[&>*+*]:mt-7"
              gap="loose"
            >
              {blok.body}
            </Markdown>

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
    <Section
      {...editable(blok)}
      spacing="none"
      // Desktop rhythm from the "dev" board (2053:170): the cards 60px under the Lenzing
      // Pro panel, 136px to the band (2053:247). No padding below, or neighbours would
      // stack; the last block on a page keeps the gap to the band.
      //
      // Below `xl` the cards follow the panel at the cards' own 24px gap (40px on a
      // tablet) — the two blocks' paddings had stacked to 96 (2026-10-07).
      className="bg-brand-50 pt-6 pb-12 md:bg-[#e6f1f8] md:pt-10 md:pb-16 xl:pt-[60px] xl:pb-0 xl:last:pb-[136px]"
    >
      <Container width="design">
        {blok.heading ? (
          <h2
            className={`text-h2 font-bold text-brand md:text-h1 ${
              ALIGN[blok.align ?? "center"]
            }`}
          >
            {blok.heading}
          </h2>
        ) : null}

        {/*
          From `lg` the row is the frame scaled to fit: `--u` is one design pixel
          of the 1440px row, so every card measurement below is written in frame
          pixels and the type shrinks with the card rather than wrapping
          differently. The column gap is the frame's 31px as a share of the row.
        */}
        {steps.length > 0 ? (
          <ol
            className={`${blok.heading ? "mt-12 " : ""}grid gap-6 md:grid-cols-3 lg:[container-type:inline-size] lg:gap-x-[2.153%] lg:gap-y-0 lg:[--u:calc(100cqw/1440)]`}
          >
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
/**
 * From `lg` the partners frame's card (2053:350–362), in frame pixels: 459 x 572
 * with a 20px radius, the 433 x 262 photograph inset 13px, 32/40 titles sharing a
 * baseline 36px under it, copy in black 22px lower, 46px of card below the
 * longest (four lines held). The frame sets the copy 16/28; it is 18/30 since
 * 2026-10-07, when the client's own Figma showed it a size larger than the
 * site ("font yg di web masih belum persis sebesar kayak di figma").
 *
 * Below `md` a card is a plain column rather than a subgrid: the list's 24px
 * row gap opened inside every card as well, which with the margins put ~50px
 * between photograph, title and copy on a phone (asked closer, 2026-10-07). No row gap from `lg`: the
 * cards are subgrids, so the list's row gap would open inside every card.
 *
 * The frame breaks its lines by hand. Titles are a one-line field, so a title
 * too long for one line is split the way the hero headlines are, which gives
 * the frame's "send us a physical sample / for testing and verifications"; the
 * description is a textarea and keeps the editor's own line breaks. Below `lg`
 * both wrap freely.
 */
function StepCard({ blok }: { blok: ProcessStepBlok }) {
  const title = blok.title ?? "";
  const titleLines = title.length > TITLE_ONE_LINE || /\n/.test(title) ? headlineLines(title) : [title];

  return (
    <li
      {...editable(blok)}
      className="flex flex-col rounded-panel bg-white p-2.5 pb-8 text-center md:row-span-3 md:grid md:grid-rows-subgrid md:pb-9 lg:rounded-[calc(20*var(--u))] lg:px-[calc(13*var(--u))] lg:pt-[calc(14*var(--u))] lg:pb-[calc(46*var(--u))]"
    >
      <BlockImage
        asset={blok.image}
        alt=""
        sizes="(max-width: 768px) 100vw, 33vw"
        className="relative aspect-[433/262] w-full rounded-card lg:rounded-[calc(20*var(--u))]"
        placeholderTone="sky"
      />
      <h3 className="mt-5 px-4 md:mt-7 md:self-end text-2xl leading-tight font-bold tracking-tight text-brand lg:mt-[calc(36*var(--u))] lg:px-0 lg:text-[length:calc(32*var(--u))] lg:leading-[calc(40*var(--u))] lg:tracking-[-0.05em]">
        {titleLines.map((line, i) => (
          <span key={i} className="lg:block">
            {i > 0 ? " " : ""}
            {line}
          </span>
        ))}
      </h3>
      {blok.description ? (
        <p className="mt-2 px-4 text-[0.9375rem] leading-[1.75] text-ink-muted md:mt-4 lg:mt-[calc(22*var(--u))] lg:min-h-[calc(120*var(--u))] lg:px-0 lg:text-[length:calc(18*var(--u))] lg:leading-[calc(30*var(--u))] lg:tracking-[-0.05em] lg:whitespace-pre-line lg:text-black">
          {blok.description}
        </p>
      ) : null}
    </li>
  );
}

/** Longest title the card sets on one line — "fill out the online forms" is 25. */
const TITLE_ONE_LINE = 28;

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
      <h3 className="mt-4 text-base font-bold text-brand">{blok.title}</h3>
      {blok.description ? (
        <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-muted">{blok.description}</p>
      ) : null}
    </li>
  );
}
