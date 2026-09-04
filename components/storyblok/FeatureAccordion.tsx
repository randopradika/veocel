"use client";

import { storyblokEditable, type SbBlokData } from "@storyblok/react";
import { useState } from "react";

import { ArrowMarker } from "@/components/ui/ArrowButton";
import { BlockImage } from "@/components/ui/BlockImage";
import { Container, Section } from "@/components/ui/Container";
import { Markdown } from "@/components/ui/Markdown";
import type { AccordionItemBlok, FeatureAccordionBlok, SbBlock } from "@/lib/types";

/**
 * One expandable item open at a time, in the three arrangements the design uses:
 *
 *   tiles — compact three-up tiles led by an icon
 *   cards — two-up cards led by a photograph, for product applications
 *   rows  — full-width rows under a large heading, for long-form copy
 *
 * All three share the single-open behaviour and differ only in presentation, so
 * they live in one block rather than three that would drift apart — the same
 * reasoning as `process_row`'s `row`/`ring`.
 *
 * The only client component in the block library, because expanding an item is
 * genuine local state. The first item is open by default, as in the design.
 *
 * Imports `storyblokEditable` from the root entry rather than using the shared
 * `editable()` helper: that helper reads from `@storyblok/react/rsc`, which is a
 * server-only entry point.
 */
function editableAttrs(blok: SbBlock) {
  return storyblokEditable(blok as unknown as SbBlokData);
}

const GRID = {
  tiles: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
  cards: "grid gap-5 md:grid-cols-2",
  rows: "flex flex-col gap-5",
} as const;

export function FeatureAccordion({ blok }: { blok: FeatureAccordionBlok }) {
  const items = blok.items ?? [];
  const layout = blok.layout ?? "tiles";
  const [openUid, setOpenUid] = useState<string | null>(items[0]?._uid ?? null);

  if (items.length === 0) return null;

  const Item =
    layout === "cards" ? AccordionCard : layout === "rows" ? AccordionRow : AccordionTile;

  return (
    <Section {...editableAttrs(blok)} spacing={layout === "tiles" ? "default" : "tight"}>
      <Container>
        {blok.heading ? (
          <h2 className="text-center text-h2 font-bold text-brand md:text-h1">{blok.heading}</h2>
        ) : null}

        <div className={`${blok.heading ? "mt-14 " : ""}${GRID[layout]}`}>
          {items.map((item) => (
            <Item
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

type ItemProps = { blok: AccordionItemBlok; open: boolean; onToggle: () => void };

/**
 * Application card: photograph, centred name, copy on expand.
 *
 * The marker fills in when open, matching the selected hero tab — one meaning
 * for a filled blue disc across the site. The design draws the open marker
 * hollow on the full-width rows and filled on these cards; keeping it filled in
 * both places is a deliberate deviation.
 */
function AccordionCard({ blok, open, onToggle }: ItemProps) {
  const panelId = `feature-panel-${blok._uid}`;

  return (
    <div
      {...editableAttrs(blok)}
      className={`rounded-panel p-4 transition-colors duration-200 ${
        open ? "bg-brand-100" : "border border-hairline bg-white hover:border-brand-300"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="group block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
      >
        <span className="relative block">
          <BlockImage
            asset={blok.image}
            alt=""
            sizes="(max-width: 768px) 100vw, 50vw"
            className="relative block aspect-[12/5] w-full rounded-card"
            placeholderTone="sky"
          />
          <span className="absolute top-3 right-3">
            <ArrowMarker
              icon={open ? "chevron-up" : "chevron-down"}
              tone={open ? "brand" : "onImage"}
              size="md"
            />
          </span>
        </span>

        <span className="mt-4 block text-center font-display text-h3 font-bold text-brand">
          {blok.title}
        </span>
      </button>

      <div id={panelId} hidden={!open}>
        <Markdown
          className="mt-3 px-4 text-center text-[0.9375rem] leading-relaxed text-brand-800/80"
          gap="tight"
        >
          {blok.body}
        </Markdown>
      </div>
    </div>
  );
}

/** Full-width row: a large fiber name, with the detail folded away beneath it. */
function AccordionRow({ blok, open, onToggle }: ItemProps) {
  const panelId = `feature-panel-${blok._uid}`;

  return (
    <div
      {...editableAttrs(blok)}
      className={`rounded-panel px-7 py-6 transition-colors duration-200 md:px-9 ${
        open ? "bg-brand-100" : "border border-hairline bg-white hover:border-brand-300"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="group flex w-full items-center justify-between gap-6 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
      >
        <span className="font-display text-[1.5rem] leading-tight text-brand md:text-[1.75rem]">
          {blok.title}
        </span>
        <ArrowMarker
          icon={open ? "chevron-up" : "chevron-down"}
          tone={open ? "brand" : "onImage"}
          size="lg"
        />
      </button>

      <div id={panelId} hidden={!open}>
        <Markdown
          className="mt-5 max-w-4xl text-[0.9375rem] leading-relaxed text-brand-800/80"
          gap="loose"
        >
          {blok.body}
        </Markdown>
      </div>
    </div>
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
        <Markdown className="mt-4 text-[0.9375rem] leading-relaxed text-brand-800/80">
          {blok.body}
        </Markdown>
      </div>
    </div>
  );
}
