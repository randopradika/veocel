import { ArrowTextLink } from "@/components/ui/ArrowButton";
import { BlockImage } from "@/components/ui/BlockImage";
import { Container, Section } from "@/components/ui/Container";
import { SmartLink } from "@/components/ui/SmartLink";
import type { ImageBannerBlok } from "@/lib/types";

import { editable } from "./editable";

const HEIGHTS = {
  medium: "aspect-[16/9] md:aspect-[21/9]",
  tall: "min-h-[420px] md:min-h-[540px]",
} as const;

/** Inset campaign banner — the `#ItsInOurHands` moment. */
export function ImageBanner({ blok }: { blok: ImageBannerBlok }) {
  return (
    <Section {...editable(blok)} spacing="tight">
      <Container>
        <div
          className={`relative isolate flex items-center justify-center overflow-hidden rounded-panel ${
            HEIGHTS[blok.height ?? "medium"]
          }`}
        >
          <BlockImage
            asset={blok.image}
            alt={blok.title ?? ""}
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="absolute inset-0 -z-10"
            placeholderTone="brand"
          />
          <div className="absolute inset-0 -z-10 bg-black/25" aria-hidden />

          <div className="px-8 py-20 text-center text-white">
            {blok.title ? (
              <h2 className="text-h2 font-bold md:text-h1">{blok.title}</h2>
            ) : null}

            {blok.subtitle ? (
              <p className="mx-auto mt-4 max-w-xl text-sm text-white/90">{blok.subtitle}</p>
            ) : null}

            {blok.link_label ? (
              <SmartLink
                link={blok.link}
                className="mt-8 inline-block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                <ArrowTextLink tone="ghost">{blok.link_label}</ArrowTextLink>
              </SmartLink>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}
