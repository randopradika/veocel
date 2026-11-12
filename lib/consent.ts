/**
 * Cookie consent: Usercentrics asks first, and www.veocel.com's tag manager loads
 * behind it.
 *
 * `CONSENT_BOOTSTRAP` runs inline in every page's head (the root layout), while
 * the page is still being parsed. In order, it:
 *
 * 1. Sets Google Consent Mode's defaults — every storage type denied. The
 *    Usercentrics configuration has Consent Mode switched on, so the CMP sends the
 *    `update` once a visitor has chosen.
 * 2. Loads the GTM container only once the visitor consents to the configuration's
 *    "Google Tag Manager" service. Loading it straight away and leaving the rest to
 *    Consent Mode (Usercentrics' "advanced" pattern) is not safe with this
 *    container: Consent Mode governs Google's own tags only, and the container also
 *    carries Custom HTML tags — a Meta Pixel, wild0army — that fire on every page.
 *    Those still need consent checks inside GTM: once the container is loaded they
 *    fire whatever the visitor chose for marketing.
 *
 *    `UC_CONSENT` fires for every consent state the CMP applies, the stored one on
 *    page load included, so a returning visitor's container loads without a click.
 *    The listener is attached before the loader runs, so that first event is never
 *    missed. Withdrawing consent reloads the page: a loaded container can't be
 *    unloaded.
 * 3. Loads the Usercentrics v3 loader, which reads its settings off the
 *    `#usercentrics-cmp` element. The published configuration allows veocel.com
 *    only, so every other host — the Vercel dev box, localhost — loads the
 *    configuration's draft (`data-draft`), which is where changes are tried before
 *    they are published in the Usercentrics admin.
 */

/** VEOCEL's Usercentrics configuration, in Lenzing's account. */
export const USERCENTRICS_SETTINGS_ID = "K9kNPS92B4Fqmd";

/** The hosts the published configuration is for; anywhere else loads the draft. */
export const LIVE_HOST = /(^|\.)veocel\.com$/;

/** www.veocel.com's container, carried over as it is. */
export const GTM_ID = "GTM-KPQBM3D";

/**
 * Usercentrics' id for its "Google Tag Manager" service — the key the service
 * goes under in a consent event's `services`. The id is Usercentrics' own, the
 * same in every configuration, so renaming the service doesn't break the gate.
 */
export const GTM_SERVICE_ID = "BJ59EidsWQ";

export const CONSENT_BOOTSTRAP = `(() => {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { dataLayer.push(arguments); };
  gtag("consent", "default", {
    ad_personalization: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    analytics_storage: "denied",
    wait_for_update: 2000,
  });
  gtag("set", "ads_data_redaction", true);

  let tagManager = false;
  addEventListener("UC_CONSENT", (event) => {
    const given = Boolean(event.detail?.services?.[${JSON.stringify(GTM_SERVICE_ID)}]?.consent?.given);
    if (given && !tagManager) {
      tagManager = true;
      dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtm.js?id=" + ${JSON.stringify(GTM_ID)};
      document.head.appendChild(script);
    } else if (!given && tagManager) {
      location.reload();
    }
  });

  const cmp = document.createElement("script");
  cmp.id = "usercentrics-cmp";
  cmp.src = "https://web.cmp.usercentrics.eu/ui/loader.js";
  cmp.async = true;
  cmp.dataset.settingsId = ${JSON.stringify(USERCENTRICS_SETTINGS_ID)};
  if (!${LIVE_HOST}.test(location.hostname)) cmp.dataset.draft = "true";
  document.head.appendChild(cmp);
})();`;
