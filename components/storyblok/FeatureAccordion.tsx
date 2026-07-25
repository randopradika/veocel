"use client";

import { storyblokEditable, type SbBlokData } from "@storyblok/react";
import { useState } from "react";

import { ArrowMarker } from "@/components/ui/ArrowButton";
import { BlockImage } from "@/components/ui/BlockImage";
import { Container, Section } from "@/components/ui/Container";
import type { AccordionItemBlok, FeatureAccordionBlok, SbBlock } from "@/lib/types";

/**
 * "VEOCEL™ beauty features" — a grid of tiles where one is expanded at a time.
 *
 * The only client component in the block library, because expanding a tile is
 * genuine local state. One tile is open by default, as in the design.
 *
 * Imports `storyblokEditable` from the root entry rather than using the shared
 * `editable()` helper: that helper reads from `@storyblok/react/rsc`, which is a
 * server-only entry point.
 */
function editableAttrs(blok: SbBlock) {
  return storyblokEditable(blok as unknown as SbBlokData);
}

export function FeatureAccordion({ blok }: { blok: FeatureAccordionBlok }) {
  const items = blok.items ?? [];
  const [openUid, setOpenUid] = useState<string | null>(items[0]?._uid ?? null);

  if (items.length === 0) return null;

  return (
    <Section {...editableAttrs(blok)} spacing="default">
      <Container>
        {blok.heading ? (
          <h2 className="text-center text-h2 font-bold text-brand md:text-h1">{blok.heading}</h2>
        ) : null}

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <AccordionTile
              key={item._uid}
              blok={item}
              open={openUid === item._uid}
              onToggle={() => setOpenUid(openUid === item._uid ? null : item._uid)}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}

function AccordionTile({
  blok,
  open,
  onToggle,
}: {
  blok: AccordionItemBlok;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = `feature-panel-${blok._uid}`;

  return (
    <div
      {...editableAttrs(blok)}
      className={`rounded-card p-5 transition-colors duration-200 ${
        open ? "bg-brand-200" : "bg-brand-50 hover:bg-brand-100"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="group flex w-full items-start justify-between gap-4 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
      >
        <span className="flex flex-1 flex-col gap-6">
          {blok.icon?.filename ? (
            <BlockImage
              asset={blok.icon}
              alt=""
              sizes="40px"
              className="relative h-9 w-9"
              imageClassName="object-contain"
            />
          ) : (
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full border border-brand/25"
              aria-hidden
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.2}
                className="h-4 w-4 text-brand"
              >
                <circle cx="12" cy="12" r="7.5" />
                <path d="M12 4.5c2.8 3 2.8 12 0 15M4.5 12c3-2.8 12-2.8 15 0" />
              </svg>
            </span>
          )}

          <span className="font-display text-base font-semibold text-brand">
            {blok.title}
          </span>
        </span>

        <ArrowMarker icon={open ? "minus" : "plus"} tone="outline" size="sm" />
      </button>

      <div id={panelId} hidden={!open}>
        {blok.body ? (
          <p className="mt-4 text-xs leading-relaxed text-brand-800/80">{blok.body}</p>
        ) : null}
      </div>
    </div>
  );
}
