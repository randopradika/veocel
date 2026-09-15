import Link from "next/link";

import { ArrowTextLink } from "@/components/ui/ArrowButton";
import { Container, Section } from "@/components/ui/Container";

export const metadata = { title: "page not found" };

export default function NotFound() {
  return (
    <Section className="pt-40 md:pt-header">
      <Container width="narrow" className="text-center">
        <p className="text-sm font-semibold text-brand-400">404</p>
        <h1 className="mt-4 text-h2 font-bold text-brand md:text-h1">
          this page has returned to nature.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-ink-muted">
          The page you were looking for isn&apos;t here. It may have been moved, or the link may be
          out of date.
        </p>
        <Link
          href="/"
          className="mt-10 inline-block text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          <ArrowTextLink>back to the homepage</ArrowTextLink>
        </Link>
      </Container>
    </Section>
  );
}
