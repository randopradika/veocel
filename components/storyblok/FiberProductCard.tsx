"use client";

import { storyblokEditable, type SbBlokData } from "@storyblok/react";
import { useEffect, useId, useRef, useState } from "react";

import { ArrowMarker } from "@/components/ui/ArrowButton";
import { BlockImage } from "@/components/ui/BlockImage";
import { resolveHref, SmartLink } from "@/components/ui/SmartLink";
import type { FiberProductCardBlok, SbBlock } from "@/lib/types";

/**
 * One fiber in the portfolio: photograph, then the centred name.
 *
 * The name is the way in. With a `link` set it leads there — a detail page,
 * once one exists. Otherwise, when the card carries anything to show (a
 * description or spec values) it opens the pop-up the "Desktop Dev" revision
 * introduced (frame 2039:359): photograph on the left; name, description and
 * the three spec rows on a tinted plate on the right; a dark scrim behind. A
 * card with neither renders its name as plain text — an underline that goes
 * nowhere is a broken promise, not a style.
 *
 * The pop-up is a native `<dialog>`, which brings focus trapping, Escape, and
 * an inert page for free; only the open flag is React state.
 *
 * Imports `storyblokEditable` from the root entry rather than the shared
 * `editable()` helper, which reads from the server-only `@storyblok/react/rsc`.
 */

export type SpecLabels = { diameter: string; applications: string; features: string };

function editableAttrs(blok: SbBlock) {
  return storyblokEditable(blok as unknown as SbBlokData);
}

/** Blank lines start a new paragraph, as elsewhere in the block library. */
function paragraphs(body?: string): string[] {
  if (!body) return [];
  return body
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

const NAME_FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand";
/** The design underlines every name; here only a name that does something earns it. */
const NAME_ACTIVE = `${NAME_FOCUS} underline underline-offset-4 transition-opacity hover:opacity-75`;

export function FiberProductCard({
  blok,
  labels,
}: {
  blok: FiberProductCardBlok;
  labels: SpecLabels;
}) {
  const specs = (
    [
      [labels.diameter, blok.diameter],
      [labels.applications, blok.applications],
      [labels.features, blok.features],
    ] as Array<[string, string | undefined]>
  ).filter((row): row is [string, string] => Boolean(row[1]));
  const description = paragraphs(blok.description);
  // The small print under the plate — the abbreviations the rows use, one per
  // line, as the editor writes them. Empty, nothing shows.
  const footnotes = (blok.footnotes ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const href = resolveHref(blok.link);
  const hasPopup = !href && (description.length > 0 || specs.length > 0);

  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // `showModal()` makes the page inert but still lets it scroll behind the scrim.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <article {...editableAttrs(blok)}>
      <BlockImage
        asset={blok.image}
        alt=""
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="relative aspect-[457/235] w-full rounded-card"
        placeholderTone="sky"
      />

      {/* 24px at -0.02em in the design (2053:720), once the cards run three across. */}
      <h3 className="mt-5 text-center text-base font-bold text-brand md:text-lg lg:text-2xl lg:tracking-[-0.02em]">
        {href ? (
          <SmartLink link={blok.link} className={NAME_ACTIVE}>
            {blok.name}
          </SmartLink>
        ) : hasPopup ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            className={`cursor-pointer ${NAME_ACTIVE}`}
          >
            {blok.name}
          </button>
        ) : (
          blok.name
        )}
      </h3>

      {hasPopup ? (
        <dialog
          ref={dialogRef}
          aria-labelledby={titleId}
          onClose={() => setOpen(false)}
          onClick={(event) => {
            // A click outside the panel's box lands on the scrim.
            const box = event.currentTarget.getBoundingClientRect();
            const inside =
              event.clientX >= box.left &&
              event.clientX <= box.right &&
              event.clientY >= box.top &&
              event.clientY <= box.bottom;
            if (!inside) setOpen(false);
          }}
          className="m-auto max-h-[calc(100dvh_-_2rem)] w-[min(100%_-_2rem,67.5rem)] overflow-y-auto rounded-[2.375rem] bg-white p-0 text-left text-ink shadow-2xl backdrop:bg-black/70"
        >
          <div className="grid md:grid-cols-2">
            <BlockImage
              asset={blok.detail_image?.filename ? blok.detail_image : blok.image}
              alt=""
              sizes="(max-width: 768px) 100vw, 540px"
              className="relative aspect-[2/1] md:aspect-auto"
              placeholderTone="sky"
            />

            <div className="relative flex flex-col px-7 pt-16 pb-10 md:min-h-[36rem] md:px-14 md:pt-24 md:pb-24">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="close"
                className="group absolute top-5 right-5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:top-7 md:right-8"
              >
                <ArrowMarker icon="close" tone="brand" size="md" />
              </button>

              <h2
                id={titleId}
                className="text-2xl font-bold tracking-[-0.02em] text-brand md:text-[2rem] md:leading-tight"
              >
                {blok.name}
              </h2>

              {description.map((paragraph, index) => (
                <p
                  key={index}
                  className={`max-w-[27rem] text-sm leading-[1.8] text-ink ${
                    index === 0 ? "mt-4" : "mt-3"
                  }`}
                >
                  {paragraph}
                </p>
              ))}

              {/*
                From `md` the plate is sized to hold its own beside the photo
                (asked for on 2026-10-01, from the client's mock-up): 20px
                type, 28px between rows, labels and values breaking onto two
                lines ("fiber / diameter", "standard, fine, / coarse"), values
                right-aligned.
              */}
              {specs.length > 0 ? (
                <dl className="mt-8 space-y-3 rounded-card bg-brand-100 px-5 py-5 text-sm leading-[1.4] md:space-y-7 md:rounded-[1.75rem] md:px-9 md:py-9 md:text-xl md:leading-[1.3]">
                  {specs.map(([label, value]) => (
                    <div key={label} className="flex items-baseline justify-between gap-4 md:gap-8">
                      <dt className="font-bold whitespace-nowrap text-ink md:max-w-[7rem] md:whitespace-normal">
                        {label}
                      </dt>
                      <dd className="text-right text-ink-muted md:max-w-[10.5rem]">{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {footnotes.length > 0 ? (
                <ul className="mt-3 text-xs leading-[1.5] text-ink-muted md:mt-4 md:px-1 md:text-sm">
                  {footnotes.map((line, index) => (
                    <li key={index}>{line}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </dialog>
      ) : null}
    </article>
  );
}
