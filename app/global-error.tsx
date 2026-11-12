"use client";

import type { ErrorInfo } from "next/error";

import { ErrorScreen } from "@/components/layout/ErrorScreen";
import { useLocale } from "@/components/ui/SmartLink";

import { circular } from "./fonts";
import "./globals.css";

/**
 * Catches what `app/[lang]/error.tsx` cannot: a failure in the root layout or
 * the locale layout — in practice `getLocales` or `getConfig` failing to reach
 * Storyblok, which every page in the locale needs. It replaces the whole
 * document, so it brings its own `<html>`, `<body>`, stylesheet and font. There
 * is no header or footer, since those need the config that failed, and no
 * consent script, since nothing here tracks.
 *
 * Crawlers never see it. On the server a failed render is an empty document
 * with a 500, and in the browser Next keeps that HTML for bots instead of
 * swapping in an error UI. A 5xx is the right signal anyway: it tells a crawler
 * to come back later rather than index the failure.
 */
export default function GlobalError({ error, retry }: ErrorInfo) {
  const locale = useLocale();

  return (
    <html lang={locale} className={circular.variable}>
      <body className="mx-auto flex min-h-svh w-full max-w-page flex-col justify-center">
        <ErrorScreen error={error} retry={retry} source="layout" />
      </body>
    </html>
  );
}
