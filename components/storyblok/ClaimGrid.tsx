import { BlockImage } from "@/components/ui/BlockImage";
import { Container, Section } from "@/components/ui/Container";
import { KeepLastWords, Markdown } from "@/components/ui/Markdown";
import { SmartLink } from "@/components/ui/SmartLink";
import type {
  CertificationItemBlok,
  ClaimCardBlok,
  ClaimGridBlok,
  ProofLinkBlok,
  StoryblokLink,
} from "@/lib/types";

import { CertificateLink } from "./CertificationTile";
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

/**
 * The certificates a proof entry can name, and how to recognise each: `text`
 * finds the words in the entry, `label` the mark on the page's certificates
 * wall whose pop-up they open. The words are the proof copy's own, which
 * doesn't repeat the marks' labels — "USDA biobased product" against "USDA
 * Certified Biobased Product" — hence a table rather than a match on the label.
 *
 * FSC and PEFC take their certificate number with them when the entry gives
 * one, so the whole "FSC® (FSC-C041246)" is the link. The TÜV AUSTRIA entry
 * has no row: it stands for the five OK biodegradable marks at once, and says
 * those certificates are available on request.
 */
const PROOF_CERTIFICATES: { text: RegExp; label: RegExp }[] = [
  { text: /USDA biobased product/i, label: /^USDA\b/i },
  { text: /FSC®?(?:\s*\(FSC-[^)]*\))?/, label: /^FSC\b/ },
  { text: /PEFC(?:\s*\(PEFC\/[^)]*\))?/, label: /^PEFC\b/ },
  { text: /EU Ecolabel/i, label: /EU Ecolabel/i },
  { text: /OEKO-TEX®?\s*STANDARD\s*100/i, label: /STANDARD 100/i },
  { text: /ISEGA/, label: /^ISEGA\b/ },
  { text: /Medically Tested\s*[–-]\s*Tested for Toxins/i, label: /^Medically Tested\b/i },
];

/**
 * The mark a proof entry's name opens: one with a pop-up where several share
 * the name — the two ISEGA certificates — so the name links if either can.
 */
function findCertificate(certificates: CertificationItemBlok[], label: RegExp) {
  const named = certificates.filter((item) => label.test(item.label ?? ""));
  return named.find((item) => item.detail_image?.filename) ?? named[0];
}

type ProofPart =
  | string
  | { text: string; certificate: CertificationItemBlok }
  | { text: string; link: ProofLinkBlok };

/**
 * Whether a link field points anywhere. `resolveHref` would say, but it lives
 * in a client module and this list renders on the server.
 */
function hasTarget(link?: StoryblokLink): boolean {
  return Boolean(link?.url || link?.cached_url || link?.anchor);
}

/** The case-blind first occurrence of any of a proof link's alternatives. */
function findProofLink(entry: string, link: ProofLinkBlok) {
  const haystack = entry.toLowerCase();
  for (const words of (link.text ?? "").split(/\r?\n/).map((line) => line.trim())) {
    const at = words ? haystack.indexOf(words.toLowerCase()) : -1;
    if (at >= 0) return { at, text: entry.slice(at, at + words.length) };
  }
  return null;
}

/**
 * A proof entry cut into plain runs and the things it names: the card's own
 * proof links first (Storyblok's `proof_links`), then the certificates on the
 * page's wall. A name with nowhere to go stays text, and where two matches
 * overlap the earlier one wins.
 */
function linkProof(
  entry: string,
  certificates: CertificationItemBlok[],
  proofLinks: ProofLinkBlok[],
): ProofPart[] {
  const own = proofLinks.flatMap((link) => {
    const found =
      link.detail_image?.filename || hasTarget(link.link) ? findProofLink(entry, link) : null;
    return found ? [{ ...found, link }] : [];
  });
  const marks = PROOF_CERTIFICATES.flatMap(({ text, label }) => {
    const certificate = findCertificate(certificates, label);
    const match = certificate ? text.exec(entry) : null;
    return match && certificate ? [{ at: match.index, text: match[0], certificate }] : [];
  });
  const matches = [...own, ...marks].sort((a, b) => a.at - b.at);

  const parts: ProofPart[] = [];
  let from = 0;
  for (const match of matches) {
    if (match.at < from) continue;
    if (match.at > from) parts.push(entry.slice(from, match.at));
    parts.push(
      "link" in match
        ? { text: match.text, link: match.link }
        : { text: match.text, certificate: match.certificate },
    );
    from = match.at + match.text.length;
  }
  if (from < entry.length) parts.push(entry.slice(from));
  return parts;
}

