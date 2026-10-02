"use client";

import { storyblokEditable, type SbBlokData } from "@storyblok/react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { ArrowMarker } from "@/components/ui/ArrowButton";
import { BlockImage } from "@/components/ui/BlockImage";
import { resolveHref, SmartLink } from "@/components/ui/SmartLink";
import type { CertificationItemBlok, SbBlock } from "@/lib/types";

/**
 * One mark on the certificates wall.
 *
 * With a `detail_image` the mark — artwork and name both — opens it in a pop-up,
 * the certificate itself, on the same native `<dialog>` as the fiber pop-up
 * (`FiberProductCard`): focus trapping, Escape and an inert page for free, and a
 * click on the scrim closes it. The name then reads as a link. Without one the
 * mark is not clickable at all; its `link` lives only inside the pop-up.
 *
 * `detail_pages` carries a certificate's further pages — the TÜV "OK" PDFs hold
 * three certificates each — and the pop-up scrolls through them.
 *
 * The pop-up itself is `CertificateDialog`, shared with `CertificateLink` —
 * the same certificate opened from a claim card's proof list.
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
 * One size for every certificate pop-up, whatever its image: 56rem × 44rem, or
 * the screen less a 1rem margin where that is smaller. The image takes whatever
 * height the name, note and link leave and scales to fit inside it, so the
 * dialog never scrolls and a landscape certificate opens in the same box as a
 * square logo.
 */
const DIALOG_SIZE = "h-[min(100dvh_-_2rem,44rem)] w-[min(100vw_-_2rem,56rem)]";

/**
 * A document of several pages takes the screen's height (less the same 1rem
 * margin), so each page — fitted whole into the scroll area, see
 * `CertificateDialog` — is as large as the screen allows.
 */
const DOCUMENT_SIZE = "h-[calc(100dvh_-_2rem)] w-[min(100vw_-_2rem,64rem)]";

export function CertificationTile({ blok }: { blok: CertificationItemBlok }) {
  const detail = Boolean(blok.detail_image?.filename);
  const [open, setOpen] = useState(false);

  const face = (
    <span {...editableAttrs(blok)} className="block">
      {/*
        From `lg` the frames' tile: 5:3 (341 x 204, 272 x 164), a 20px radius
        and a #0f7ab8 hairline, the mark inset about a quarter of the width and
        a sixth of the height — FSC 149px tall, OK SOIL 143px wide, as drawn.
      */}
      <span className="relative block h-24 rounded-card border border-hairline bg-white transition-colors duration-200 group-hover:border-brand-300 lg:aspect-[5/3] lg:h-auto lg:rounded-[20px] lg:border-[#0f7ab8] lg:group-hover:border-brand-700">
        <BlockImage
          asset={blok.logo}
          alt={blok.label ?? ""}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
          className="absolute inset-4 lg:inset-x-[23.5%] lg:inset-y-[17.5%]"
          imageClassName="object-contain"
          placeholderTone="neutral"
        />
      </span>

      {/*
        Both lines stay on `ink-muted`. The note is secondary by size alone —
        dropping it to `ink-faint` at this size would put it under 3:1 on white.
      */}
      {blok.label ? (
        <span
          className={`mt-2.5 block text-center lg:mt-2 text-base font-bold leading-[2] ${
            detail
              ? "text-brand underline decoration-brand/40 underline-offset-4 transition-colors group-hover:decoration-brand"
              : "text-ink-muted lg:text-[#4d4d4d]"
          }`}
        >
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

  if (!detail) return <div className="block w-full">{face}</div>;

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

      <CertificateDialog blok={blok} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/**
 * A certificate named inside running text — a claim card's proof entry — that
 * opens the same pop-up as its mark on the wall. Without a `detail_image` it
 * is plain text: there is nothing to open.
 */
export function CertificateLink({
  blok,
  children,
}: {
  blok: CertificationItemBlok;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  if (!blok.detail_image?.filename) return <>{children}</>;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="cursor-pointer text-left text-brand underline decoration-brand/40 underline-offset-2 transition-colors hover:decoration-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {children}
      </button>
      <CertificateDialog blok={blok} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function CertificateDialog({
  blok,
  open,
  onClose,
}: {
  blok: CertificationItemBlok;
  open: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const pages = [blok.detail_image, ...(blok.detail_pages ?? [])].filter(
    (page): page is NonNullable<typeof page> => Boolean(page?.filename),
  );

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
    <dialog
      ref={dialogRef}
      aria-labelledby={blok.label ? titleId : undefined}
      aria-label={blok.label ? undefined : "certificate"}
      onClose={onClose}
      onClick={(event) => {
        // A click outside the panel's box lands on the scrim.
        const box = event.currentTarget.getBoundingClientRect();
        const inside =
          event.clientX >= box.left &&
          event.clientX <= box.right &&
          event.clientY >= box.top &&
          event.clientY <= box.bottom;
        if (!inside) onClose();
      }}
      className={`m-auto ${pages.length > 1 ? DOCUMENT_SIZE : DIALOG_SIZE} overflow-hidden rounded-[2.375rem] bg-white p-0 text-left text-ink shadow-2xl backdrop:bg-black/70`}
    >
      <div className="relative flex h-full flex-col px-6 pt-16 pb-8 md:px-12 md:pt-20 md:pb-10">
        <button
          type="button"
          onClick={() => onClose()}
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

        {pages.length > 1 ? (
          // Several pages scroll one whole page at a time: each is fitted into the
          // full height of the scroll area, so a page reads without scrolling
          // inside it, and the scroll snaps from one page to the next.
          <div
            className={`min-h-0 w-full flex-1 snap-y snap-mandatory space-y-4 overflow-y-auto overscroll-contain ${
              blok.label || blok.note ? "mt-6" : ""
            }`}
          >
            {pages.map((page, index) => {
              return (
                <BlockImage
                  key={page.id ?? index}
                  asset={page}
                  alt={blok.label ? `${blok.label}, page ${index + 1}` : ""}
                  sizes="(max-width: 768px) 100vw, 64rem"
                  className="relative h-full w-full snap-start"
                  imageClassName="object-contain"
                  placeholderTone="neutral"
                  onContextMenu={(event) => event.preventDefault()}
                  draggable={false}
                />
              );
            })}
          </div>
        ) : (
          <div className={`relative min-h-0 w-full flex-1 ${blok.label || blok.note ? "mt-6" : ""}`}>
            <BlockImage
              asset={blok.detail_image}
              alt={blok.label ?? ""}
              sizes="(max-width: 768px) 100vw, 56rem"
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
        )}

        {/*
          The mark's own `link` — the issuer's page, set whether or not this
          pop-up has a detail image — still has somewhere to go once the
          image takes over the click: it moves down here rather than
          disappearing.
        */}
        {resolveHref(blok.link) ? (
          <p className="mt-4 shrink-0 text-center text-sm">
            <SmartLink link={blok.link} className="text-brand underline underline-offset-2">
              verify at the issuer’s site
            </SmartLink>
          </p>
        ) : null}
      </div>
    </dialog>
  );
}
