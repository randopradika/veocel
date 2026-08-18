import type { PageBlok, SbStory } from "../types";

/**
 * Local stand-ins for the `home` and `fiber-types` stories, so both designs
 * render before a Storyblok space exists. `getStory()` in `lib/storyblok.ts`
 * falls back to these when no access token is configured.
 *
 * Copy is transcribed from the supplied mockups. Images are intentionally absent —
 * `BlockImage` renders a tinted placeholder for any empty asset, so the layout is
 * reviewable without shipping binaries. Add real assets in Storyblok.
 */

function story(slug: string, name: string, content: PageBlok): SbStory<PageBlok> {
  return {
    id: 0,
    uuid: `mock-${slug}`,
    name,
    slug,
    full_slug: slug,
    content,
    published_at: null,
    first_published_at: null,
  };
}

const home: PageBlok = {
  _uid: "mock-home",
  component: "page",
  seo_title: "VEOCEL™ — advancing to cellulosics",
  seo_description:
    "VEOCEL™ branded cellulosic fibers for beauty, body, hygiene and surface care — derived from nature, returning to nature.",
  body: [
    {
      _uid: "h-hero",
      component: "hero",
      eyebrow: "advancing to",
      headline: "cellulosics",
      subline: "with VEOCEL™ fibers",
      scroll_hint: "scroll to discover",
    },
    {
      _uid: "h-intro",
      component: "intro_section",
      heading: "purely for you.",
      layout: "split",
      align: "left",
      body:
        "VEOCEL™ branded fibers are made from wood, a renewable raw material, and are " +
        "certified compostable and biodegradable. They return to nature at the end of their " +
        "life cycle — so the products you use every day can be gentle on your skin and on " +
        "the planet at the same time.",
    },
    {
      _uid: "h-categories",
      component: "category_grid",
      columns: "2",
      items: [
        {
          _uid: "h-cat-2",
          component: "category_card",
          kicker: "with VEOCEL™",
          title: "personal + body care",
          link: { cached_url: "personal-body-care", linktype: "story" },
        },
        {
          _uid: "h-cat-3",
          component: "category_card",
          kicker: "with VEOCEL™",
          title: "intimate + hygiene care",
          link: { cached_url: "intimate-hygiene-care", linktype: "story" },
        },
        {
          _uid: "h-cat-4",
          component: "category_card",
          kicker: "with VEOCEL™",
          title: "household + surface care",
          link: { cached_url: "household-surface-care", linktype: "story" },
        },
      ],
    },
    {
      _uid: "h-process",
      component: "process_row",
      heading: "a solution derived from nature, returning to nature.",
      align: "right",
      steps: [
        {
          _uid: "h-step-1",
          component: "process_step",
          title: "forest",
          description: "sustainably managed and certified forests",
        },
        {
          _uid: "h-step-2",
          component: "process_step",
          title: "wood",
          description: "a renewable raw material, responsibly sourced",
        },
        {
          _uid: "h-step-3",
          component: "process_step",
          title: "pulp",
          description: "wood is processed into dissolving wood pulp",
        },
        {
          _uid: "h-step-4",
          component: "process_step",
          title: "cellulosic fibers",
          description: "pulp is spun into VEOCEL™ branded fibers",
        },
        {
          _uid: "h-step-5",
          component: "process_step",
          title: "end application",
          description: "nonwoven products for everyday care",
        },
        {
          _uid: "h-step-6",
          component: "process_step",
          title: "biodegradability",
          description: "fibers return to where they came from",
        },
      ],
    },
    {
      _uid: "h-banner",
      component: "image_banner",
      height: "tall",
      title: "#ItsInOurHands",
      subtitle: "the little things add up — small everyday choices, a lasting difference.",
      link_label: "join the movement",
      link: { cached_url: "its-in-our-hands", linktype: "story" },
    },
    {
      _uid: "h-explore",
      component: "explore_tabs",
      heading: "more from VEOCEL™",
      tabs: [
        {
          _uid: "h-tab-1",
          component: "explore_tab",
          title: "explore VEOCEL™",
          description: "what our branded fibers are and where they come from",
          link: { cached_url: "explore", linktype: "story" },
        },
        {
          _uid: "h-tab-2",
          component: "explore_tab",
          title: "VEOCEL™ fiber types",
          description: "lyocell and modal fibers, and what each one is good at",
          link: { cached_url: "fiber-types", linktype: "story" },
        },
        {
          _uid: "h-tab-3",
          component: "explore_tab",
          title: "VEOCEL™ certifications",
          description: "the standards our fibers are certified against",
          link: { cached_url: "certifications", linktype: "story" },
        },
        {
          _uid: "h-tab-4",
          component: "explore_tab",
          title: "branding services",
          description: "co-branding support for partners and brand owners",
          link: { cached_url: "branding-services", linktype: "story" },
        },
      ],
    },
    {
      _uid: "h-news",
      component: "news_list",
      heading: "latest news",
      intro: "Discover the latest news and stories around VEOCEL™.",
      items: [
        {
          _uid: "h-news-1",
          component: "news_item",
          category: "press release",
          date: "2026-06-18",
          title:
            "Lenzing group highlights scalable, bio-based nonwovens solutions at leading global industry fairs",
          link: { cached_url: "news/industry-fairs", linktype: "story" },
        },
        {
          _uid: "h-news-2",
          component: "news_item",
          category: "press release",
          date: "2026-05-14",
          title:
            "award-nominated Lenzing™ dualwipe supports europe's shift to bio-based materials",
          link: { cached_url: "news/dualwipe-award", linktype: "story" },
        },
        {
          _uid: "h-news-3",
          component: "news_item",
          category: "press release",
          date: "2026-04-02",
          title:
            "VEOCEL™ lyocell production expands to asia — launching a new chapter for nonwovens in the region",
          link: { cached_url: "news/asia-expansion", linktype: "story" },
        },
      ],
    },
  ],
};