/** One proof entry per line; blank lines are skipped. */
function lines(value?: string): string[] {
  return (value ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * `certificates` are the marks on the page's certificates wall, which the
 * proof entries link into (see `PROOF_CERTIFICATES`).
 */
export function ClaimGrid({
  blok,
  certificates = [],
  proofLinks = [],
}: {
  blok: ClaimGridBlok;
  certificates?: CertificationItemBlok[];
  /** Documents named anywhere in the site's claims (see `BlockRenderer`). */
  proofLinks?: ProofLinkBlok[];
}) {
  const items = blok.items ?? [];
  if (!blok.heading && items.length === 0) return null;

  return (
    <Section
      {...editable(blok)}
      spacing="default"
      // Desktop rhythm from the "dev" board (2053:170): 90px above, 94px to the band
      // (sustainability 2053:474). No padding below, or neighbours would stack; the last
      // block on a page keeps the gap to the band.
      className="xl:pt-[90px] xl:pb-0 xl:last:pb-[94px]"
    >
      <Container width="design">
        {blok.heading ? (
          <>
            {/* 72px on a 110px line from `xl` (2053:475, 2097:205). */}
            <h2 className="text-h2 font-bold text-brand md:text-h1 xl:text-[4.5rem] xl:leading-[110px]">
              {blok.heading}
            </h2>
            {/* The design rules a hairline under the heading, across the column. */}
            <div className="mt-5 border-t border-hairline xl:mt-[5px]" aria-hidden />
          </>
        ) : null}

        {/*
          Cards in a row stretch to one height at rest. Once one is open, its
          partner in the row — the next card after an odd one, the one before
          an even one — drops back to its own height, rather than growing an
          empty plate beside the open card. Two columns only, so from `md`.
          From `xl` the frames' 694px cards, 52px apart and ~50px between rows
          (claims & certifications 2097:116), 47px under the rule (2053:474).
        */}
        {items.length > 0 ? (
          <div
            className={`${blok.heading ? "mt-10 xl:mt-[47px] " : ""}grid gap-6 md:grid-cols-2 md:gap-10 xl:gap-x-[52px] xl:gap-y-[50px] md:[&>:nth-child(odd):has([aria-expanded=true])+*]:self-start md:[&>:nth-child(odd):has(+*_[aria-expanded=true])]:self-start`}
          >
            {items.map((item) => (
              <ClaimCard
                key={item._uid}
                blok={item}
                certificates={certificates}
                proofLinks={proofLinks}
              />
            ))}
          </div>
        ) : null}
      </Container>
    </Section>
  );
}

const PROOF_LINK =
  "text-brand underline decoration-brand/40 underline-offset-2 transition-colors hover:decoration-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

/**
 * A card's own proof link: a document in the certificate pop-up when it has an
 * image, otherwise its `link` — a study or a folder that lives elsewhere.
 */
function ProofLink({ blok, children }: { blok: ProofLinkBlok; children: string }) {
  if (blok.detail_image?.filename) {
    return (
      <CertificateLink
        blok={{
          _uid: blok._uid,
          component: "certification_item",
          label: blok.title || children,
          detail_image: blok.detail_image,
          detail_pages: blok.detail_pages,
        }}
      >
        {children}
      </CertificateLink>
    );
  }
  return (
    <SmartLink link={blok.link} className={PROOF_LINK}>
      {children}
    </SmartLink>
  );
}

function ClaimCard({
  blok,
  certificates,
  proofLinks,
}: {
  blok: ClaimCardBlok;
  certificates: CertificationItemBlok[];
  proofLinks: ProofLinkBlok[];
}) {
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
                  {linkProof(entry, certificates, [...(blok.proof_links ?? []), ...proofLinks]).map((part, at) =>
                    typeof part === "string" ? (
                      <KeepLastWords key={at} text={part} />
                    ) : "certificate" in part ? (
                      <CertificateLink key={at} blok={part.certificate}>
                        {part.text}
                      </CertificateLink>
                    ) : (
                      <ProofLink key={at} blok={part.link}>
                        {part.text}
                      </ProofLink>
                    ),
                  )}
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
