"use client";

import type { ErrorInfo } from "next/error";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useTransition } from "react";

import { ArrowTextLink } from "@/components/ui/ArrowButton";
import { Container, Section } from "@/components/ui/Container";
import { useLocale } from "@/components/ui/SmartLink";
import { localePath } from "@/lib/i18n";

/**
 * What a visitor sees when the site fails to render, shared by both error
 * boundaries: `app/[lang]/error.tsx` for a page, which keeps the header and
 * footer, and `app/global-error.tsx` for the layouts above it, which replaces
 * the whole document. In practice either means Storyblok failing a request that
 * is not cached yet, which `lib/storyblok.ts` throws on rather than serve mock
 * copy as if it were real. "try again" fetches the failed part afresh.
 *
 * The `<title>` is set here because the page's own metadata is usually what
 * failed, which left the tab blank; React hoists it into the head.
 *
 * Next already logs the caught error to the browser console. In production a
 * Server Component error arrives with a generic message, so this adds one line
 * with its `digest`, and shows it under the buttons as a reference a visitor
 * can quote: search Vercel's runtime logs for it to find the real error.
 * `source` says which boundary caught it. A digest is only a hash, so showing
 * it gives nothing away; an error thrown in the browser has none, and then
 * there is no reference line.
 *
 * Both boundaries type their props with Next's own `ErrorInfo` because Next
 * does not check an error file's props: a hand-written type let the renamed
 * `unstable_retry` compile and then fail on click.
 */
export function ErrorScreen({
  error,
  retry,
  source,
  className = "",
}: Pick<ErrorInfo, "error" | "retry"> & { source: "page" | "layout"; className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const home = localePath(locale, "");
  const [retrying, startRetry] = useTransition();
  const digest =
    error instanceof Error && "digest" in error && typeof error.digest === "string"
      ? error.digest
      : "";

  useEffect(() => {
    if (digest) console.info(`[${source}] render failed (digest ${digest})`);
  }, [digest, source]);

  return (
    <Section className={className}>
      <title>{"this page didn’t load | VEOCEL™"}</title>
      <Container width="narrow" className="text-center">
        <h1 className="text-h2 font-bold text-brand md:text-h1">this page didn&apos;t load.</h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-ink-muted">
          Something went wrong on our side while fetching it. Try again in a moment.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
          {/* Held in a transition so the button can show the retry is running
              and not send another full refresh on every click. */}
          <button
            type="button"
            onClick={() => startRetry(retry)}
            disabled={retrying}
            className="text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-60"
          >
            <ArrowTextLink>{retrying ? "trying again…" : "try again"}</ArrowTextLink>
          </button>
          {/* On the homepage itself the link would go nowhere: a boundary only
              clears its error when the path changes. */}
          {pathname !== home && (
            <Link
              href={home}
              className="text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            >
              <ArrowTextLink>back to the homepage</ArrowTextLink>
            </Link>
          )}
        </div>
        {digest && (
          <p className="mt-10 text-xs text-ink-muted">
            Reference: <span className="select-all tabular-nums">{digest}</span>
          </p>
        )}
      </Container>
    </Section>
  );
}
