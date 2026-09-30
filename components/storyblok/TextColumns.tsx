import { Container, Section } from "@/components/ui/Container";
import { Markdown } from "@/components/ui/Markdown";
import type { TextColumnsBlok } from "@/lib/types";

import { editable } from "./editable";

/**
 * Editorial copy block, in the two arrangements the design uses:
 *
 *   split  — heading left, body in a column to its right
 *   center — heading centred and full width, body in a narrow column beneath it,
 *            pushed to the right
 */
export function TextColumns({ blok }: { blok: TextColumnsBlok }) {
  const centered = blok.align === "center";

  // Left empty in the CMS, the block would still take a full section's padding
  // and push whatever follows — the sustainability page's claims and
  // certificates — a screen's worth down the page. Empty, it takes no space.
  if (!blok.heading?.trim() && !blok.body?.trim()) return null;

  return (
    <Section
      {...editable(blok)}
      spacing="default"
      // Desktop rhythm from the "dev" board (2053:170): 80px under the hero tabs, 96px to
      // the band (wipes 2053:1040). No padding below, or neighbours would stack; the last
      // block on a page keeps the gap to the band.
      className={centered ? "" : "xl:pt-20 xl:pb-0 xl:last:pb-24"}
    >
      <Container width="design">
        {centered ? (
          <>
            {blok.heading ? (
              <h2 className="text-center text-h2 font-bold text-brand md:text-h1">
                {blok.heading}
              </h2>
            ) : null}
            <Markdown className="mt-12 ml-auto max-w-xl text-base leading-[1.4] md:text-xl text-ink-muted">
              {blok.body}
            </Markdown>
          </>
        ) : (
          // From `xl` the frames' split: heading 240–747, body 847–1679 at 1920,
          // 100px apart (wipes 2053:1040, hygiene 2053:904, beauty 2053:783). The
          // heading column holds 504px below that, so "VEOCEL™ fibers" keeps a line.
          <div className="grid items-start gap-8 md:grid-cols-[1fr_minmax(0,28rem)] md:gap-16 xl:grid-cols-[minmax(31.5rem,507fr)_832fr] xl:gap-[100px]">
            {/* 72px on a 91px line, 20/32 copy 16px lower (2053:1042, 2053:1041). */}
            {blok.heading ? (
              <h2 className="text-h2 font-bold text-brand md:text-h1 xl:text-[4.5rem] xl:leading-[91px]">
                {blok.heading}
              </h2>
            ) : null}
            <Markdown className="text-base leading-[1.4] text-ink-muted md:pt-2 md:text-xl xl:pt-4 xl:leading-8">
              {blok.body}
            </Markdown>
          </div>
        )}
      </Container>
    </Section>
  );
}
