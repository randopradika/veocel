"use client";

import { startTransition, useActionState, type ReactNode } from "react";

import { CONTACT_EMAIL, LIMITS, TOPICS, type ContactState, type FieldName, type TopicCode } from "@/lib/contact";

import { submitContact } from "./actions";

/**
 * The contact form, laid out as the reference on slide 114 draws it: what the query is for,
 * description and message under "How can we support you today?", then the
 * name, e-mail and phone, company and country in pairs under "Contact
 * information". On phones the pairs stack.
 *
 * The browser's own `required` / `type="email"` checks run first; the server
 * checks again. With JavaScript the form submits through `onSubmit`, not its
 * `action`, because React resets a form after an action runs — the selects
 * came back on "Please select" — so what the visitor typed simply stays put.
 * Without JavaScript the `action` posts natively, and the answers the server
 * sends back refill the fields as their defaults.
 */

const INPUT =
  "mt-2 block w-full rounded-card border bg-white px-4 py-3 text-base text-ink placeholder:text-ink-muted focus:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
const ERROR_TONE = "border-[#b3261e]";
const IDLE_TONE = "border-[#c9d3dc]";

export function ContactForm({
  countries,
  topic,
}: {
  countries: Array<{ code: string; name: string }>;
  topic: TopicCode | "";
}) {
  const [state, formAction, pending] = useActionState(submitContact, { status: "idle" } as ContactState);

  if (state.status === "sent") {
    return (
      <div role="status" className="mt-12 rounded-panel bg-brand-50 px-7 py-10 md:px-12">
        <h2 className="text-2xl font-bold text-brand md:text-[1.75rem]">thank you</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Your message is on its way to {CONTACT_EMAIL}. We will get back to you as soon as we can.
        </p>
      </div>
    );
  }

  const values = state.status === "invalid" || state.status === "fallback" ? state.values : undefined;
  const errors = state.status === "invalid" ? state.errors : {};

  /** Props every control shares: name, its saved answer, and its error wiring. */
  function control(name: FieldName) {
    const error = errors[name];
    return {
      id: `contact-${name}`,
      name,
      defaultValue: values?.[name] ?? "",
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `contact-${name}-error` : undefined,
      className: `${INPUT} ${error ? ERROR_TONE : IDLE_TONE}`,
    };
  }

  return (
    <>
      {state.status === "fallback" ? (
        <div role="status" className="mt-10 rounded-panel bg-brand-50 px-7 py-8 md:px-10">
          <h2 className="text-xl font-bold text-brand">one more step</h2>
          <p className="mt-2 text-base leading-relaxed text-ink">
            We could not send your message from this page. It is ready in your e-mail app instead,
            addressed to {CONTACT_EMAIL} with everything you wrote — open it and press send.
          </p>
          <a
            href={state.mailto}
            className="mt-5 inline-flex h-12 items-center rounded-full bg-brand px-7 text-lg font-medium text-white transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            open in my e-mail app
          </a>
        </div>
      ) : null}

      {state.status === "invalid" ? (
        <p role="alert" className="mt-10 text-base font-medium text-[#b3261e]">
          Please check the fields marked below.
        </p>
      ) : null}

      <form
        action={formAction}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          startTransition(() => formAction(data));
        }}
        className="mt-12"
      >
        <h2 className="text-2xl font-bold text-brand md:text-[1.75rem]">How can we support you today?</h2>
        <p className="mt-2 text-base text-ink-muted">Our Lenzing experts are just a message away.</p>

        <div className="mt-8 grid gap-6">
          <Field name="topic" label="Your query is for" required error={errors.topic} className="sm:max-w-xs">
            <select {...control("topic")} defaultValue={values?.topic ?? topic} required>
              <option value="" disabled>
                Please select
              </option>
              {TOPICS.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field name="description" label="Description of inquiry" required error={errors.description}>
            <input {...control("description")} type="text" required maxLength={LIMITS.description} placeholder="type here..." />
          </Field>

          <Field name="message" label="Your message" required error={errors.message}>
            <textarea {...control("message")} required rows={5} maxLength={LIMITS.message} placeholder="type here..." />
          </Field>
        </div>

        <h2 className="mt-14 text-xl font-bold text-ink">Contact information</h2>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 sm:gap-x-8">
          <Field name="firstName" label="First Name" required error={errors.firstName}>
            <input {...control("firstName")} type="text" required maxLength={LIMITS.firstName} autoComplete="given-name" placeholder="e.g. Adam" />
          </Field>

          <Field name="lastName" label="Last Name" required error={errors.lastName}>
            <input {...control("lastName")} type="text" required maxLength={LIMITS.lastName} autoComplete="family-name" placeholder="e.g. Smith" />
          </Field>

          <Field name="email" label="Email Address" required error={errors.email}>
            <input {...control("email")} type="email" required maxLength={LIMITS.email} autoComplete="email" placeholder="e.g. address@email.com" />
          </Field>

          <Field name="phone" label="Telephone Number (optional)" error={errors.phone}>
            <input {...control("phone")} type="tel" maxLength={LIMITS.phone} autoComplete="tel" placeholder="e.g. 123 12 34 123" />
          </Field>

          <Field name="company" label="Company name" required error={errors.company}>
            <input {...control("company")} type="text" required maxLength={LIMITS.company} autoComplete="organization" placeholder="e.g. Lenzing AG" />
          </Field>

          <Field name="country" label="Country of your company's headquarters" required error={errors.country}>
            <select {...control("country")} required>
              <option value="" disabled>
                Please select
              </option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* For bots only: people never see this field, and a filled one is dropped. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-12 h-12 cursor-pointer rounded-full bg-brand px-9 text-xl font-medium text-white transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? "sending…" : "submit"}
        </button>
      </form>
    </>
  );
}

function Field({
  name,
  label,
  required = false,
  error,
  className = "",
  children,
}: {
  name: FieldName;
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={`contact-${name}`} className="text-sm font-bold text-ink">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`contact-${name}-error`} className="mt-1.5 text-sm text-[#b3261e]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
