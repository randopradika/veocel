/**
 * The contact form — what it asks, how long each answer may be, and how a
 * submission reads once it is written out as an e-mail.
 *
 * It replaces the footer's newsletter signup (client, 20 Nov UAT, slide 114),
 * and asks exactly what the slide's reference — Lenzing Pro's contact form,
 * lenzingpro.com/en/portal/contact — shows: what the query is for, a one-line
 * description and the message, then the sender's first and last name, e-mail,
 * phone (optional), company and the country of its headquarters. Labels and
 * placeholders are the reference's word for word, except the first field: on
 * 2026-11-24 it became VEOCEL's own "Your query is for", whose options are the
 * where-to-buy categories plus sales and general (Lenzing Pro's three topics
 * until then).
 *
 * Lenzing Pro's form posts into Lenzing's SAP Commerce system, which refuses
 * other origins, so this one goes to `CONTACT_EMAIL` instead — see
 * `app/[lang]/contact/actions.ts`.
 *
 * Shared by the page, the form (a client component) and the server action, so
 * nothing in here may reach for server-only APIs.
 */

export const CONTACT_EMAIL = "nonwoven@lenzing.com";

/** In the client's order. `?topic=<code>` on the page preselects one. */
export const TOPICS = [
  { code: "beauty", label: "Beauty" },
  { code: "body", label: "Body" },
  { code: "intimate", label: "Intimate" },
  { code: "surface", label: "Surface" },
  { code: "sales", label: "Sales" },
  { code: "general", label: "General" },
] as const;

export type TopicCode = (typeof TOPICS)[number]["code"];

/**
 * ISO 3166-1 alpha-2, plus Kosovo (XK). The names come from `Intl.DisplayNames`
 * in the page's language, so only the codes live here.
 */
export const COUNTRY_CODES = (
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ " +
  "BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM " +
  "DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS " +
  "GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN " +
  "KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ " +
  "MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM " +
  "PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV " +
  "SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI " +
  "VN VU WF WS XK YE YT ZA ZM ZW"
).split(" ");

/** Longest answer each field takes; the server holds to the same numbers. */
export const LIMITS = {
  description: 200,
  message: 5000,
  firstName: 100,
  lastName: 100,
  email: 254,
  phone: 40,
  company: 200,
} as const;

export type ContactFields = {
  /** Empty until the visitor picks one — no option is assumed. */
  topic: TopicCode | "";
  description: string;
  message: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  country: string;
};

export type FieldName = keyof ContactFields;

export type ContactState =
  | { status: "idle" }
  /** Something is missing or wrong; the answers go back so nothing is lost. */
  | { status: "invalid"; errors: Partial<Record<FieldName, string>>; values: ContactFields }
  | { status: "sent" }
  /** The site could not send it; the visitor's own mail app can, from this link. */
  | { status: "fallback"; mailto: string; values: ContactFields };

export function topicLabel(code: string): string {
  return TOPICS.find((topic) => topic.code === code)?.label ?? "";
}

export function countryName(code: string, locale = "en"): string {
  try {
    return new Intl.DisplayNames([locale, "en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** One line, so a subject or a name cannot smuggle in a header. */
function oneLine(value: string): string {
  return value.replace(/[\r\n\t]+/g, " ").trim();
}

/** The submission as plain text: a subject line and a body. */
export function compose(fields: ContactFields): { subject: string; body: string } {
  const subject = oneLine(`${topicLabel(fields.topic)}: ${fields.description}`);
  const body = [
    `Your query is for: ${topicLabel(fields.topic)}`,
    `Description of inquiry: ${oneLine(fields.description)}`,
    "",
    fields.message.trim(),
    "",
    "— Contact information —",
    `Name: ${oneLine(`${fields.firstName} ${fields.lastName}`)}`,
    `E-mail: ${oneLine(fields.email)}`,
    `Telephone: ${oneLine(fields.phone) || "—"}`,
    `Company: ${oneLine(fields.company)}`,
    `Country of headquarters: ${countryName(fields.country)}`,
  ].join("\n");
  return { subject, body };
}

/**
 * The same message as a `mailto:` link, for when the site cannot send it.
 * Mail apps cap how long a link they accept, so a very long message may arrive
 * shortened — the visitor sees it in their own app before sending.
 */
export function mailtoLink(fields: ContactFields): string {
  const { subject, body } = compose(fields);
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`[VEOCEL] ${subject}`)}&body=${encodeURIComponent(body)}`;
}
