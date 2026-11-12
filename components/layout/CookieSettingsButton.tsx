"use client";

declare global {
  interface Window {
    /** Usercentrics' v3 API, there as soon as its loader has run — see `lib/consent.ts`. */
    __ucCmp?: { showSecondLayer: () => Promise<void> };
  }
}

/**
 * Reopens the Usercentrics settings, so a visitor can change or withdraw what
 * they chose in the banner. The configuration hides Usercentrics' own floating
 * privacy button, so this is the way back in. `showSecondLayer` waits for the CMP
 * to finish starting, so an early click still opens it.
 */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => void window.__ucCmp?.showSecondLayer()} className={className}>
      cookie settings
    </button>
  );
}
