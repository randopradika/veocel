"use client";

import { useId, useState, type ReactNode } from "react";

import { ArrowMarker } from "@/components/ui/ArrowButton";

/**
 * The folded part of a claim card — its footnotes and proof list — and the
 * arrow that opens it.
 *
 * Only this is a client component. `ClaimGrid` renders the card and passes the
 * folded content in as `children`, so the card itself stays on the server and
 * keeps the shared `editable()` helper.
 *
 * The arrow is a filled blue disc in the plate's top-right corner, inset from
 * the corner rather than set on the content's padding, as the reference draws
 * it. The chevron points down while there is more to read and turns up once
 * the card is open. The card is `relative` for it.
 *
 * In the DOM the button sits after the first paragraph and before what it
 * opens, so the reading and tab order runs claim → "more" → the revealed text,
 * even though the disc is drawn at the top.
 */
export function ClaimDetails({ title, children }: { title?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        aria-expanded={open}
        aria-controls={panelId}
        // No visible label, so the name comes from here; `aria-expanded`
        // carries the state, and the name stays put as it changes.
        aria-label={title ? `more about ${title}` : "more about this claim"}
        className="group absolute top-6 right-6 flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand md:right-7"
      >
        <ArrowMarker
          icon="chevron-down"
          tone="brand"
          size="lg"
          className={open ? "rotate-180" : ""}
        />
      </button>

      <div id={panelId} hidden={!open}>
        {children}
      </div>
    </>
  );
}
