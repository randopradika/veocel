import type {
  FeatureAccordionBlok,
  HeroNavCardBlok,
  PageBlok,
  SbStory,
} from "../types";

/**
 * Local stand-ins for the `home` and `fiber-types` stories, so both designs
 * render before a Storyblok space exists. `getStory()` in `lib/storyblok.ts`
 * falls back to these when no access token is configured.
 *
 * Copy is transcribed from the supplied mockups. Images are intentionally absent —
 * `BlockImage` renders a tinted placeholder for any empty asset, so the layout is
 * reviewable without shipping binaries. Add real assets in Storyblok.
 */

/**
 * The hero tab strip, repeated verbatim on every page in the fibers section.
 *
 * Shared rather than transcribed per page because it is the same six entries
 * each time, and a slug change would otherwise have to be chased across every
 * story. The card matching the current URL marks itself at render time — see
 * `HeroNavCards` — so nothing here says which page is current.
 *
 * All seven tabs the design draws. `beauty` is the new fiber-application page,
 * not the old `beauty-skincare` category page that was deleted.
 */
const HERO_TABS: Array<{ label: string; slug: string }> = [
  { label: "explore VEOCEL™ fibers", slug: "fiber-types" },
  { label: "VEOCEL™ fibers for wipes", slug: "wipes" },
  { label: "VEOCEL™ fibers for hygiene", slug: "hygiene" },
  { label: "VEOCEL™ fibers for beauty", slug: "beauty" },
  { label: "sustainability", slug: "sustainability" },
  { label: "daily care products with VEOCEL™ fibers", slug: "daily-care" },
  { label: "how to become a VEOCEL™ partner", slug: "partners" },
];

/** `prefix` keeps block uids unique across stories. */
function heroTabs(prefix: string): HeroNavCardBlok[] {
  return HERO_TABS.map((tab, index) => ({
    _uid: `${prefix}-nav-${index + 1}`,
    component: "hero_nav_card",
    label: tab.label,
    link: { cached_url: tab.slug, linktype: "story" },
  }));
}

/**
 * The two fiber write-ups that close every application page. The copy is
 * identical frame to frame in the design, so it lives here once.
 *
 * The Lyocell text is transcribed from the design, including its European Award
 * for the Environment claim — unverified, see HANDOFF.md. The Viscose text is a
 * reconstruction: that row is drawn collapsed in every frame.
 */
function fiberRows(prefix: string): FeatureAccordionBlok {
  return {
    _uid: `${prefix}-fibers`,
    component: "feature_accordion",
    layout: "rows",
    items: [
      {
        _uid: `${prefix}-fiber-1`,
        component: "accordion_item",
        title: "VEOCEL™ Viscose",
        body:
          "VEOCEL™ Viscose fibers are produced from wood pulp sourced from sustainably " +
          "managed forests, in a process that recovers sodium sulfate and the other " +
          "process chemicals for reuse.\n\n" +
          "The fibers are absorbent and soft against skin, which makes them a common " +
          "choice for wipes, absorbent hygiene products and industrial applications.",
      },
      {
        _uid: `${prefix}-fiber-2`,
        component: "accordion_item",
        title: "VEOCEL™ Lyocell",
        body:
          "VEOCEL™ Lyocell fibers have gained a commendable reputation for their " +
          "environmentally responsible, closed loop production process, which " +
          "transforms wood pulp into cellulosic fibers using a highly resource-efficient " +
          "process with low ecological impact. Within this solvent-spinning process, the " +
          "process water is recycled, and the solvent is recovered at a rate of more " +
          "than 99%.\n\n" +
          "The production process for VEOCEL™ Lyocell fibers received the European Award " +
          "for the Environment from the European Commission in the category “The " +
          "Technology Award for Sustainable Development” (2000).",
      },
    ],
  };
}

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

