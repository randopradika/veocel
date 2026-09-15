import Link from "next/link";
import { Suspense } from "react";

import { BlockImage } from "@/components/ui/BlockImage";
import { Container } from "@/components/ui/Container";
import { formatDate } from "@/lib/date";
import { localePath } from "@/lib/i18n";
import { focusPosition } from "@/lib/image";
import { getArticles, storyPath } from "@/lib/storyblok";
import type { ArticleBlok, ArticleHubBlok, SbStory } from "@/lib/types";

import { ArticlePager } from "./ArticlePager";
import { ArticleDate, ArticlePill, ArticleScrim, STRETCHED_LINK } from "./ArticleParts";
import { ArticleSlider, type ArticleSlide } from "./ArticleSlider";
import { editable } from "./editable";

const DEFAULT_FOLDER = "itsinourhands";

/** How many highlighted articles slide in the banner. */
const IN_SLIDER = 2;

/** Rows to a page below the banner. */
const PAGE_SIZE = 4;

const ROW_LIST = "mt-12 flex flex-col gap-12 md:mt-26 md:gap-13";

/**
 * The #ItsInOurHands hub, frame 2082:359 (revised from 2081:242). The two
 * latest highlighted articles open the page in a banner slider — a photograph
 * inset in the column with prev/next discs on its edges, tag, date and title
 * beneath, and a rule across the column — and every other article follows as a
 * row, four to a page: photograph left; tag and title right, the date at the
 * foot of a ruled column.
 *
 * Nothing is authored on the hub. Articles are read from the folder, latest
 * first (see `getArticles`); ticking `highlight` on one moves it out of the
 * list and into the slider. A highlighted article beyond the two stays in the
 * list rather than dropping off the page, and with none highlighted the latest
 * article opens the hub on its own.
 *
 * The hub is tinted from the header's bottom edge down, with no white band
 * between them. Colours are the nearest tokens — the frame's `#e6f1f8` ground is
 * `brand-100` — and type is 1:1: the banner title is the 64px section heading,
 * row titles 40px, dates 16px.
 */
export async function ArticleHub({ blok, locale }: { blok: ArticleHubBlok; locale: string }) {
  const articles = await getArticles(blok.folder?.trim() || DEFAULT_FOLDER, locale);
  const highlighted = articles.filter((story) => story.content.highlight).slice(0, IN_SLIDER);
  const inSlider = highlighted.length > 0 ? highlighted : articles.slice(0, 1);
  const rows = articles
    .filter((story) => !inSlider.includes(story))
    .map((story) => (
      <li key={story.uuid}>
        <ArticleRow story={story} locale={locale} />
      </li>
    ));

  return (
    // The padding sits behind the fixed header and is exactly its resting height
    // (83px on phones), so the tint starts at the header's bottom edge with no
    // white band between — while the translucent bar still sits on white.
    <section {...editable(blok)} className="pt-[83px] md:pt-header-bar">
      <h1 className="sr-only">{blok.heading?.trim() || "#ItsInOurHands"}</h1>

      <div className="bg-brand-100 pb-section-sm md:pb-section">
        {inSlider.length > 0 ? (
          <ArticleSlider slides={inSlider.map((story) => slide(story, locale))} />
        ) : null}

        <Container width="wide">
          {rows.length > 0 ? (
            // The page number lives in the URL, which a prerendered page only
            // knows on the client; until then the first page stands in.
            <Suspense fallback={<ul className={ROW_LIST}>{rows.slice(0, PAGE_SIZE)}</ul>}>
              <ArticlePager pageSize={PAGE_SIZE} listClassName={ROW_LIST}>
                {rows}
              </ArticlePager>
            </Suspense>
          ) : null}

          {articles.length === 0 ? (
            <p className="pt-section-sm text-xl text-ink-muted">Nothing has been published here yet.</p>
          ) : null}
        </Container>
      </div>
    </section>
  );
}

function href(story: SbStory<ArticleBlok>, locale: string): string {
  return localePath(locale, storyPath(story));
}

/** Everything the client-side slider needs, and nothing it can't serialise. */
function slide(story: SbStory<ArticleBlok>, locale: string): ArticleSlide {
  const { content } = story;

  return {
    id: story.uuid,
    href: href(story, locale),
    title: content.title,
    category: content.category,
    date: content.date,
    dateLabel: formatDate(content.date),
    image: content.image,
    objectPosition: focusPosition(content.image),
  };
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
        {content.category ? <ArticlePill size="md">{content.category}</ArticlePill> : null}

        <h2
          className={`${content.category ? "mt-4 " : ""}text-[1.75rem] leading-[1.2] font-bold tracking-[-0.05em] text-brand md:text-[2.5rem] md:leading-[48px]`}
        >
          <Link
            href={href(story, locale)}
            className={`${STRETCHED_LINK} focus-visible:after:outline-offset-4`}
          >
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
