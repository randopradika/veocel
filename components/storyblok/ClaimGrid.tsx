import { BlockImage } from "@/components/ui/BlockImage";
import { Container, Section } from "@/components/ui/Container";
import { Markdown } from "@/components/ui/Markdown";
import type { ClaimCardBlok, ClaimGridBlok } from "@/lib/types";

import { editable } from "./editable";

/**
 * The environmental-responsibility claims: a ruled heading, then two-up cards
 * on tinted plates — a line-drawn mark, the claim, its footnotes, and the list
 * of documents behind it.
 *
 * The proof list is separate from the body so it can render as a real list;
 * its caption is a field of its own so it can be translated per language, with
 * "proof:" — the design's word — as the fallback.
 *
 * Cards are static. The design shows every claim in full, so there is nothing
 * to fold away — this is not another `feature_accordion` arrangement.
 */

/**
 * Escapes the `*` that opens a footnote paragraph.
 *
 * Claim copy marks a footnote by starting the paragraph with `*` (see
 * `ClaimCardBlok` in `lib/types.ts`), which Markdown would otherwise read as a
 * bullet. Escaping keeps the asterisk visible and the footnote a paragraph.
 */
function escapeFootnotes(body?: string): string | undefined {
  return body?.replace(/^\*(?=\s)/gm, "\\*");
}

/** One proof entry per line; blank lines are skipped. */
function lines(value?: string): string[] {
  return (value ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function ClaimGrid({ blok }: { blok: ClaimGridBlok }) {
  const items = blok.items ?? [];
  if (!blok.heading && items.length === 0) return null;

  return (
    <Section {...editable(blok)} spacing="default">
      <Container>
        {blok.heading ? (
          <>
            <h2 className="text-h2 font-bold text-brand md:text-h1">
              {blok.heading}
            </h2>
            {/* The design rules a hairline under the heading, across the column. */}
            <div className="mt-5 border-t border-hairline" aria-hidden />
          </>
        ) : null}

        {items.length > 0 ? (
          <div className={`${blok.heading ? "mt-10 " : ""}grid gap-6 md:grid-cols-2 md:gap-10`}>
            {items.map((item) => (
              <ClaimCard key={item._uid} blok={item} />
            ))}
          </div>
        ) : null}
      </Container>
    </Section>
  );
}

function ClaimCard({ blok }: { blok: ClaimCardBlok }) {
  const proof = lines(blok.proof);

  return (
    <div {...editable(blok)} className="rounded-panel bg-brand-100 p-8 md:p-14">
      {blok.icon?.filename ? (
        <BlockImage
          asset={blok.icon}
          alt=""
          sizes="56px"
          className="relative h-14 w-14"
          imageClassName="object-contain"
        />
      ) : null}

      <h3 className="mt-8 font-display text-2xl font-bold tracking-[-0.05em] text-brand">{blok.title}</h3>

      <Markdown className="mt-4 text-[0.9375rem] leading-[1.6] text-brand-800/80">
        {escapeFootnotes(blok.body)}
      </Markdown>

      {proof.length > 0 ? (
        <>
          <p className="mt-4 text-[0.9375rem] leading-[1.6] text-brand-800/80">
            {blok.proof_label || "proof:"}
          </p>
          <ul className="mt-1 list-disc pl-5 text-[0.9375rem] leading-[1.6] text-brand-800/80">
            {proof.map((entry, index) => (
              <li key={index}>{entry}</li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
