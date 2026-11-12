"use client";

import Link from "next/link";
import { useEffect } from "react";

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
 *
 * The error is logged to the browser console only. In production a Server
 * Component error arrives here with a generic message, so the log carries its
 * `digest`: search Vercel's runtime logs for it to find the real error.
 */
export default function PageError({ error, retry }: { error: unknown; retry: () => void }) {
  const locale = useLocale();

  useEffect(() => {
    const digest = error instanceof Error && "digest" in error ? String(error.digest) : undefined;
    console.error(
      digest ? `[page] render failed (digest ${digest})` : "[page] render failed",
      error,
    );
  }, [error]);

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
            onClick={() => retry()}
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
