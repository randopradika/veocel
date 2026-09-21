import Link from "next/link";
import { Suspense } from "react";

import { BlockImage } from "@/components/ui/BlockImage";
import { Container } from "@/components/ui/Container";
import { formatDate } from "@/lib/date";
import { localePath } from "@/lib/i18n";
import { focusPosition } from "@/lib/image";
import { getArticles, storyPath } from "@/lib/storyblok";
import type { ArticleBlok, ArticleHubBlok, SbStory, StoryblokAsset } from "@/lib/types";

import { ArticlePager } from "./ArticlePager";
import { ArticleDate, ArticlePill, ArticleScrim, STRETCHED_LINK } from "./ArticleParts";
import { ArticleSlider, type ArticleSlide } from "./ArticleSlider";
import { editable } from "./editable";

const DEFAULT_FOLDER = "itsinourhands";

/** How many of the latest articles slide in the banner. */
const IN_SLIDER = 2;

/** Rows to a page below the banner. */
const PAGE_SIZE = 4;

const ROW_LIST = "mt-12 flex flex-col gap-12 md:mt-26 md:gap-13";

/**
 * The #ItsInOurHands hub, frame 2082:359 (revised from 2081:242), under the
 * banner from frame 2086:278. The two
 * latest articles follow in a slider — a photograph
 * inset in the column with prev/next discs on its edges, tag, date and title
 * beneath, and a rule across the column — and every other article follows as a
 * row, four to a page: photograph left; tag and title right, the date at the
 * foot of a ruled column.
 *
 * Nothing is authored on the hub. Articles are read from the folder and run by
 * their date, latest on top, from the slider down through the list (see
 * `getArticles`). Until 2026-09-18 ticking `highlight` moved an article into
 * the slider whatever its date, which put older articles above newer ones; the
 * field is still in the schema but no longer places anything.
 *
 * `hide_banner` takes the banner off; the header then starts solid over the
 * page, as it does on any page without a hero, and the heading stays for
 * screen readers only. `white_header` keeps the banner but starts the header
 * solid white too, with the banner below it instead of behind it. Either way
 * the tint starts right under whatever is above it, banner or header, with no
 * white band between.
 *
 * Colours are the nearest tokens — the frame's `#e6f1f8` ground is
 * `brand-100` — and type is 1:1: the banner title is the 64px section heading,
 * row titles 40px, dates 16px.
 */
export async function ArticleHub({ blok, locale }: { blok: ArticleHubBlok; locale: string }) {
  const articles = await getArticles(blok.folder?.trim() || DEFAULT_FOLDER, locale);
  // By date, latest on top: the newest two slide in the banner, and the list
  // carries on from the third.
  const inSlider = articles.slice(0, IN_SLIDER);
  const rows = articles
    .filter((story) => !inSlider.includes(story))
    .map((story) => (
      <li key={story.uuid}>
        <ArticleRow story={story} locale={locale} />
      </li>
    ));

  const heading = blok.heading?.trim() || "#ItsInOurHands";
  const banner = !blok.hide_banner;
  const behindHeader = banner && !blok.white_header;

  return (
    // Unless the banner runs behind it, the padding sits behind the fixed
    // header and is exactly its resting height (83px on phones), so whatever
    // opens the page — the banner, or with none the tint — starts at the
    // header's bottom edge with no white band between, while the bar, solid
    // with no hero under it, still sits on white.
    <section
      {...editable(blok)}
      className={behindHeader ? undefined : "pt-[83px] md:pt-header-bar"}
    >
      {banner ? (
        <HubBanner heading={heading} image={blok.banner_image} behindHeader={behindHeader} />
      ) : (
        <h1 className="sr-only">{heading}</h1>
      )}

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

/**
 * Frame 2086:278: a full-bleed photograph with the page's name centred on it, in
 * the section-hero type (128/140, -0.05em). It is marked as the hero, so the
 * header sits transparent over it and leaves on scroll, as on the home page.
 *
 * 1920×540 in the frame. From `md` the height and the bottom padding (which
 * centres the headline where the frame draws it) are fixed at what the frame's
 * proportion gives a 1440 laptop, 400px and 84px, rather than following the
 * viewport: a `vw` height held the band still under browser zoom while the
 * headline in it grew. It still grows when the headline needs more. The top
 * padding is the header's resting height. The frame sets 128px throughout, which only fits the column
 * from `lg`; there is no phone frame, and below `md` the size follows the
 * width, so the one word fits a 320px screen.
 *
 * Unless `behindHeader`, which `white_header` turns off: then the banner is not
 * marked, so the header starts solid, and it sits below the bar at the same
 * size — the header's clearance moves to the section above it, and the
 * headline centres in the photograph, since no frame draws this variant.
 */
function HubBanner({
  heading,
  image,
  behindHeader,
}: {
  heading: string;
  image?: StoryblokAsset;
  behindHeader: boolean;
}) {
  return (
    <div
      data-hero={behindHeader ? "" : undefined}
      className={`relative isolate flex min-h-64 items-center overflow-hidden bg-brand-800 md:min-h-[25rem] ${
        behindHeader
          ? "pt-[83px] pb-10 md:pt-header-bar md:pb-[5.25rem]"
          : "py-10 md:py-[5.25rem]"
      }`}
    >
      <BlockImage
        asset={image}
        alt=""
        priority
        sizes="100vw"
        className="absolute inset-0 -z-10"
        objectPosition={focusPosition(image)}
        placeholderTone="brand"
      />
      {/* The home hero's scrim, which the frame repeats: clear, then 20% black by 82%. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(0,0,0,0.2)_82.212%)]"
      />

      <Container width="wide" className="text-center text-white">
        <h1 className="text-[length:min(12vw,3rem)] leading-[1.09375] font-bold tracking-[-0.05em] md:text-h1 lg:text-hero">
          {heading}
        </h1>
      </Container>
    </div>
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
