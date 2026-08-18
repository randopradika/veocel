"use client";

import { storyblokEditable, type SbBlokData } from "@storyblok/react";
import { useMemo, useState } from "react";

import { BlockImage } from "@/components/ui/BlockImage";
import { Container, Section } from "@/components/ui/Container";
import { SmartLink } from "@/components/ui/SmartLink";
import type {
  BrandCategoryBlok,
  BrandDirectoryBlok,
  SbBlock,
} from "@/lib/types";

/**
 * "where to buy" — the brand directory, filterable by product category and by
 * first letter.
 *
 * A client component because both filters are local state, and because the
 * alphabet has to know which letters actually have brands behind them: a letter
 * with nothing under it renders disabled rather than disappearing, so the row
 * doesn't reflow every time the category changes.
 *
 * Counts on the category buttons are computed from the brands themselves rather
 * than authored, so they cannot drift from the list.
 *
 * `storyblokEditable` comes from the root entry here, not the shared
 * `editable()` helper, which reads from the server-only `/rsc` entry.
 */
function editableAttrs(blok: SbBlock) {
  return storyblokEditable(blok as unknown as SbBlokData);
}

const ALL = "all";
const OTHER = "#";

const ALPHABET = [..."abcdefghijklmnopqrstuvwxyz", OTHER];

/** Brands starting with a digit or a non-Latin script group under "#". */
function letterOf(name: string): string {
  const first = name.trim()[0]?.toLowerCase() ?? OTHER;
  return /[a-z]/.test(first) ? first : OTHER;
}

export function BrandDirectory({ blok }: { blok: BrandDirectoryBlok }) {
  const categories = blok.categories ?? [];
  // Memoised so the fallback doesn't hand every render a fresh array and defeat
  // the memos below.
  const brands = useMemo(() => blok.brands ?? [], [blok.brands]);

  const [category, setCategory] = useState<string>(ALL);
  const [letter, setLetter] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...brands].sort((a, b) => a.name.localeCompare(b.name)),
    [brands],
  );

  const inCategory = useMemo(
    () => (category === ALL ? sorted : sorted.filter((b) => b.category === category)),
    [sorted, category],
  );

  const available = useMemo(
    () => new Set(inCategory.map((b) => letterOf(b.name))),
    [inCategory],
  );

  const counts = useMemo(() => {
    const map = new Map<string, number>([[ALL, brands.length]]);
    for (const brand of brands) {
      if (!brand.category) continue;
      map.set(brand.category, (map.get(brand.category) ?? 0) + 1);
    }
    return map;
  }, [brands]);

  if (brands.length === 0) return null;

  const visible = letter ? inCategory.filter((b) => letterOf(b.name) === letter) : inCategory;

  function chooseCategory(next: string) {
    setCategory(next);
    // A letter with nothing under the new category would leave an empty grid.
    setLetter(null);
  }

  return (
    <Section {...editableAttrs(blok)} spacing="tight" className="bg-brand-50">
      <Container>
        {blok.heading ? (
          <h2 className="text-center text-h2 font-bold text-brand md:text-h1">{blok.heading}</h2>
        ) : null}

        {blok.intro ? (
          <p className="mx-auto mt-4 max-w-xl text-center text-xs leading-relaxed text-ink-muted">
            {blok.intro}
          </p>
        ) : null}

        <div className="mt-10 flex flex-wrap justify-center gap-6 md:gap-9">
          <CategoryButton
            label={ALL}
            count={counts.get(ALL) ?? 0}
            active={category === ALL}
            onSelect={() => chooseCategory(ALL)}
          />
          {categories.map((item) => (
            <CategoryButton
              key={item._uid}
              blok={item}
              label={item.label}
              count={counts.get(item.label) ?? 0}
              active={category === item.label}
              onSelect={() => chooseCategory(item.label)}
            />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-1.5">
          {ALPHABET.map((entry) => {
            const enabled = available.has(entry);
            const active = letter === entry;

            return (
              <button
                key={entry}
                type="button"
                disabled={!enabled}
                aria-pressed={active}
                aria-label={entry === OTHER ? "brands starting with a number or symbol" : entry}
                onClick={() => setLetter(active ? null : entry)}
                className={`h-6 w-6 rounded-full text-[0.65rem] leading-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  active
                    ? "bg-brand text-white"
                    : enabled
                      ? "bg-brand-200 text-brand-800 hover:bg-brand-300"
                      : "bg-brand-100 text-brand-300"
                }`}
              >
                {entry}
              </button>
            );
          })}
        </div>

        <p className="sr-only" role="status">
          {visible.length} brands shown
        </p>

        {/*
          The letter marker sits inside the first cell of each run, which is what
          puts it mid-row in the design rather than on a line of its own. Cells
          keep the marker's height whether or not they show one, so logos stay on
          a common baseline.
        */}
        {/*
          Separators are drawn per cell rather than as a gap over a tinted
          container: a part-filled last row would otherwise leave the container's
          colour showing as a block where the missing cells would be.
        */}
        <ul className="mt-10 grid grid-cols-2 overflow-hidden rounded-card border-t border-l border-hairline bg-white sm:grid-cols-3 lg:grid-cols-5">
          {visible.map((brand, index) => {
            const current = letterOf(brand.name);
            const starts = index === 0 || letterOf(visible[index - 1].name) !== current;

            return (
              <li key={brand._uid} className="border-r border-b border-hairline bg-white">
                <SmartLink
                  link={brand.link}
                  className="flex h-full flex-col px-4 pt-2 pb-5 transition-colors duration-200 hover:bg-brand-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
                >
                  <span {...editableAttrs(brand)} className="flex h-full flex-col">
                    <span className="h-4 text-[0.7rem] font-semibold text-brand" aria-hidden>
                      {starts ? current : ""}
                    </span>

                    <BlockImage
                      asset={brand.logo}
                      alt={brand.name}
                      sizes="200px"
                      className="relative mt-2 h-14 w-full"
                      imageClassName="object-contain"
                      placeholderTone="neutral"
                    />

                    {/* With a logo the name is the image's alt text; without one
                        it has to be visible or the cell is anonymous. */}
                    {brand.logo?.filename ? null : (
                      <span className="mt-2 text-center text-[0.7rem] leading-snug text-ink-muted">
                        {brand.name}
                      </span>
                    )}
                  </span>
                </SmartLink>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}

function CategoryButton({
  blok,
  label,
  count,
  active,
  onSelect,
}: {
  blok?: BrandCategoryBlok;
  label: string;
  count: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className="group flex w-16 flex-col items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
    >
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-full border transition-colors duration-200 ${
          active
            ? "border-brand bg-brand text-white"
            : "border-hairline bg-white text-brand group-hover:border-brand-300"
        }`}
      >
        {blok?.icon?.filename ? (
          <BlockImage
            asset={blok.icon}
            alt=""
            sizes="24px"
            className="relative h-5 w-5"
            imageClassName="object-contain"
          />
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.3}
            className="h-5 w-5"
            aria-hidden
          >
            <rect x="4" y="4" width="7" height="7" rx="1.5" />
            <rect x="13" y="4" width="7" height="7" rx="1.5" />
            <rect x="4" y="13" width="7" height="7" rx="1.5" />
            <rect x="13" y="13" width="7" height="7" rx="1.5" />
          </svg>
        )}
      </span>

      <span className="text-[0.7rem] leading-none text-brand">
        {label}
        <sup className="ml-0.5 text-[0.55rem]">{count}</sup>
      </span>
    </button>
  );
}
