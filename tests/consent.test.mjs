import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";

import { CONSENT_BOOTSTRAP, GTM_ID, GTM_SERVICE_ID, USERCENTRICS_SETTINGS_ID } from "../lib/consent.ts";

/** Runs the bootstrap against a stand-in window on `hostname`. */
function boot(hostname) {
  const appended = [];
  const listeners = [];
  let reloads = 0;
  const window = {
    location: { hostname, reload: () => reloads++ },
    addEventListener: (type, listener) => type === "UC_CONSENT" && listeners.push(listener),
    document: {
      head: { appendChild: (element) => appended.push(element) },
      createElement: (tag) => ({ tag, dataset: {} }),
    },
  };
  window.window = window;
  vm.runInNewContext(CONSENT_BOOTSTRAP, window);

  return {
    window,
    appended,
    reloads: () => reloads,
    consent: (given) =>
      listeners.forEach((listener) =>
        listener({ detail: { services: { [GTM_SERVICE_ID]: { name: "Google Tag Manager", consent: { given } } } } }),
      ),
    tagManagers: () => appended.filter((element) => element.src?.startsWith("https://www.googletagmanager.com/")),
  };
}

/** The values pushed to the data layer, out of the sandbox's realm. */
const plain = (value) => JSON.parse(JSON.stringify(value));

test("Consent Mode starts with everything denied, before anything else is pushed", () => {
  const { window } = boot("www.veocel.com");
  assert.deepEqual(plain([...window.dataLayer[0]]), [
    "consent",
    "default",
    {
      ad_personalization: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      analytics_storage: "denied",
      wait_for_update: 2000,
    },
  ]);
});

test("the loader gets the published configuration on veocel.com and the draft anywhere else", () => {
  for (const host of ["www.veocel.com", "veocel.com"]) {
    const [cmp] = boot(host).appended;
    assert.equal(cmp.id, "usercentrics-cmp", host);
    assert.equal(cmp.src, "https://web.cmp.usercentrics.eu/ui/loader.js", host);
    assert.equal(cmp.dataset.settingsId, USERCENTRICS_SETTINGS_ID, host);
    assert.equal(cmp.dataset.draft, undefined, host);
  }
  for (const host of ["veocel.vercel.app", "localhost", "notveocel.com", "www.veocel.com.evil.example"]) {
    assert.equal(boot(host).appended[0].dataset.draft, "true", host);
  }
});

test("the tag manager waits for consent and loads once", () => {
  const page = boot("www.veocel.com");
  assert.equal(page.tagManagers().length, 0);

  page.consent(false);
  assert.equal(page.tagManagers().length, 0);

  page.consent(true);
  page.consent(true);
  assert.equal(page.tagManagers().length, 1);
  assert.equal(page.tagManagers()[0].src, `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`);
  assert.equal(page.window.dataLayer.at(-1).event, "gtm.js");
  assert.equal(page.reloads(), 0);
});

test("withdrawing consent reloads the page, and only once the tag manager has loaded", () => {
  const page = boot("www.veocel.com");
  page.consent(false);
  assert.equal(page.reloads(), 0);

  page.consent(true);
  page.consent(false);
  assert.equal(page.reloads(), 1);
});
