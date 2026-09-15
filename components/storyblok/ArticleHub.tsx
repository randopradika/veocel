import Link from "next/link";

import { BlockImage } from "@/components/ui/BlockImage";
import { Container } from "@/components/ui/Container";
import { formatDate, isoDate } from "@/lib/date";
import { localePath } from "@/lib/i18n";
import { focusPosition } from "@/lib/image";
import { getArticles, storyPath } from "@/lib/storyblok";
import type { ArticleBlok, ArticleHubBlok, SbStory } from "@/lib/types";

import { ArticleScrim } from "./Article";
import { editable } from "./editable";

const DEFAULT_FOLDER = "itsinourhands";

/**
 * The #ItsInOurHands hub, frame 2081:242. The newest article opens the page as a
 * full-bleed photograph with its pill, date and title beneath and a rule across
 * the column; the rest follow as rows — photograph left, pill and title right,
 * the date at the foot of a ruled text column.
 *
 * Nothing is authored per article. The list is read from the folder, newest
 * first, so publishing an article there is all it takes to put it on the hub.
 *
 * The header area above the photograph is white and the rest of the hub tinted,
 * as drawn. Colours are the nearest tokens: the frame's `#e6f1f8` ground is
 * `brand-100`, and the pill — `#d8f4ff`, barely apart from that ground — steps to
 * `brand-200` so it still reads as a pill on it. Type is 1:1: the banner title
 * is the 64px section heading, row titles 40px, dates 16px.
 *
 * Each card is one link — its title — stretched over the whole card, so the
 * photograph clicks through without a second, duplicate link for screen readers.
 */
export async function ArticleHub({ blok, locale }: { blok: ArticleHubBlok; locale: string }) {
  const [featured, ...rest] = await getArticles(blok.folder?.trim() || DEFAULT_FOLDER, locale);

  return (
    // The frame's 213px of white header area at 1920 — see `pt-header`.
    <section {...editable(blok)} className="pt-28 md:pt-header">
      <h1 className="sr-only">{blok.heading?.trim() || "#ItsInOurHands"}</h1>

      <div className="bg-brand-100 pb-section-sm md:pb-section">
        {featured ? <FeaturedArticle story={featured} locale={locale} /> : null}

        <Container width="wide">
          {rest.length > 0 ? (
            <ul className="mt-12 flex flex-col gap-12 md:mt-26 md:gap-13">
              {rest.map((story) => (
                <li key={story.uuid}>
                  <ArticleRow story={story} locale={locale} />
                </li>
              ))}
            </ul>
          ) : null}

          {!featured ? (
            <p className="pt-section-sm text-xl text-ink-muted">Nothing has been published here yet.</p>
          ) : null}
        </Container>
      </div>
    </section>
  );
}

/** The title link, stretched over its card; the focus ring follows the card. */
const STRETCHED_LINK =
  "decoration-2 underline-offset-[0.12em] group-hover:underline after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-brand";

function href(story: SbStory<ArticleBlok>, locale: string): string {
  return localePath(locale, storyPath(story));
}

function FeaturedArticle({ story, locale }: { story: SbStory<ArticleBlok>; locale: string }) {
  const { content } = story;
  const date = formatDate(content.date);

  return (
    <article className="group relative">
      {/* 1920×560 in the frame. */}
      <div className="relative aspect-[16/9] md:aspect-[24/7]">
        <BlockImage
          asset={content.image}
          alt=""
          priority
          sizes="100vw"
          className="absolute inset-0"
          objectPosition={focusPosition(content.image)}
        />
        <ArticleScrim />
      </div>

      <Container width="wide" className="pt-6">
        <div className="flex flex-wrap items-center gap-5">
          {content.category ? <Pill size="lg">{content.category}</Pill> : null}
          {date ? <ArticleDate value={content.date}>{date}</ArticleDate> : null}
        </div>

        <h2 className="mt-1 max-w-[1112px] text-h2 font-bold text-brand md:text-h1">
          <Link href={href(story, locale)} className={STRETCHED_LINK}>
            {content.title}
          </Link>
        </h2>

        <div className="mt-10 border-t border-ink-faint md:mt-17" aria-hidden />
      </Container>
    </article>
  );
}

function ArticleRow({ story, locale }: { story: SbStory<ArticleBlok>; locale: string }) {
  const { content } = story;
  const date = formatDate(content.date);

  return (
    // 708 : 686 with a 48px gap, as drawn; the rule under the text column sits
    // level with the photograph's bottom edge.
    <article className="group relative grid gap-5 md:grid-cols-[708fr_686fr] md:gap-12">
      <div className="relative aspect-[708/357] overflow-hidden rounded-3xl md:rounded-[35px]">
        <BlockImage
          asset={content.image}
          alt=""
          sizes="(min-width: 768px) 50vw, 100vw"
          className="absolute inset-0"
          objectPosition={focusPosition(content.image)}
        />
        <ArticleScrim />
      </div>

      <div className="flex flex-col items-start border-b border-ink-faint">
        {content.category ? <Pill size="md">{content.category}</Pill> : null}

        <h2
          className={`${content.category ? "mt-4 " : ""}text-[1.75rem] leading-[1.2] font-bold tracking-[-0.05em] text-brand md:text-[2.5rem] md:leading-[48px]`}
        >
          <Link href={href(story, locale)} className={STRETCHED_LINK}>
            {content.title}
          </Link>
        </h2>

        {date ? (
          <ArticleDate value={content.date} className="mt-auto pt-4">
            {date}
          </ArticleDate>
        ) : null}
      </div>
    </article>
  );
}

/** 45px tall in both places; 20px type on the banner, 16px on the rows. */
function Pill({ size, children }: { size: "lg" | "md"; children: string }) {
  return (
    <span
      className={`inline-flex h-[45px] items-center rounded-full bg-brand-200 font-bold tracking-[-0.05em] text-ink ${
        size === "lg" ? "px-4.5 text-xl" : "px-5 text-base"
      }`}
    >
      {children}
    </span>
  );
}

function ArticleDate({
  value,
  className = "",
  children,
}: {
  value?: string;
  className?: string;
  children: string;
}) {
  return (
    <time
      dateTime={isoDate(value)}
      className={`text-base leading-[48px] tracking-[-0.05em] text-ink-muted ${className}`}
    >
      {children}
    </time>
  );
}
