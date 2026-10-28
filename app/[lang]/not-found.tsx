/*
 * A page that 404s inside a locale renders the root not-found here, inside the
 * locale layout, so the header and footer — the way back in — stay on screen.
 * An unknown locale has no layout to keep, and falls through to
 * `app/not-found.tsx` itself. The title comes along too: the 404's own `<title>`
 * is read from the nearest not-found, and without it fell back to the site's.
 */
export { default, metadata } from "../not-found";
