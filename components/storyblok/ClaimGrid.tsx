import { BlockImage } from "@/components/ui/BlockImage";
import { Container, Section } from "@/components/ui/Container";
import { KeepLastWords, Markdown } from "@/components/ui/Markdown";
import type { ClaimCardBlok, ClaimGridBlok } from "@/lib/types";

import { ClaimDetails } from "./ClaimDetails";
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
 * Each card opens on its icon, title and the claim's first paragraph, with an
 * arrow in the corner; the footnotes and proof list fold away behind it (see
 * `ClaimDetails`). The design draws every claim in full, and the cards were
 * static to match until the arrow was asked back for on 2026-09-18. Cards open
 * independently — not another `feature_accordion` arrangement, which keeps one
 * item open at a time and hides the whole body.
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

/**
 * The body's first paragraph, which stays on the folded card, and the rest —
 * the footnotes, on the cards that have them. Paragraphs are split on a blank
 * line, as Markdown splits them.
 */
function splitBody(body?: string): { lead?: string; rest?: string } {
  const text = body?.replace(/\r\n/g, "\n").trim();
  if (!text) return {};

  const at = text.search(/\n\s*\n/);
  if (at < 0) return { lead: text };
  return { lead: text.slice(0, at), rest: text.slice(at).trim() };
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

        {/*
          Cards in a row stretch to one height at rest. Once one is open, its
          partner in the row — the next card after an odd one, the one before
          an even one — drops back to its own height, rather than growing an
          empty plate beside the open card. Two columns only, so from `md`.
        */}
        {items.length > 0 ? (
          <div
            className={`${blok.heading ? "mt-10 " : ""}grid gap-6 md:grid-cols-2 md:gap-10 md:[&>:nth-child(odd):has([aria-expanded=true])+*]:self-start md:[&>:nth-child(odd):has(+*_[aria-expanded=true])]:self-start`}
          >
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
  const { lead, rest } = splitBody(escapeFootnotes(blok.body));

  const details =
    rest || proof.length > 0 ? (
      <>
        <Markdown
          className="mt-4 text-[0.9375rem] leading-[1.6] text-pretty text-brand-800/80"
          keepLastWords
        >
          {rest}
        </Markdown>

        {proof.length > 0 ? (
          <>
            <p className="mt-4 text-[0.9375rem] leading-[1.6] text-brand-800/80">
              {blok.proof_label || "proof:"}
            </p>
            <ul className="mt-1 list-disc pl-5 text-[0.9375rem] leading-[1.6] text-pretty text-brand-800/80">
              {proof.map((entry, index) => (
                <li key={index}>
                  <KeepLastWords text={entry} />
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </>
    ) : null;

  return (
    // `relative` for the arrow in the corner (see ClaimDetails).
    <div {...editable(blok)} className="relative rounded-panel bg-brand-100 p-8 md:p-14">
      {blok.icon?.filename ? (
        <BlockImage
          asset={blok.icon}
          alt=""
          sizes="56px"
          className="relative h-14 w-14"
          imageClassName="object-contain"
        />
      ) : null}

      {/*
        The mark sits above the title; with no mark the title leads the plate,
        level with the corner arrow, and keeps clear of it.
      */}
      <h3
        className={`${blok.icon?.filename ? "mt-8 " : details ? "pr-12 md:pr-4 " : ""}font-display text-2xl font-bold tracking-[-0.05em] text-brand`}
      >
        {blok.title}
      </h3>

      <Markdown
        className="mt-4 text-[0.9375rem] leading-[1.6] text-pretty text-brand-800/80"
        keepLastWords
      >
        {lead}
      </Markdown>

      {/* A card with nothing past its first paragraph gets no arrow to press. */}
      {details ? <ClaimDetails title={blok.title}>{details}</ClaimDetails> : null}
    </div>
  );
}
