"use client";

import { storyblokEditable, type SbBlokData } from "@storyblok/react";
import { useMemo, useState } from "react";

import { BlockImage } from "@/components/ui/BlockImage";
import { Container, Section } from "@/components/ui/Container";
import { SmartLink } from "@/components/ui/SmartLink";
import type {
  BrandCategoryBlok,
  BrandDirectoryBlok,
  BrandItemBlok,
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

/**
 * A brand can sit in several categories, comma-separated in the field — the
 * source directory files one brand (Norafin) under all four.
 */
function categoriesOf(brand: BrandItemBlok): string[] {
  return (brand.category ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function BrandDirectory({ blok }: { blok: BrandDirectoryBlok }) {
  const categories = blok.categories ?? [];
  // Memoised so the fallback doesn't hand every render a fresh array and defeat
  // the memos below.
  const brands = useMemo(() => blok.brands ?? [], [blok.brands]);

  const [category, setCategory] = useState<string>(ALL);
  const [letter, setLetter] = useState<string | null>(null);

  // Alphabetical, except the "#" group closes the list as the design draws it —
  // digits would otherwise sort ahead of "a" and open the grid.
  const sorted = useMemo(
    () =>
      [...brands].sort((a, b) => {
        const letterA = letterOf(a.name);
        const letterB = letterOf(b.name);
        if (letterA !== letterB) {
          if (letterA === OTHER) return 1;
          if (letterB === OTHER) return -1;
        }
        return a.name.localeCompare(b.name);
      }),
    [brands],
  );

  const inCategory = useMemo(
    () => (category === ALL ? sorted : sorted.filter((b) => categoriesOf(b).includes(category))),
    [sorted, category],
  );

  const available = useMemo(
    () => new Set(inCategory.map((b) => letterOf(b.name))),
    [inCategory],
  );

  const counts = useMemo(() => {
    const map = new Map<string, number>([[ALL, brands.length]]);
    for (const brand of brands) {
      for (const entry of categoriesOf(brand)) {
        map.set(entry, (map.get(entry) ?? 0) + 1);
      }
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
          <p className="mx-auto mt-4 max-w-xl text-center text-base leading-[1.4] text-ink-muted md:text-xl">
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
                className={`h-6 w-6 rounded-full text-sm leading-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
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
          The design draws no cell boxes: logos sit straight on the tinted band,
          with a hairline rule above the grid and under every row. Per-cell
          bottom borders join into those rules because the columns are flush.

          Most logo files are JPEGs on white, so they blend with `multiply` —
          the white drops out against the band exactly as the frame composites
          them. The trade is that a hover tint would darken through the logo
          too, so the hover cue is the cell's own tint, kept light.
        */}
        <ul className="mt-10 grid grid-cols-2 border-t border-hairline sm:grid-cols-3 lg:grid-cols-5">
          {visible.map((brand, index) => {
            const current = letterOf(brand.name);
            const starts = index === 0 || letterOf(visible[index - 1].name) !== current;

            return (
              <li key={brand._uid} className="border-b border-hairline">
                <SmartLink
                  link={brand.link}
                  className="flex h-full flex-col px-4 pt-2 pb-6 transition-colors duration-200 hover:bg-brand-100/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
                >
                  <span {...editableAttrs(brand)} className="flex h-full flex-col">
                    <span className="h-4 text-sm font-semibold text-brand" aria-hidden>
                      {starts ? current : ""}
                    </span>

                    <BlockImage
                      asset={brand.logo}
                      alt={brand.name}
                      sizes="200px"
                      className="relative mt-3 h-20 w-full"
                      imageClassName="object-contain mix-blend-multiply"
                      placeholderTone="neutral"
                    />

                    {/* With a logo the name is the image's alt text; without one
                        it has to be visible or the cell is anonymous. */}
                    {brand.logo?.filename ? null : (
                      <span className="mt-2 text-center text-sm leading-snug text-ink-muted">
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
            /*
              The icon artwork is a dark glyph. On the filled active circle it
              would stay dark, so invert it to white there — the raster can't
              take `currentColor` the way the fallback SVG does.
            */
            imageClassName={active ? "object-contain brightness-0 invert" : "object-contain"}
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

      <span className="text-sm leading-none text-brand">
        {label}
        <sup className="ml-0.5 text-xs">{count}</sup>
      </span>
    </button>
  );
}
