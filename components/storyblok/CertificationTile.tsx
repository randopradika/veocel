"use client";

import { storyblokEditable, type SbBlokData } from "@storyblok/react";
import { useEffect, useId, useRef, useState } from "react";

import { ArrowMarker } from "@/components/ui/ArrowButton";
import { BlockImage } from "@/components/ui/BlockImage";
import { resolveHref, SmartLink } from "@/components/ui/SmartLink";
import { naturalSize } from "@/lib/image";
import type { CertificationItemBlok, SbBlock } from "@/lib/types";

/**
 * One mark on the certificates wall.
 *
 * With a `detail_image` the mark opens it in a pop-up — the certificate itself,
 * say — on the same native `<dialog>` as the fiber pop-up (`FiberProductCard`):
 * focus trapping, Escape and an inert page for free, and a click on the scrim
 * closes it. Without one the mark keeps its `link`, if it has one.
 *
 * A client component for the open flag alone; the wall around it renders on the
 * server. Imports `storyblokEditable` from the root entry rather than the shared
 * `editable()` helper, which reads from the server-only `@storyblok/react/rsc`.
 */

function editableAttrs(blok: SbBlock) {
  return storyblokEditable(blok as unknown as SbBlokData);
}

const TILE =
  "group block w-full rounded-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand";

/**
 * Height the pop-up spends on everything but the image — its padding, the name
 * and note, and the margin around the dialog — so a tall certificate is sized to
 * fit the screen whole instead of scrolling.
 */
const CHROME = "16rem";

export function CertificationTile({ blok }: { blok: CertificationItemBlok }) {
  const detail = blok.detail_image?.filename ? blok.detail_image : null;
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

  const face = (
    <span {...editableAttrs(blok)} className="block">
      <BlockImage
        asset={blok.logo}
        alt={blok.label ?? ""}
        sizes="(max-width: 640px) 50vw, 20vw"
        className="relative block h-24 rounded-card border border-hairline bg-white transition-colors duration-200 group-hover:border-brand-300"
        imageClassName="object-contain p-4"
        placeholderTone="neutral"
      />

      {/*
        Both lines stay on `ink-muted`. The note is secondary by size alone —
        dropping it to `ink-faint` at this size would put it under 3:1 on white.
      */}
      {blok.label ? (
        <span className="mt-2.5 block text-center text-base font-bold leading-[2] text-ink-muted">
          {blok.label}
        </span>
      ) : null}

      {blok.note ? (
        <span className="mt-0.5 block text-center text-sm leading-snug text-ink-muted">
          {blok.note}
        </span>
      ) : null}
    </span>
  );

  if (!detail) {
    return (
      <SmartLink link={blok.link} className={TILE}>
        {face}
      </SmartLink>
    );
  }

  // The image box takes the picture's own proportions, and no wider than lets
  // its height fit the screen; the dialog then shrinks to it, so a portrait
  // certificate does not sit in a landscape panel.
  const size = naturalSize(detail.filename);
  const ratio = size ? size.width / size.height : 4 / 3;
  const fitWidth = `calc((100dvh - ${CHROME}) * ${ratio})`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`${TILE} cursor-pointer`}
      >
        {face}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={blok.label ? titleId : undefined}
        aria-label={blok.label ? undefined : "certificate"}
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
        style={{ width: `min(100% - 2rem, 60rem, ${fitWidth} + 6rem)` }}
        className="m-auto max-h-[calc(100dvh_-_2rem)] overflow-y-auto rounded-[2.375rem] bg-white p-0 text-left text-ink shadow-2xl backdrop:bg-black/70"
      >
        <div className="relative px-6 pt-16 pb-8 md:px-12 md:pt-20 md:pb-12">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="close"
            className="group absolute top-5 right-5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:top-7 md:right-8"
          >
            <ArrowMarker icon="close" tone="brand" size="md" />
          </button>

          {blok.label ? (
            <h2 id={titleId} className="text-2xl font-bold tracking-[-0.02em] text-brand">
              {blok.label}
            </h2>
          ) : null}
          {blok.note ? <p className="mt-1 text-sm leading-snug text-ink-muted">{blok.note}</p> : null}

          <div
            className={`relative mx-auto w-full ${blok.label || blok.note ? "mt-6" : ""}`}
            style={{ aspectRatio: String(ratio), maxWidth: fitWidth }}
          >
            <BlockImage
              asset={detail}
              alt={blok.label ?? ""}
              sizes="(max-width: 768px) 100vw, 60rem"
              className="absolute inset-0"
              imageClassName="object-contain"
              placeholderTone="neutral"
              // A right-click or a drag both hand a visitor the file underneath
              // the pop-up in one step; the wall's other marks don't carry a
              // document worth saving, so only this view needs the guard.
              onContextMenu={(event) => event.preventDefault()}
              draggable={false}
            />
          </div>

          {/*
            The mark's own `link` — the issuer's page, set whether or not this
            pop-up has a detail image — still has somewhere to go once the
            image takes over the click: it moves down here rather than
            disappearing.
          */}
          {resolveHref(blok.link) ? (
            <p className="mt-4 text-center text-sm">
              <SmartLink link={blok.link} className="text-brand underline underline-offset-2">
                verify at the issuer’s site
              </SmartLink>
            </p>
          ) : null}
        </div>
      </dialog>
    </>
  );
}
