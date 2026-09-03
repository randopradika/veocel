import { BlockImage } from "@/components/ui/BlockImage";
import { Container, Section } from "@/components/ui/Container";
import type { FiberPortfolioBlok, PortfolioColumnBlok } from "@/lib/types";

import { editable } from "./editable";

/**
 * The nonwoven portfolio comparison — one column per fiber variant, one row per
 * attribute.
 *
 * A real `<table>` with `scope`d headers, not a grid of divs: this is a lookup
 * matrix, and a screen reader announcing "Lyocell Skin, Key Applications" for a
 * cell is what makes it readable at all. Below its natural width it scrolls
 * sideways rather than reflowing, because collapsing a comparison into stacked
 * cards destroys the comparison.
 */

/** Splits a textarea field into lines, tolerating Windows line endings. */
function lines(value?: string): string[] {
  if (!value) return [];
  return value.replace(/\r\n/g, "\n").split("\n");
}

export function FiberPortfolio({ blok }: { blok: FiberPortfolioBlok }) {
  const columns = blok.columns ?? [];
  const rowLabels = lines(blok.row_labels)
    .map((label) => label.trim())
    .filter(Boolean);

  if (columns.length === 0 || rowLabels.length === 0) return null;

  return (
    <Section {...editable(blok)} spacing="tight">
      <Container>
        <div className="grid items-start gap-6 md:grid-cols-[1fr_minmax(0,22rem)] md:gap-16">
          {blok.heading ? (
            <h2 className="max-w-3xl text-h2 font-bold text-brand md:text-h1">
              {blok.heading}
            </h2>
          ) : null}

          {blok.intro ? (
            <p className="text-base leading-[1.4] text-ink-muted md:pt-2 md:text-xl">{blok.intro}</p>
          ) : null}
        </div>

        {/* Below ~44rem the columns get too narrow to read; scroll instead. */}
        <div className="mt-12 overflow-x-auto">
          {/*
            `table-fixed` keeps every variant column the same width whatever the
            cell text does — otherwise "Beauty Sheet Masks, Patches" would starve
            its neighbours.
          */}
          <table className="w-full min-w-[44rem] table-fixed border-separate border-spacing-1">
            <thead>
              <tr>
                {/* Corner cell heads neither a row nor a column, so not a `th`. */}
                <td className="w-1/4" />
                {columns.map((column) => (
                  <ColumnHeader key={column._uid} blok={column} />
                ))}
              </tr>
            </thead>

            <tbody>
              {rowLabels.map((label, row) => (
                <tr key={label}>
                  <th
                    scope="row"
                    className="rounded-sm bg-brand-100 px-4 py-3 text-left text-[0.9375rem] font-semibold text-brand-800"
                  >
                    {label}
                  </th>

                  {/*
                    Cells align by line: line N of a column's `values` fills the
                    row named by line N of `row_labels`. A missing line leaves the
                    cell empty rather than pulling the rest of the column up.
                  */}
                  {columns.map((column) => (
                    <td
                      key={column._uid}
                      className="rounded-sm bg-brand-50 px-3 py-3 text-center text-sm leading-snug text-ink-muted"
                    >
                      {lines(column.values)[row]?.trim() ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </Section>
  );
}

function ColumnHeader({ blok }: { blok: PortfolioColumnBlok }) {
  return (
    <th scope="col" className="px-3 pb-5 align-bottom">
      <span {...editable(blok)} className="flex flex-col items-center">
        <BlockImage
          asset={blok.image}
          alt=""
          sizes="80px"
          className="relative aspect-square w-16 rounded-full md:w-20"
          placeholderTone="neutral"
        />

        <span className="mt-3 block text-[0.9375rem] leading-snug font-bold text-brand-800">
          {blok.title}
        </span>

        {blok.subtitle ? (
          <span className="mt-0.5 block text-sm leading-snug font-normal text-ink-muted">
            {blok.subtitle}
          </span>
        ) : null}
      </span>
    </th>
  );
}
