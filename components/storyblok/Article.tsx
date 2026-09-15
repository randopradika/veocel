import { BlockImage } from "@/components/ui/BlockImage";
import { Container } from "@/components/ui/Container";
import { Markdown } from "@/components/ui/Markdown";
import { formatDate, isoDate } from "@/lib/date";
import { focusPosition, naturalSize } from "@/lib/image";
import type { ArticleBlok, ArticleImageBlok, ArticleTextBlok } from "@/lib/types";

import { ArticleShare } from "./ArticleShare";
import { editable } from "./editable";

/**
 * An #ItsInOurHands article, frame 2081:310: a full-bleed photograph under the
 * transparent header, the title, a ruled line carrying the date and the share
 * controls, then the body.
 *
 * The body is a short list of its own rather than the page registry — running
 * text in three weights and images at two widths is everything an article is
 * drawn with. The frame sets it across the full 1440 column with ~52px between
 * blocks, and so does this.
 *
 * Colours are the nearest tokens, as elsewhere: the frame's `#4177b5` title is
 * `brand`, `#4d4d4d` copy `ink`, `#7c7c7c` dates `ink-muted`, and its two link
 * blues the `brand` that `Markdown` already gives links.
 */
export function Article({ blok }: { blok: ArticleBlok }) {
  const date = formatDate(blok.date);
  const body = blok.body ?? [];

  return (
    <article {...editable(blok)}>
      {/* Marked as the hero, so the header starts transparent over it. */}
      <div data-hero="" className="relative aspect-[4/3] bg-brand-700 md:aspect-[32/9]">
        <BlockImage
          asset={blok.image}
          alt=""
          priority
          sizes="100vw"
          className="absolute inset-0"
          objectPosition={focusPosition(blok.image)}
          placeholderTone="brand"
        />
        <ArticleScrim />
      </div>

      {/* 119px above the title and below the last block at 1920, as drawn. */}
      <Container width="wide" className="pt-12 pb-section-sm md:pt-30 md:pb-30">
        <h1 className="max-w-[1110px] text-h2 font-bold text-brand md:text-h1">{blok.title}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 border-b border-ink-faint md:mt-6">
          {date ? (
            <time
              dateTime={isoDate(blok.date)}
              className="text-base leading-[48px] tracking-[-0.05em] text-ink-muted"
            >
              {date}
            </time>
          ) : null}
          <div className="ml-auto">
            <ArticleShare title={blok.title} />
          </div>
        </div>

        {body.length > 0 ? (
          <div className="mt-10 flex flex-col gap-10 md:mt-14 md:gap-13">
            {body.map((item) => {
              switch (item.component) {
                case "article_text":
                  return <ArticleText key={item._uid} blok={item} />;
                case "article_image":
                  return <ArticleImage key={item._uid} blok={item} />;
                default:
                  // The schema admits only the two above.
                  return null;
              }
            })}
          </div>
        ) : null}
      </Container>
    </article>
  );
}

/**
 * The frame's shade on every article photograph, hub and article alike: clear
 * to 61% of the height, 20% black by 89%.
 */
export function ArticleScrim() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 bg-gradient-to-b from-transparent from-60% to-black/20 to-90%"
    />
  );
}

/**
 * 20/32 running copy with a blank line between paragraphs (2081:346), the 32/48
 * bold lead (2081:348), and 14/28 small print (2081:350). Tracking is the
 * frame's -0.05em on all three — tighter than the -0.02em book copy elsewhere
 * on the site, and drawn that way on every text layer of this frame.
 */
const TEXT = {
  body: {
    className: "text-lg leading-[1.6] tracking-[-0.05em] text-ink md:text-xl md:leading-8",
    gap: "line",
  },
  lead: {
    className:
      "text-2xl leading-[1.35] font-bold tracking-[-0.05em] text-ink md:text-[2rem] md:leading-[48px]",
    gap: "default",
  },
  note: {
    // Sources are long bare URLs; let them break anywhere rather than overflow.
    className: "max-w-[1110px] text-sm leading-7 tracking-[-0.05em] text-ink [overflow-wrap:anywhere]",
    gap: "none",
  },
} as const;

function ArticleText({ blok }: { blok: ArticleTextBlok }) {
  const text = TEXT[blok.style ?? "body"] ?? TEXT.body;

  return (
    <div {...editable(blok)}>
      <Markdown className={text.className} gap={text.gap}>
        {blok.body}
      </Markdown>
    </div>
  );
}

function ArticleImage({ blok }: { blok: ArticleImageBlok }) {
  const inset = blok.width === "inset";
  // Infographics must not crop, so the box takes the asset's own proportions.
  const size = naturalSize(blok.image?.filename);
  const aspectRatio = size ? `${size.width} / ${size.height}` : inset ? "1 / 1" : "3 / 2";

  return (
    // The inset measure is the frame's 843px chart, centred in the column.
    <figure {...editable(blok)} className={inset ? "mx-auto w-full max-w-[843px]" : "w-full"}>
      <BlockImage
        asset={blok.image}
        sizes={inset ? "(min-width: 900px) 843px, 100vw" : "(min-width: 1440px) 1360px, 100vw"}
        className="relative w-full"
        style={{ aspectRatio }}
        imageClassName="object-contain"
      />

      {blok.caption?.trim() ? (
        <figcaption>
          <Markdown className="mt-3 text-center text-sm leading-8 tracking-[-0.05em] text-ink [overflow-wrap:anywhere]">
            {blok.caption}
          </Markdown>
        </figcaption>
      ) : null}
    </figure>
  );
}