/*
 * The fiber types page.
 *
 * Certification names and certificate numbers below are read off a
 * low-resolution mockup and are NOT verified against the certificates
 * themselves. Check every one against the issuing body before this page is
 * published — a wrong certificate number is a compliance claim, not a typo.
 */
const fiberTypes: PageBlok = {
  _uid: "mock-fiber-types",
  component: "page",
  seo_title: "VEOCEL™ fibers — lyocell and viscose fiber types",
  // Storyblok caps seo_description at 160 characters; the API rejects the whole
  // story on save if this runs over.
  seo_description:
    "The VEOCEL™ fiber portfolio: lyocell, viscose and viscostar — how each is produced, what it is certified against, and which nonwoven applications it suits.",
  body: [
    {
      _uid: "f-hero",
      component: "hero",
      headline: "VEOCEL™ fibers",
      headline_size: "title",
      nav_cards: [
        {
          _uid: "f-nav-1",
          component: "hero_nav_card",
          label: "explore VEOCEL™ fibers",
          // Points at this page, so the strip marks where the reader is.
          link: { cached_url: "fiber-types", linktype: "story" },
        },
        {
          _uid: "f-nav-2",
          component: "hero_nav_card",
          label: "VEOCEL™ fibers for wipes",
          link: { cached_url: "household-surface-care", linktype: "story" },
        },
        {
          _uid: "f-nav-3",
          component: "hero_nav_card",
          label: "VEOCEL™ fibers for hygiene",
          link: { cached_url: "intimate-hygiene-care", linktype: "story" },
        },
        {
          _uid: "f-nav-5",
          component: "hero_nav_card",
          label: "sustainability",
          link: { cached_url: "sustainability", linktype: "story" },
        },
        {
          _uid: "f-nav-6",
          component: "hero_nav_card",
          label: "daily care products with VEOCEL™ fibers",
          link: { cached_url: "personal-body-care", linktype: "story" },
        },
        {
          _uid: "f-nav-7",
          component: "hero_nav_card",
          label: "how to become a VEOCEL™ partner",
          link: { cached_url: "partners", linktype: "story" },
        },
      ],
    },
    {
      _uid: "f-types",
      component: "fiber_type_grid",
      items: [
        {
          _uid: "f-type-1",
          component: "fiber_type_card",
          title: "VEOCEL™ Lyocell",
          link_label: "explore",
          link: { cached_url: "fiber-types/lyocell", linktype: "story" },
        },
        {
          _uid: "f-type-2",
          component: "fiber_type_card",
          title: "VEOCEL™ Viscose",
          link_label: "explore",
          link: { cached_url: "fiber-types/viscose", linktype: "story" },
        },
        {
          _uid: "f-type-3",
          component: "fiber_type_card",
          title: "VEOCEL™ Viscostar",
          subtitle: "VEOCEL™ Viscostar - Hygiene*",
          link_label: "explore",
          link: { cached_url: "fiber-types/viscostar", linktype: "story" },
        },
      ],
    },
    {
      _uid: "f-certs",
      component: "certification_grid",
      items: [
        {
          _uid: "f-cert-1",
          component: "certification_item",
          label: "FSC (Chain of Custody)",
        },
        {
          _uid: "f-cert-2",
          component: "certification_item",
          label: "PEFC (Chain of Custody)",
        },
        {
          _uid: "f-cert-3",
          component: "certification_item",
          label: "The EU Ecolabel (Chain of Custody)",
        },
        {
          _uid: "f-cert-4",
          component: "certification_item",
          label: "USDA Certified Biobased Product",
        },
        {
          _uid: "f-cert-5",
          component: "certification_item",
          label: "OK biodegradable SOIL",
        },
        {
          _uid: "f-cert-6",
          component: "certification_item",
          label: "OK biodegradable WATER",
        },
        {
          _uid: "f-cert-7",
          component: "certification_item",
          label: "OK biodegradable MARINE",
        },
        {
          _uid: "f-cert-8",
          component: "certification_item",
          label: "OK biodegradable INDUSTRIAL",
        },
        {
          _uid: "f-cert-9",
          component: "certification_item",
          label: "OK biodegradable HOME",
        },
        {
          _uid: "f-cert-10",
          component: "certification_item",
          label: "ISEGA (No. 66964)",
          note: "(applying to LENZING™ Lyocell fibers)",
        },
        {
          _uid: "f-cert-11",
          component: "certification_item",
          label: "ISEGA (No. 89068)",
          note: "(applying to LENZING™ Viscose fibers)",
        },
        {
          _uid: "f-cert-12",
          component: "certification_item",
          label: "STANDARD 100 by OEKO-TEX®",
          note: "(annex 6, product class I)",
        },
        {
          _uid: "f-cert-13",
          component: "certification_item",
          label: "Medically Tested — Tested for Toxins",
        },
      ],
    },
    {
      _uid: "f-diagram-lyocell",
      component: "process_diagram",
      heading: "VEOCEL™ Lyocell production process",
      caption:
        "Wood is processed into pulp, dissolved in an organic solvent and spun into " +
        "VEOCEL™ Lyocell fibers. More than 99% of the solvent is recovered from the " +
        "process water and used again.",
    },
    {
      _uid: "f-diagram-viscose",
      component: "process_diagram",
      heading: "VEOCEL™ Viscose production process",
      caption:
        "Wood is processed into pulp and spun into VEOCEL™ Viscose fibers. Sodium " +
        "sulfate and the other process chemicals are recovered and returned to the " +
        "production loop.",
    },
    {
      _uid: "f-portfolio-lyocell",
      component: "fiber_portfolio",
      heading: "VEOCEL™ Lyocell Fibers Nonwoven Portfolio",
      intro:
        "Lenzing provides a wide range of Lyocell fibers designed for use in various " +
        "applications.",
      row_labels: "Fiber Diameter\nKey Applications\nFiber Features",
      columns: [
        {
          _uid: "f-lyo-1",
          component: "portfolio_column",
          title: "Lyocell Nonwoven",
          values: "Standard, Fine, Coarse\nWipes, Industrial\nCrimp, TCF, EC",
        },
        {
          _uid: "f-lyo-2",
          component: "portfolio_column",
          title: "Lyocell Dry",
          values: "Standard, Fine, Coarse\nSanitary Pads, Wipes, Technical\nHydrophobic, TCF",
        },
        {
          _uid: "f-lyo-3",
          component: "portfolio_column",
          title: "Lyocell Skin",
          values: "Standard, Micro\nBeauty Sheet Masks, Patches\nTranslucency",
        },
        {
          _uid: "f-lyo-4",
          component: "portfolio_column",
          title: "Lyocell Shortcut",
          values: "Standard, Fine\nMTTs, Wipes\nDispersibility, Special Cut, Antistat",
        },
      ],
    },
    {
      _uid: "f-portfolio-viscose",
      component: "fiber_portfolio",
      heading: "VEOCEL™ Viscose Fibers Nonwoven Portfolio",
      intro:
        "Lenzing provides a wide range of Viscose fibers designed for use in various " +
        "applications.",
      row_labels: "Fiber Diameter\nKey Applications\nFiber Features",
      columns: [
        {
          _uid: "f-vis-1",
          component: "portfolio_column",
          title: "Viscose Nonwoven",
          values: "Standard, Fine, Coarse\nWipes, AHP, Industrial\nTCF, Absorbency",
        },
        {
          _uid: "f-vis-2",
          component: "portfolio_column",
          title: "Viscose Tampon, Viscostar",
          values: "Coarse\nTampons\nTCF, Trilobal, Bright, High Absorbency",
        },
        {
          _uid: "f-vis-3",
          component: "portfolio_column",
          title: "Viscostar Core",
          values: "Coarse\nAHP Core\nTrilobal, Absorbency, Liquid Spread",
        },
      ],
    },
  ],
};

export const mockStories: Record<string, SbStory<PageBlok>> = {
  home: story("home", "Home", home),
  "fiber-types": story("fiber-types", "VEOCEL™ fibers", fiberTypes),
};