/*
 * The home page, mirroring the hand-built `home` story in Storyblok — hero and
 * the natural-circularity ring, from the "Homepage" frame (2010:1153 in the
 * Figma copy). The wheel artwork and hero photograph are Storyblok assets, so
 * offline the ring falls back to placeholder circles.
 */
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
      headline: "care begins within.",
      subline: "with the fiber, inside the product, with choices we make.",
      align: "left",
      nav_cards: heroTabs("h"),
    },
    {
      _uid: "h-process",
      component: "process_row",
      layout: "ring",
      heading: "a solution derived from nature, returning to nature.",
      body:
        "VEOCEL™ fibers, derived from responsibly managed wood sources, offer an " +
        "environmentally conscious fiber solution for personal care and hygiene products. " +
        "The fibers are produced in an environmentally responsible production process with " +
        "low water consumption and low carbon emissions, and are biodegradable in soil, " +
        "freshwater and marine conditions, as well as compostable in home and industrial " +
        "conditions at the end of their use.\n\n" +
        "VEOCEL™ fibers are derived from nature and return to nature — contributing to a " +
        "better future for the planet. This concept of natural circularity builds a solid " +
        "foundation for environmentally responsible applications.\n\n" +
        "For detailed information about our claims, please visit our VEOCEL™ claims page:",
      link_label: "veocel.com/en/claims",
      link: { url: "https://www.veocel.com/en/claims", linktype: "url", target: "_blank" },
      // Clockwise from the top, matching the wheel artwork's wedges.
      steps: [
        { _uid: "h-step-1", component: "process_step", title: "forest" },
        { _uid: "h-step-2", component: "process_step", title: "wood" },
        { _uid: "h-step-3", component: "process_step", title: "pulp" },
        { _uid: "h-step-4", component: "process_step", title: "VEOCEL™ fibers" },
        { _uid: "h-step-5", component: "process_step", title: "biodegradability" },
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
      // The first card points at this page, so the strip marks where the reader is.
      nav_cards: heroTabs("f"),
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

/*
 * The wipes page — Figma "Desktop [Rev]" frame 492:1468.
 *
 * Second of the seven tabs in the hero strip, so its own card points back here
 * and the strip marks it as the current page.
 *
 * The intro and the baby-wipes and Lyocell copy are transcribed from the frame.
 * The other three application descriptions are not in the design — those cards
 * are drawn collapsed — so the copy below is written to match the tone and is a
 * reconstruction, not supplied text. The European Award for the Environment
 * claim comes from the design and needs checking before it is relied on.
 */
const wipes: PageBlok = {
  _uid: "mock-wipes",
  component: "page",
  seo_title: "VEOCEL™ fibers for wipes",
  seo_description:
    "Wood-based VEOCEL™ Lyocell and Viscose fibers for baby wipes, body wipes, moist toilet tissue and surface cleaning wipes.",
  body: [
    {
      _uid: "w-hero",
      component: "hero",
      headline: "VEOCEL™ fibers for wipes",
      headline_size: "title",
      nav_cards: heroTabs("w"),
    },
    {
      _uid: "w-intro",
      component: "text_columns",
      align: "split",
      heading: "VEOCEL™ fibers for wipes",
      body:
        "wipes continue to evolve as consumer expectations and regulatory requirements " +
        "shape the future of the industry. with the implementation of the Single-Use " +
        "Plastics Directive (SUPD) in Europe and a growing demand for more responsible " +
        "materials, 100% wood-based VEOCEL™ fibers provide an effective solution for a " +
        "wide range of wipe applications.",
    },
    {
      _uid: "w-applications",
      component: "feature_accordion",
      layout: "cards",
      items: [
        {
          _uid: "w-app-1",
          component: "accordion_item",
          title: "baby wipes",
          body:
            "designed for gentle cleansing of delicate skin, baby wipes help provide " +
            "effective cleaning while maintaining softness and comfort during every " +
            "diaper change. they can be made with VEOCEL™ Lyocell and VEOCEL™ Viscose " +
            "fibers, offering a soft, absorbent and reliable foundation for high-quality " +
            "baby care wipes.",
        },
        {
          _uid: "w-app-2",
          component: "accordion_item",
          title: "body wipes",
          body:
            "for refreshing on the move, body wipes ask a lot of the material: enough " +
            "strength to hold up when wet, and a surface soft enough for repeated contact " +
            "with skin. wood-based VEOCEL™ fibers carry lotion well and stay intact " +
            "through use.",
        },
        {
          _uid: "w-app-3",
          component: "accordion_item",
          title: "moist toilet tissue",
          body:
            "moist toilet tissue has to be gentle in use and short-lived afterwards. " +
            "VEOCEL™ Lyocell shortcut fibers are made to disperse, so the wipe holds " +
            "together in the hand and breaks apart once it leaves it.",
        },
        {
          _uid: "w-app-4",
          component: "accordion_item",
          title: "surface cleaning wipes",
          body:
            "household and industrial wipes work against grease, dust and spills, often " +
            "with cleaning agents in the mix. VEOCEL™ fibers absorb well and keep their " +
            "structure when saturated, without adding plastic to a single-use product.",
        },
      ],
    },
    fiberRows("w"),
  ],
};

/*
 * The hygiene page — Figma "Desktop [Rev]" frame 492:1326.
 *
 * The same shape as wipes: intro, four application cards, then the shared fiber
 * rows. The intro and the pads description are transcribed from the frame; the
 * other three cards are drawn collapsed there, so that copy is written to match
 * and is a reconstruction.
 */
const hygiene: PageBlok = {
  _uid: "mock-hygiene",
  component: "page",
  seo_title: "VEOCEL™ fibers for hygiene",
  seo_description:
    "Wood-based VEOCEL™ fibers for pads, baby diapers, adult incontinence products and tampons — softness, absorbency and fluid management.",
  body: [
    {
      _uid: "hy-hero",
      component: "hero",
      headline: "VEOCEL™ fibers for hygiene",
      headline_size: "title",
      nav_cards: heroTabs("hy"),
    },
    {
      _uid: "hy-intro",
      component: "text_columns",
      align: "split",
      heading: "VEOCEL™ fibers for hygiene",
      body:
        "the hygiene industry is evolving as consumers increasingly seek products that " +
        "combine high performance with softness, skin-friendliness and responsible " +
        "material choices. from softness and skin-friendliness to absorbency and fluid " +
        "management, today's hygiene products are expected to deliver comfort without " +
        "compromising performance. 100% wood-based VEOCEL™ fibers enable manufacturers " +
        "to create high-performing hygiene products with cellulosic fiber solutions " +
        "across multiple product layers, supporting innovation in baby care, feminine " +
        "care and adult care applications.",
    },
    {
      _uid: "hy-applications",
      component: "feature_accordion",
      layout: "cards",
      items: [
        {
          _uid: "hy-app-1",
          component: "accordion_item",
          title: "pads",
          body:
            "designed to provide reliable protection and everyday comfort, sanitary pads " +
            "require efficient fluid acquisition, distribution and skin comfort. in " +
            "different product layers, they can be made with VEOCEL™ Lyocell, VEOCEL™ " +
            "Lyocell Dry, VEOCEL™ Viscostar and VEOCEL™ Viscose fibers, delivering " +
            "softness, skin-friendliness, absorbency and fluid management for feminine " +
            "hygiene applications.",
        },
        {
          _uid: "hy-app-2",
          component: "accordion_item",
          title: "baby diapers",
          body:
            "a diaper sits against the most delicate skin there is, for hours at a time. " +
            "wood-based fibers in the topsheet and acquisition layers move fluid away " +
            "from the surface and keep it dry, so comfort holds up over a full wear.",
        },
        {
          _uid: "hy-app-3",
          component: "accordion_item",
          title: "adult incontinence",
          body:
            "adult care products are asked to manage larger volumes discreetly, without " +
            "the bulk or the rustle that gives them away. cellulosic fibers bring " +
            "absorbency and a soft, textile-like surface to products worn all day.",
        },
        {
          _uid: "hy-app-4",
          component: "accordion_item",
          title: "tampon",
          body:
            "tampons ask for high absorbency from a small amount of material, and for " +
            "nothing left behind. VEOCEL™ Viscostar fibers are trilobal and bright, made " +
            "for absorbency and liquid spread in exactly this application.",
        },
      ],
    },
    fiberRows("hy"),
  ],
};

/*
 * The beauty page — Figma "Desktop [Rev]" frame 492:1198.
 *
 * The fourth tab, and the page that completes the strip. This is a fiber
 * application page; it does not restore the deleted `beauty-skincare` category
 * page, which had a different shape entirely.
 *
 * Only two application cards here, not four.
 *
 * NOTE ON THE INTRO: the frame's intro paragraph is the hygiene page's text,
 * unchanged — it argues about hygiene products, baby care, feminine care and
 * adult care on a beauty page, which reads as a copy-paste the designer has not
 * come back to. Shipping it verbatim would put visibly wrong copy on the page,
 * so the intro below is written for beauty in the same shape and register. Swap
 * it for the real text once the design is finished.
 */
const beauty: PageBlok = {
  _uid: "mock-beauty",
  component: "page",
  seo_title: "VEOCEL™ fibers for beauty",
  seo_description:
    "Wood-based VEOCEL™ fibers for facial wipes and sheet masks — softness, absorbency and a pleasant feel against facial skin.",
  body: [
    {
      _uid: "be-hero",
      component: "hero",
      headline: "VEOCEL™ fibers for beauty",
      headline_size: "title",
      nav_cards: heroTabs("be"),
    },
    {
      _uid: "be-intro",
      component: "text_columns",
      align: "split",
      heading: "VEOCEL™ fibers for beauty",
      body:
        "beauty routines are judged on how they feel as much as on what they do. a " +
        "facial wipe or sheet mask spends its whole working life against the most " +
        "sensitive skin on the body, so surface smoothness, moisture retention and a " +
        "clean skin feel matter as much as strength. 100% wood-based VEOCEL™ fibers " +
        "give formulators a botanic base for facial care products, carrying serum and " +
        "lotion well and leaving nothing behind but the treatment.",
    },
    {
      _uid: "be-applications",
      component: "feature_accordion",
      layout: "cards",
      items: [
        {
          _uid: "be-app-1",
          component: "accordion_item",
          title: "facial wipes",
          body:
            "facial wipes offer a convenient solution for cleansing, makeup removal and " +
            "everyday skincare on the go. they can be made with VEOCEL™ Lyocell and " +
            "VEOCEL™ Viscose fibers, delivering softness, absorbency and a pleasant skin " +
            "feel for a premium cleansing experience.",
        },
        {
          _uid: "be-app-2",
          component: "accordion_item",
          title: "facial sheet mask",
          body:
            "a sheet mask has to hold a large dose of serum, cling to the contours of the " +
            "face and stay put while it works. VEOCEL™ Lyocell Skin fibers are made for " +
            "this: micro diameters for drape, and a translucency that lets the mask all " +
            "but disappear on the skin.",
        },
      ],
    },
    fiberRows("be"),
  ],
};

/*
 * The "where to buy" page — Figma "Desktop [Rev]" frame 492:81. Tab 6, whose
 * label is "daily care products with VEOCEL™ fibers"; the page itself is the
 * brand directory.
 *
 * TWO THINGS HERE ARE SCAFFOLDING, NOT DATA:
 *
 * The brand list is partial. The frame shows 47 logos; the names below are the
 * ones legible in a 1920-wide render, and several were unreadable. Replace the
 * whole list with the real one — these are third-party brands and the list is a
 * public statement about who uses VEOCEL™ fibers.
 *
 * The category on each brand is a GUESS. The frame shows category filters but
 * not which brand sits in which, so the assignments below were made to exercise
 * the filter, not from any source. They are very likely wrong in places.
 */
const dailyCare: PageBlok = {
  _uid: "mock-daily-care",
  component: "page",
  seo_title: "where to buy | VEOCEL™",
  seo_description:
    "Brands making everyday care products with VEOCEL™ branded fibers — filter by product category or browse A to Z.",
  body: [
    {
      _uid: "dc-hero",
      component: "hero",
      headline: "daily care products with VEOCEL™ fibers",
      headline_size: "title",
      nav_cards: heroTabs("dc"),
    },
    {
      _uid: "dc-directory",
      component: "brand_directory",
      heading: "where to buy",
      intro:
        "click on the brand below to buy products that are made from VEOCEL™ branded " +
        "fibers.",
      categories: [
        { _uid: "dc-cat-1", component: "brand_category", label: "surface" },
        { _uid: "dc-cat-2", component: "brand_category", label: "intimate" },
        { _uid: "dc-cat-3", component: "brand_category", label: "body" },
        { _uid: "dc-cat-4", component: "brand_category", label: "beauty" },
      ],
      brands: [
        { _uid: "dc-b-1", component: "brand_item", name: "Adventure Ready", category: "body" },
        { _uid: "dc-b-2", component: "brand_item", name: "BIANCO", category: "beauty" },
        { _uid: "dc-b-3", component: "brand_item", name: "BIO-RAL", category: "body" },
        { _uid: "dc-b-4", component: "brand_item", name: "BRIDGE", category: "surface" },
        { _uid: "dc-b-5", component: "brand_item", name: "Carefree", category: "intimate" },
        { _uid: "dc-b-6", component: "brand_item", name: "cettua", category: "beauty" },
        { _uid: "dc-b-7", component: "brand_item", name: "CHIARA AMBRA", category: "beauty" },
        { _uid: "dc-b-8", component: "brand_item", name: "COSDAN", category: "beauty" },
        { _uid: "dc-b-9", component: "brand_item", name: "coterie", category: "body" },
        { _uid: "dc-b-10", component: "brand_item", name: "DeepFresh", category: "surface" },
        { _uid: "dc-b-11", component: "brand_item", name: "evne", category: "beauty" },
        { _uid: "dc-b-12", component: "brand_item", name: "FRISS", category: "surface" },
        { _uid: "dc-b-13", component: "brand_item", name: "goop", category: "beauty" },
        { _uid: "dc-b-14", component: "brand_item", name: "HARTMANN", category: "body" },
        { _uid: "dc-b-15", component: "brand_item", name: "Hogara", category: "beauty" },
        { _uid: "dc-b-16", component: "brand_item", name: "IMCLEAN", category: "surface" },
        { _uid: "dc-b-17", component: "brand_item", name: "kindoh", category: "body" },
        { _uid: "dc-b-18", component: "brand_item", name: "KUDOS", category: "body" },
        { _uid: "dc-b-19", component: "brand_item", name: "Lab. Smart", category: "surface" },
        { _uid: "dc-b-20", component: "brand_item", name: "mytowel", category: "body" },
        { _uid: "dc-b-21", component: "brand_item", name: "neomamaism", category: "intimate" },
        { _uid: "dc-b-22", component: "brand_item", name: "Neroli", category: "beauty" },
        { _uid: "dc-b-23", component: "brand_item", name: "Norafin", category: "surface" },
        { _uid: "dc-b-24", component: "brand_item", name: "PAEDIPROTECT", category: "body" },
        { _uid: "dc-b-25", component: "brand_item", name: "popotine", category: "intimate" },
        { _uid: "dc-b-26", component: "brand_item", name: "RICO", category: "body" },
        {
          _uid: "dc-b-27",
          component: "brand_item",
          name: "Sensatia Botanicals",
          category: "beauty",
        },
        { _uid: "dc-b-28", component: "brand_item", name: "watsons", category: "beauty" },
        { _uid: "dc-b-29", component: "brand_item", name: "Welkeeps", category: "intimate" },
        { _uid: "dc-b-30", component: "brand_item", name: "wellros", category: "body" },
        { _uid: "dc-b-31", component: "brand_item", name: "29 Days", category: "intimate" },
      ],
    },
  ],
};

export const mockStories: Record<string, SbStory<PageBlok>> = {
  home: story("home", "Home", home),
  "fiber-types": story("fiber-types", "VEOCEL™ fibers", fiberTypes),
  wipes: story("wipes", "VEOCEL™ fibers for wipes", wipes),
  hygiene: story("hygiene", "VEOCEL™ fibers for hygiene", hygiene),
  beauty: story("beauty", "VEOCEL™ fibers for beauty", beauty),
  "daily-care": story("daily-care", "where to buy", dailyCare),
};
