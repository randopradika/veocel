/**
 * The VEOCEL wordmark: a leaf-heart mark next to the name.
 *
 * Drawn inline as SVG so it inherits `currentColor` — the header switches the
 * whole lockup between white (over a hero) and brand blue (on white) by changing
 * text colour alone. The name is set in the site font rather than outlined, so it
 * stays crisp at every size and remains selectable text.
 *
 * Replace with the official asset before launch; the proportions here are read
 * off the mockups, not from brand artwork.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 32 28"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-8"
        aria-hidden
      >
        {/* Two leaves meeting to read as a heart. */}
        <path d="M16 25C9.5 20.5 4 16.6 4 11.2 4 7.2 7 4.5 10.6 4.5c2.2 0 4.2 1.1 5.4 2.9" />
        <path d="M16 25c6.5-4.5 12-8.4 12-13.8 0-4-3-6.7-6.6-6.7-2.2 0-4.2 1.1-5.4 2.9" />
        <path d="M16 7.4V25" />
      </svg>

      <span className="font-display text-[1.35rem] leading-none font-bold tracking-[-0.01em]">
        Veocel
        <sup className="ml-0.5 align-super text-[0.5em] font-semibold">™</sup>
      </span>
    </span>
  );
}
