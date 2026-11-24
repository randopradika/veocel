import type { Metadata } from "next";

import { Container, Section } from "@/components/ui/Container";
import { CONTACT_EMAIL, COUNTRY_CODES, TOPICS, countryName, type TopicCode } from "@/lib/contact";

import { ContactForm } from "./ContactForm";

/**
 * Where the footer's "contact us" leads (slide 114, 20 Nov UAT): the client
 * asked for a form on a page of its own or in a pop-up, and a page it is — the
 * form runs to nine fields, too many for a pop-up on a phone, and a page has
 * an address to link to. `?topic=sales` (or any code in `TOPICS`) preselects
 * what the query is for; otherwise the visitor picks.
 */

export const metadata: Metadata = {
  title: "contact us",
  description: `Questions about VEOCEL™ fibers? Write to our team at ${CONTACT_EMAIL}.`,
};

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ topic?: string | string[] }>;
}) {
  const [{ lang }, { topic }] = await Promise.all([params, searchParams]);
  const asked = (Array.isArray(topic) ? topic[0] : topic)?.toLowerCase();
  const initialTopic: TopicCode | "" = TOPICS.find((option) => option.code === asked)?.code ?? "";

  const collator = new Intl.Collator(lang);
  const countries = COUNTRY_CODES.map((code) => ({ code, name: countryName(code, lang) })).sort((a, b) =>
    collator.compare(a.name, b.name),
  );

  return (
    <Section className="pt-40 md:pt-header">
      <Container width="narrow">
        <h1 className="text-h2 font-bold text-brand md:text-h1">contact us</h1>
        <p className="mt-4 text-base text-ink-muted">
          Write to us below, or e-mail{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-brand underline underline-offset-4 hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {CONTACT_EMAIL}
          </a>{" "}
          directly.
        </p>

        <ContactForm countries={countries} topic={initialTopic} />
      </Container>
    </Section>
  );
}
