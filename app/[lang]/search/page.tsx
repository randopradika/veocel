import Link from "next/link";

import { Container, Section } from "@/components/ui/Container";
import { localePath } from "@/lib/i18n";
import { searchStories, storyPath } from "@/lib/storyblok";

/**
 * Results for the footer's search form.
 *
 * The query lives in the URL (`/<lang>/search?q=…`) rather than in component
 * state, so results are shareable, survive a reload and work with the back button
 * — and the form needs no JavaScript at all.
 */

export const metadata = { title: "search" };

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ lang }, { q }] = await Promise.all([params, searchParams]);
  const term = (q ?? "").trim();
  const results = await searchStories(term, lang);

  return (
    <Section className="pt-40 md:pt-header">
      <Container width="narrow">
        <h1 className="text-h2 font-bold text-brand md:text-h1">search</h1>

        {term ? (
          <p className="mt-4 text-sm text-ink-muted">
            {results.length === 0
              ? "No pages matched "
              : `${results.length} ${results.length === 1 ? "page" : "pages"} matching `}
            <span className="font-semibold text-ink">&ldquo;{term}&rdquo;</span>
          </p>
        ) : (
          <p className="mt-4 text-sm text-ink-muted">
            Type a term into the search box in the footer to begin.
          </p>
        )}

        {results.length > 0 ? (
          <ul className="mt-10 divide-y divide-hairline border-t border-hairline">
            {results.map((story) => (
              <li key={story.uuid}>
                <Link
                  href={localePath(lang, storyPath(story))}
                  className="block py-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <span className="block text-base font-semibold text-brand">{story.name}</span>
                  {story.content.seo_description ? (
                    <span className="mt-1.5 block text-sm leading-relaxed text-ink-muted">
                      {story.content.seo_description}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </Container>
    </Section>
  );
}
