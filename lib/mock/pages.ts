import type { PageBlok, SbStory } from "../types";

/**
 * Local stand-ins for the `home` and `beauty-skincare` stories, so both designs
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
          _uid: "h-cat-1",
          component: "category_card",
          kicker: "with VEOCEL™",
          title: "beauty + skincare",
          link: { cached_url: "beauty-skincare", linktype: "story" },
        },
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

const beautySkincare: PageBlok = {
  _uid: "mock-beauty",
  component: "page",
  seo_title: "beauty + skincare | VEOCEL™",
  seo_description:
    "Tender fibers for premium skincare — sheet masks, cleansing wipes and makeup removal wipes made with VEOCEL™ branded fibers.",
  body: [
    {
      _uid: "b-hero",
      component: "page_hero",
      theme: "dark",
      title: "beauty + skincare",
      subtitle: "improving your sustainable beauty routine with VEOCEL™",
    },
    {
      _uid: "b-text-1",
      component: "text_columns",
      align: "split",
      heading: "tender fibers, premium skincare",
      body:
        "VEOCEL™ branded fibers for beauty applications offer a soft, gentle touch on skin " +
        "while meeting high standards of quality and sustainability. Botanic origin, smooth " +
        "fiber surface and high moisture absorption make them a considered choice for face " +
        "masks and wipes — the kind of everyday product where what touches your skin matters.",
    },
    {
      _uid: "b-text-2",
      component: "text_columns",
      align: "center",
      heading: "personal care and hygiene products",
      body:
        "Quality and value-conscious consumers are looking for products that support their " +
        "everyday routines without compromise. VEOCEL™ branded fibers help brands deliver " +
        "comfort, performance and a clear sustainability story in a category people reach " +
        "for every single day.",
    },
    {
      _uid: "b-products",
      component: "product_grid",
      items: [
        {
          _uid: "b-prod-1",
          component: "product_card",
          title: "facial sheet mask",
          link: { cached_url: "beauty-skincare/facial-sheet-mask", linktype: "story" },
        },
        {
          _uid: "b-prod-2",
          component: "product_card",
          title: "facial cleansing wipes",
          link: { cached_url: "beauty-skincare/facial-cleansing-wipes", linktype: "story" },
        },
        {
          _uid: "b-prod-3",
          component: "product_card",
          title: "makeup removal wipes",
          link: { cached_url: "beauty-skincare/makeup-removal-wipes", linktype: "story" },
        },
      ],
    },
    {
      _uid: "b-split",
      component: "feature_split",
      media_position: "left",
      heading: "translucency technology",
      body:
        "Our sheet mask material makes VEOCEL™ lyocell fibers become translucent when wet, " +
        "so the mask visually disappears on the skin. The result is a lighter, more " +
        "comfortable mask that stays where it is placed — and a clearer view of the skin " +
        "underneath.",
    },
    {
      _uid: "b-features",
      component: "feature_accordion",
      heading: "VEOCEL™ beauty features",
      items: [
        {
          _uid: "b-feat-1",
          component: "accordion_item",
          title: "tender touch on skin",
          body:
            "The smooth surface of VEOCEL™ branded fibers gives a soft, gentle feel — " +
            "designed for direct, repeated contact with delicate facial skin.",
        },
        {
          _uid: "b-feat-2",
          component: "accordion_item",
          title: "wood based fibers",
          body:
            "Derived from wood grown in sustainably managed forests, a renewable raw " +
            "material rather than a fossil one.",
        },
        {
          _uid: "b-feat-3",
          component: "accordion_item",
          title: "clean & safe fibers",
          body:
            "Produced to strict standards and certified for skin contact, with no harmful " +
            "substances added along the way.",
        },
        {
          _uid: "b-feat-4",
          component: "accordion_item",
          title: "biodegradable fibers",
          body:
            "Certified compostable and biodegradable — the fibers return to nature at the " +
            "end of their life cycle.",
        },
        {
          _uid: "b-feat-5",
          component: "accordion_item",
          title: "responsible production",
          body:
            "Made in an environmentally responsible closed-loop process that recovers water " +
            "and solvent for reuse.",
        },
        {
          _uid: "b-feat-6",
          component: "accordion_item",
          title: "fibers w/ climate actions",
          body:
            "Part of a portfolio with science-based targets for reducing greenhouse gas " +
            "emissions across the value chain.",
        },
      ],
    },
    {
      _uid: "b-brands",
      component: "brand_strip",
      heading: "where to buy",
      link_label: "view all brands",
      link: { cached_url: "where-to-buy", linktype: "story" },
    },
  ],
};

export const mockStories: Record<string, SbStory<PageBlok>> = {
  home: story("home", "Home", home),
  "beauty-skincare": story("beauty-skincare", "beauty + skincare", beautySkincare),
};
