import { ArrowMarker } from "@/components/ui/ArrowButton";
import { BlockImage } from "@/components/ui/BlockImage";
import { Container, Section } from "@/components/ui/Container";
import { SmartLink } from "@/components/ui/SmartLink";
import { formatDate } from "@/lib/date";
import type { NewsItemBlok, NewsListBlok } from "@/lib/types";

import { editable } from "./editable";

/** "latest news" — heading left, supporting line right, then stacked rows. */
export function NewsList({ blok }: { blok: NewsListBlok }) {
  const items = blok.items ?? [];

  return (
    <Section {...editable(blok)} spacing="default">
      <Container>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          {blok.heading ? (
            <h2 className="text-h2 font-bold text-brand md:text-h1">{blok.heading}</h2>
          ) : null}

          {blok.intro ? (
            <p className="max-w-xs text-[0.9375rem] leading-relaxed text-ink-muted md:text-right">
              {blok.intro}
            </p>
          ) : null}
        </div>

        {items.length > 0 ? (
          <ul className="mt-12 divide-y divide-hairline border-t border-hairline">
            {items.map((item) => (
              <li key={item._uid}>
                <NewsRow blok={item} />
              </li>
            ))}
          </ul>
        ) : null}
      </Container>
    </Section>
  );
}

function NewsRow({ blok }: { blok: NewsItemBlok }) {
  const date = formatDate(blok.date, ".");

  return (
    <SmartLink
      link={blok.link}
      className="group flex items-center gap-5 py-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:gap-8"
    >
      <span {...editable(blok)} className="flex flex-1 items-center gap-5 md:gap-8">
        <BlockImage
          asset={blok.image}
          alt={blok.title}
          sizes="160px"
          className="relative hidden aspect-[4/3] w-28 shrink-0 rounded-[0.5rem] sm:block md:w-36"
          placeholderTone="sky"
        />

        <span className="flex-1">
          {blok.category || date ? (
            <span className="flex flex-wrap items-center gap-3 text-sm text-ink-faint">
              {blok.category ? <span>{blok.category}</span> : null}
              {date ? <time dateTime={blok.date}>{date}</time> : null}
            </span>
          ) : null}

          <span className="mt-2 block text-sm font-semibold leading-snug text-brand md:text-base">
            {blok.title}
          </span>
        </span>
      </span>

      <ArrowMarker tone="brand" size="md" />
    </SmartLink>
  );
}
