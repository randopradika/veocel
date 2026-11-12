"use client";

import type { ErrorInfo } from "next/error";

import { ErrorScreen } from "@/components/layout/ErrorScreen";

/**
 * A page that failed to render. It sits inside the locale layout, so the header
 * and footer stay; `ErrorScreen` has what it shows and logs. A failure in a
 * layout lands in `app/global-error.tsx` instead.
 */
export default function PageError({ error, retry }: ErrorInfo) {
  // The top padding clears the fixed header.
  return <ErrorScreen error={error} retry={retry} source="page" className="pt-40 md:pt-header" />;
}
