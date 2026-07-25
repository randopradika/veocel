import { BlockImage } from "@/components/ui/BlockImage";
import { Container } from "@/components/ui/Container";
import type { PageHeroBlok } from "@/lib/types";

import { editable } from "./editable";

/**
 * Category page opener — shorter than the home hero, with the title bottom-left.
 *
 * `dark` sets white type over a scrim on photography; `light` is the fallback for
 * pages without a hero image, using brand type on a tint. Top padding leaves room
 * for the fixed header, which sits transparently over this block.
 */
export function PageHero({ blok }: { blok: PageHeroBlok }) {
  const dark = (blok.theme ?? "dark") === "dark";

  return (
    <section
      {...editable(blok)}
      // Only a dark hero can sit under a transparent header; a light one would
      // leave the header's white type invisible.
      data-hero={dark ? "" : undefined}
      className={`relative isolate flex min-h-[58svh] items-end overflow-hidden ${
        dark ? "bg-brand-700" : "bg-brand-100"
      }`}
    >
      {dark ? (
        <>
          <BlockImage
            asset={blok.image}
            alt={blok.title}
            priority
            sizes="100vw"
            className="absolute inset-0 -z-10"
            placeholderTone="brand"
          />
          <div
            className="absolute inset-0 -z-10 bg-gradient-to-r from-black/55 via-black/25 to-transparent"
            aria-hidden
          />
        </>
      ) : null}

      <Container className={`pt-40 pb-14 ${dark ? "text-white" : "text-brand"}`}>
        <h1 className="max-w-3xl text-h1 font-bold md:text-[3.75rem] md:leading-[1.05]">
          {blok.title}
        </h1>

        {blok.subtitle ? (
          <p className={`mt-4 max-w-xl text-sm ${dark ? "text-white/85" : "text-ink-muted"}`}>
            {blok.subtitle}
          </p>
        ) : null}
      </Container>
    </section>
  );
}
