import { redirect } from "next/navigation";

import { DEFAULT_LOCALE } from "@/lib/i18n";

/**
 * Every page lives under a locale prefix, so the bare root sends visitors to the
 * default language. A redirect rather than a rewrite: one canonical URL per page
 * keeps the language visible and shareable.
 */
export default function RootPage() {
  redirect(`/${DEFAULT_LOCALE}`);
}
