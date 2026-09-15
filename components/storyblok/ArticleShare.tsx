"use client";

import { useState } from "react";

/**
 * The article's "share" line: two ringed 30px discs, share and print (2081:353,
 * 2081:354).
 *
 * Share hands the page to the platform's share sheet where there is one —
 * phones, mostly — and copies the address everywhere else, saying so in place
 * of the label for a moment. Print is the browser's own.
 *
 * The glyphs are the design's rasters (2081:355, 2081:356), downscaled into
 * `public/icons`. Plain `<img>` for the reason `Logo` gives.
 */
const DISC =
  "flex h-[30px] w-[30px] items-center justify-center rounded-full border border-ink transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export function ArticleShare({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
      } catch {
        // Dismissing the share sheet rejects; that is not an error.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access refused (an insecure origin, a denied permission).
      // The address bar still has the link, so there is nothing to recover.
    }
  }

  return (
    <div className="flex items-center gap-2.5">
      <span aria-live="polite" className="text-base leading-[48px] tracking-[-0.05em] text-ink-muted">
        {copied ? "link copied" : "share"}
      </span>

      <div className="flex items-center gap-1">
        <button type="button" onClick={share} aria-label="Share this article" className={DISC}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/share.png" alt="" width={13} height={13} className="h-[13px] w-[13px] object-cover" />
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          aria-label="Print this article"
          className={DISC}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/print.png" alt="" width={14} height={15} className="h-[15px] w-[14px] object-cover" />
        </button>
      </div>
    </div>
  );
}
