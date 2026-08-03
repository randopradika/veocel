import { BlockImage } from "@/components/ui/BlockImage";
import { Container, Section } from "@/components/ui/Container";
import type { FeatureSplitBlok } from "@/lib/types";

import { editable } from "./editable";
import { MagnifierImage } from "./MagnifierImage";

/**
 * Half image, half framed copy panel — the "translucency technology" block.
 * `media_position` flips the pair; the image keeps visual order on mobile by
 * always rendering first in the DOM.
 *
 * When `image_reveal` is set alongside `image`, the media half becomes an
 * interactive before/after with a magnifying lens. With only one image it stays a
 * plain picture, so the block degrades to its original behaviour rather than
 * shipping a lens with nothing to reveal.
 */
export function FeatureSplit({ blok }: { blok: FeatureSplitBlok }) {
  const mediaRight = blok.media_position === "right";
  const mediaClassName = `relative aspect-[4/3] md:aspect-auto md:min-h-[26rem] ${
    mediaRight ? "md:order-2" : ""
  }`;

  const comparable = Boolean(blok.image?.filename && blok.image_reveal?.filename);

  return (
    <Section {...editable(blok)} spacing="tight">
      <Container>
        <div className="grid overflow-hidden rounded-panel border border-hairline md:grid-cols-2">
          {comparable ? (
            <MagnifierImage
              base={blok.image!}
              reveal={blok.image_reveal!}
              alt={blok.heading ?? ""}
              className={mediaClassName}
            />
          ) : (
            <BlockImage
              asset={blok.image}
              alt={blok.heading ?? ""}
              sizes="(max-width: 768px) 100vw, 50vw"
              className={mediaClassName}
              placeholderTone="brand"
            />
          )}

          <div className="flex flex-col items-center justify-center gap-5 bg-white px-8 py-14 text-center md:px-14">
            {blok.icon?.filename ? (
              <BlockImage
                asset={blok.icon}
                alt=""
                sizes="48px"
                className="relative h-11 w-11"
                imageClassName="object-contain"
              />
            ) : (
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full border border-brand/25"
                aria-hidden
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.2}
                  className="h-5 w-5 text-brand"
                >
                  <circle cx="12" cy="12" r="8" />
                  <path d="M12 4c3 3.2 3 12.8 0 16M4 12c3.2-3 12.8-3 16 0" />
                </svg>
              </span>
            )}

            {blok.heading ? (
              <h2 className="text-h3 font-bold text-brand md:text-[1.75rem]">{blok.heading}</h2>
            ) : null}

            {blok.body ? (
              <p className="max-w-sm text-xs leading-relaxed text-ink-muted md:text-sm">
                {blok.body}
              </p>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}
