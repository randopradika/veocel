"use client";

import Link from "next/link";

import { ArrowTextLink } from "@/components/ui/ArrowButton";
import { Container, Section } from "@/components/ui/Container";
import { useLocale } from "@/components/ui/SmartLink";
import { localePath } from "@/lib/i18n";

/**
 * A page that failed to render — in practice Storyblok failing a request for a
 * page that is not cached yet, which `lib/storyblok.ts` throws on rather than
 * serve mock copy as if it were real. It sits inside the locale layout, so the
 * header and footer stay; "try again" fetches the page afresh.
 *
 * The `<title>` is set here because the page's own metadata is usually what
 * failed, which left the tab blank; React hoists it into the head.
 */
export default function PageError({ unstable_retry }: { unstable_retry: () => void }) {
  const locale = useLocale();

  return (
    <Section className="pt-40 md:pt-header">
      <title>{"this page didn’t load | VEOCEL™"}</title>
      <Container width="narrow" className="text-center">
        <h1 className="text-h2 font-bold text-brand md:text-h1">this page didn&apos;t load.</h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-ink-muted">
          Something went wrong on our side while fetching it. Try again in a moment.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          >
            <ArrowTextLink>try again</ArrowTextLink>
          </button>
          <Link
            href={localePath(locale, "")}
            className="text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          >
            <ArrowTextLink>back to the homepage</ArrowTextLink>
          </Link>
        </div>
      </Container>
    </Section>
  );
}
