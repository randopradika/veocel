"use server";

import {
  COUNTRY_CODES,
  LIMITS,
  TOPICS,
  compose,
  mailtoLink,
  type ContactFields,
  type ContactState,
  type FieldName,
  type TopicCode,
} from "@/lib/contact";

/**
 * The contact form's submission (see `lib/contact.ts`).
 *
 * Everything is checked again here — the browser's `required` and
 * `type="email"` are a courtesy, not a guarantee. Answers that fail go back
 * with the errors, so the visitor loses nothing.
 *
 * A field people never see (`website`) stands in for Lenzing Pro's
 * FriendlyCaptcha: a submission that fills it in is told it was sent and is
 * dropped, so a bot learns nothing.
 *
 * Delivery: the message is meant to go straight to nonwoven@lenzing.com from
 * the server. Until a mail transport is configured (see `deliver`), the visitor
 * gets it back as a ready-made e-mail to send from their own mail app, so the
 * form never swallows a message.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COUNTRIES = new Set(COUNTRY_CODES);

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function read(formData: FormData): ContactFields {
  const topic = text(formData, "topic");
  return {
    topic: TOPICS.some((option) => option.code === topic) ? (topic as TopicCode) : "",
    description: text(formData, "description"),
    message: text(formData, "message"),
    firstName: text(formData, "firstName"),
    lastName: text(formData, "lastName"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    company: text(formData, "company"),
    country: text(formData, "country"),
  };
}

function validate(fields: ContactFields): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};

  const required: Array<keyof typeof LIMITS> = ["description", "message", "firstName", "lastName", "email", "company"];
  for (const name of required) {
    if (!fields[name]) errors[name] = "Please fill in this field.";
  }
  for (const [name, limit] of Object.entries(LIMITS) as Array<[keyof typeof LIMITS, number]>) {
    if (!errors[name] && fields[name].length > limit) errors[name] = `Please keep this to ${limit} characters.`;
  }
  if (!errors.email && !EMAIL.test(fields.email)) errors.email = "Please enter a valid e-mail address.";
  if (!fields.topic) errors.topic = "Please select what your query is for.";
  if (!COUNTRIES.has(fields.country)) errors.country = "Please select a country.";

  return errors;
}

/**
 * Sends the message to nonwoven@lenzing.com, replying to the visitor. Returns
 * false when it could not — including, for now, always: no mail transport is
 * configured yet (SMTP credentials or an e-mail API key are still to come).
 */
async function deliver(fields: ContactFields): Promise<boolean> {
  const { subject } = compose(fields);
  console.warn(`[contact] no mail transport configured; handing "${subject}" to the visitor's mail app`);
  return false;
}

export async function submitContact(_previous: ContactState, formData: FormData): Promise<ContactState> {
  if (text(formData, "website")) return { status: "sent" };

  const fields = read(formData);
  const errors = validate(fields);
  if (Object.keys(errors).length > 0) return { status: "invalid", errors, values: fields };

  try {
    if (await deliver(fields)) return { status: "sent" };
  } catch (error) {
    console.error("[contact] sending failed", error);
  }
  return { status: "fallback", mailto: mailtoLink(fields), values: fields };
}
