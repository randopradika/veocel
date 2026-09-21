import Link from "next/link";
import type { ReactNode } from "react";

import { BlockImage } from "@/components/ui/BlockImage";
import { Markdown } from "@/components/ui/Markdown";
import { formatDate, isoDate } from "@/lib/date";
import { focusPosition, naturalSize } from "@/lib/image";
import type { ArticleBlok, ArticleImageBlok, ArticleTextBlok } from "@/lib/types";

import { ArticleScrim } from "./ArticleParts";
import { ArticleShare } from "./ArticleShare";
import { editable } from "./editable";

/**
 * An #ItsInOurHands article, frame 2089:242 (revised from 2081:310): a
 * full-bleed photograph under the transparent header, then — on the hub's pale
 * blue ground — a "back to homepage" button (to the #ItsInOurHands hub) and a
 * "next article" button, and a white
 * card holding the article: the title, a ruled line carrying the date and the
 * share controls, then the body.
 *
 * Measured off the 1920 frame: the buttons 52px under the photograph and 102px
 * in from the page's edges, where the card's edges fall too; the card 57px under
 * them, with 60px corners, a 1431px column centred in it, 88px of white above
 * the title and below the last block, and 98px of ground beneath.
 *
 * The body is a short list of its own rather than the page registry — running
 * text in three weights and images at two widths is everything an article is
 * drawn with. The frame sets it across the card's column with ~50px between
 * blocks, and so does this.
 *
 * Colours are the nearest tokens, as elsewhere: the `#e6f1f8` ground is the
 * hub's `brand-100`, the buttons' `#0f7ab8` and the `#4177b5` title are
 * `brand`, `#4d4d4d` copy `ink`, `#7c7c7c` dates `ink-muted`, and the two link
 * blues the `brand` that `Markdown` already gives links.
 */
export function Article({
  blok,
  backHref,
  next,
}: {
  blok: ArticleBlok;
  /**
   * The hub the article sits in (/itsinourhands), in the reader's language —
   * the button reads "back to homepage", as drawn, but it is the hub's home.
   */
  backHref: string;
  /** The next article in the hub's order, or none when this is the only one. */
  next?: { href: string; title: string } | null;
}) {
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

      <div className="bg-brand-100 pb-section-sm md:pb-[98px]">
        {/* 1716px between 102px margins at 1920: the site's 40px gutter, capped. */}
        <div className="mx-auto w-full max-w-[1796px] px-6 md:px-10">
          <nav
            aria-label="Article navigation"
            className="flex flex-wrap justify-between gap-3 pt-6 md:pt-[52px]"
          >
            <ArticleButton href={backHref} arrow="before">
              back to homepage
            </ArticleButton>
            {next ? (
              <ArticleButton href={next.href} arrow="after" title={next.title}>
                next article
              </ArticleButton>
            ) : null}
          </nav>

          <div className="mt-6 rounded-[30px] bg-white px-6 pt-10 pb-12 md:mt-[57px] md:rounded-[60px] md:px-16 md:py-22">
            <div className="mx-auto max-w-[1431px]">
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

              {/* 70px under the rule, then ~50px between blocks, as drawn. */}
              {body.length > 0 ? (
                <div className="mt-10 flex flex-col gap-10 md:mt-17.5 md:gap-12.5">
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
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * The frame's two blue pills (2089:291, 2089:294): 68px tall, 24px medium type
 * in white, the arrow a plain angle bracket as drawn — hidden from screen
 * readers, which get the words alone. Smaller on phones, which the frame does
 * not draw.
 */
function ArticleButton({
  href,
  arrow,
  title,
  children,
}: {
  href: string;
  arrow: "before" | "after";
  title?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      title={title}
      className="inline-flex h-12 items-center gap-1.5 rounded-full bg-brand px-5 text-base font-medium text-white transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:h-[68px] md:px-7 md:text-2xl"
    >
      {arrow === "before" ? <span aria-hidden>&lt;</span> : null}
      {children}
      {arrow === "after" ? <span aria-hidden>&gt;</span> : null}
    </Link>
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
        sizes={inset ? "(min-width: 900px) 843px, 100vw" : "(min-width: 1440px) 1431px, 100vw"}
        className="relative w-full"
        style={{ aspectRatio }}
        imageClassName="object-contain"
      />

      {blok.caption?.trim() ? (
        <figcaption>
          {/* 50px under the image at 1920 (2089:288). */}
          <Markdown className="mt-3 text-center text-sm leading-8 tracking-[-0.05em] text-ink [overflow-wrap:anywhere] md:mt-12.5">
            {blok.caption}
          </Markdown>
        </figcaption>
      ) : null}
    </figure>
  );
}
