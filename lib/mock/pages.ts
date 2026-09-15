import type {
  ArticleBlok,
  BrandItemBlok,
  ClaimCardBlok,
  FiberProductCardBlok,
  HeroNavCardBlok,
  PageBlok,
  SbStory,
  StoryContent,
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
  { label: "daily care products w/ VEOCEL™ fibers", slug: "daily-care" },
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
 * Every claim VEOCEL™ states, with the copy, footnotes and proof list behind
 * it. The sustainability page shows the full set; the product pages restate a
 * subset through `claimCards()`, so a claim is worded and evidenced identically
 * wherever it appears and is edited here once.
 *
 * Uids are the sustainability page's own. `claimCards()` re-stamps them per
 * page, because a blok uid has to be unique across stories.
 */
const CLAIMS: ClaimCardBlok[] = [
  {
    _uid: "su-claim-1",
    component: "claim_card",
    title: "wood-based fibers",
    body:
      "VEOCEL™ fibers are wood-based, derived from renewable wood sources " +
      "through a pulping process and finally made into fibers. VEOCEL™ fibers " +
      "bring the inherent advantages of cellulose to personal care and hygiene " +
      "products: natural absorbency, liquid distribution, biodegradability and " +
      "versatility.",
    proof_label: "proof:",
    proof:
      "USDA biobased product\n" +
      "FSC® / PEFC certified\n" +
      "Lenzing Wood and Pulp Policy\n" +
      "TÜV AUSTRIA certification",
  },
  {
    _uid: "su-claim-2",
    component: "claim_card",
    title: "responsible production",
    body:
      "VEOCEL™ branded fibers are manufactured with high production standards " +
      "with low emissions to air and water, thereby safeguarding resources for " +
      "future generations*.\n\n" +
      "* these results were calculated using the Higg Materials Sustainability " +
      "Index (Higg MSI) tools provided by the Sustainable Apparel Coalition. The " +
      "Higg MSI tools assess impacts of materials from cradle-to-gate for a " +
      "finished material (e.g. to the point at which the materials are ready to " +
      "be assembled into a product). However, this figure only shows impacts " +
      "from cradle to fiber production gate. VEOCEL™ branded fibers’ LCA " +
      "results are represented by TENCEL™/ECOVERO™ data based on Higg MSI " +
      "database v3.7 (December, 2023).",
    proof_label: "proof:",
    proof:
      "externally calculated LCA results\n" +
      "Higg MSI data\n" +
      "Lenzing Focus Paper “Responsible Production”\n" +
      "sustainability reports\n" +
      "EU Ecolabel / EU BAT standard",
  },
  {
    _uid: "su-claim-3",
    component: "claim_card",
    title: "biodegradable fibers",
    body:
      "derived from the natural material — wood, VEOCEL™ fibers are " +
      "biodegradable in soil, freshwater and marine conditions and compostable " +
      "under industrial and home conditions, and can fully return to nature*.\n\n" +
      "* this claim is not applicable in California, U.S.A. and France.",
    proof_label: "proof:",
    proof: "TÜV AUSTRIA certification\nSCRIPPS study",
  },
  {
    _uid: "su-claim-4",
    component: "claim_card",
    title: "responsible wood and pulp sourcing",
    body:
      "the raw material for VEOCEL™ fibers is derived from wood sources grown " +
      "in responsibly managed forests*, following the stringent guidelines of " +
      "the Lenzing Wood and Pulp Policy and applying trusted forest " +
      "certification systems.\n\n" +
      "* please refer to Lenzing Wood & Pulp Policy (lenzing.com)",
    proof_label: "proof:",
    proof:
      "Lenzing’s Wood and Pulp Policy\n" +
      "FSC®/ PEFC certificates with Chain of Custody\n" +
      "The Hot Button Report",
  },
  /*
    The ten further claims, from node 2055:1391 — a detached frame beside
    the page rather than part of the 2053:474 artboard, so it reads as a
    continuation of this same grid and not a section of its own.

    Ordered as the frame lays them out (left to right, top to bottom), not
    by its layer names: it numbers these 5-14 but places 5 and 7 in the
    right column with 6 and 8 to their left, so following the names would
    mirror the first two rows against the drawing.

    No `icon` here, as with the four above — the marks are attached to the
    cards in Storyblok, and a field set in the mock would overwrite them on
    the next seed.
  */
  {
    _uid: "su-claim-5",
    component: "claim_card",
    title: "gentle on skin",
    body:
      "VEOCEL™ Lyocell fibers are gentle on skin and naturally smooth, " +
      "providing comfort for skin.",
    proof_label: "proof:",
    proof:
      "microscopic fiber surface of VEOCEL™ Lyocell fibers\n" +
      "softness panel tests – comparison of rough / smooth",
  },
  {
    _uid: "su-claim-6",
    component: "claim_card",
    title: "skin-friendly fibers",
    body:
      "VEOCEL™ branded fibers are suitable for products that come into " +
      "contact with skin, as ensured by international standards, tests and " +
      "industry-wide recognized certifications.",
    proof_label: "proof:",
    proof:
      "study “friction coefficient on skin”\n" +
      "inherent properties of cellulosic fibers",
  },
  {
    _uid: "su-claim-7",
    component: "claim_card",
    title: "dermatologically tested",
    body: "dermatologically tested skin-friendly material.",
    proof_label: "proof:",
    proof: "softness results for LENZING™ Lyocell Skin fibers (dry + wet state)",
  },
  {
    _uid: "su-claim-8",
    component: "claim_card",
    title: "natural wearing comfort",
    body:
      "VEOCEL™ fibers contribute to keep your skin in natural balance. They " +
      "support your skin’s natural thermal and moisture regulation.",
    proof_label: "proof:",
    proof:
      "inherent properties of VEOCEL™ Lyocell fibers\n" +
      "softness panel results for LENZING™ Lyocell Dry fibers\n" +
      "pictures taken by microscope\n" +
      "R&D measurements",
  },
  {
    _uid: "su-claim-9",
    component: "claim_card",
    title: "high quality standards",
    body:
      "VEOCEL™ fibers are compliant with OEKO-TEX® STANDARD 100 Product " +
      "class I, including Appendix 6, affirming that the fibers have been " +
      "tested for numerous regulated and non-regulated harmful substances, " +
      "and therefore, indicating that the fibers are harmless to human " +
      "health. VEOCEL™ fibers are awarded with the FKT label “MEDICALLY " +
      "TESTED – TESTED FOR TOXINS” and have passed FKT’s strict body " +
      "compatibility tests.",
    proof_label: "proof:",
    proof:
      "OEKO-TEX® STANDARD 100 Product class I, including Appendix 6\n" +
      "FKT label “MEDICALLY TESTED – TESTED FOR TOXINS”\n" +
      "Internal standards (Mibio, BAT for VEOCEL™ Viscose)\n" +
      "ISEGA // food contact compliant\n" +
      "European Pharmacopoeia\n" +
      "ISO / BISFA norms\n" +
      "risk assessments done by external parties\n" +
      "Global pest control system – internal set-up\n" +
      "The Blue Label Denmark",
  },
  {
    _uid: "su-claim-10",
    component: "claim_card",
    title: "fragrance-free fibers",
    body:
      "The odor neutrality of VEOCEL™ Lyocell fibers supports the trend " +
      "towards fragrance-reduced wipes and makes the use of masking agents " +
      "in nonwoven products unnecessary.",
    proof_label: "proof:",
    proof: "inherent properties of VEOCEL™ Lyocell fibers",
  },
  {
    _uid: "su-claim-11",
    component: "claim_card",
    title: "great wet strength",
    body:
      "VEOCEL™ Lyocell fibers are versatile and distinguished by their " +
      "great strength among cellulosic fibers. They can be used to produce " +
      "lightweight nonwoven fabrics that exhibit great tensile strength in " +
      "both dry and wet states.",
    proof_label: "proof:",
    proof:
      "tenacity measurements // inherent properties of VEOCEL™ Lyocell fibers",
  },
  {
    _uid: "su-claim-12",
    component: "claim_card",
    title: "liquid management",
    body:
      "The inherent properties of cellulosic fibers naturally regulate " +
      "liquid absorption and release. This leads to a uniform distribution " +
      "of the liquid within the fibers and by extension the personal care " +
      "products made from them, offering an effective way to care for, and " +
      "ultimately greater comfort, to your skin.",
    proof_label: "proof:",
    proof:
      "inherent properties of cellulosic fibers\n" +
      "regular liquid management measurements of VEOCEL™ Lyocell and " +
      "Viscose fibers (R&D)",
  },
  {
    _uid: "su-claim-13",
    component: "claim_card",
    // The frame's layer reads "chlorrine"; the claim itself spells it correctly.
    title: "totally chlorine-free fibers",
    body:
      "VEOCEL™ branded fibers are totally chlorine-free and produced with " +
      "extensive and advanced quality controls to assure fibers deliver on " +
      "consumer and industry expectations for usage in intimate products, " +
      "such as tampons, which come into direct contact with the most " +
      "sensitive parts of the body.",
    proof_label: "proof:",
    proof:
      "AOX Measurement: Below 0.01 mg/L detection limit according to " +
      "ISO 9562: 2004.\n" +
      "TCF production / Lenzing self-declaration",
  },
  {
    _uid: "su-claim-14",
    component: "claim_card",
    title: "premium European-made fibers",
    body:
      "VEOCEL™ wood-based cellulosic fibers are produced in Europe " +
      "according to high environmental and production standards. These " +
      "European-made fibers are a key ingredient in the development and " +
      "manufacturing of many high-quality premium products.",
    proof_label: "proof:",
    proof:
      "production site in Europe (certificate of origin)\n" +
      "EU Ecolabel + SBT commitment + aspirational targets in ZDHC",
  },
];

/**
 * The claims a product page restates, copied from `CLAIMS` by title.
 *
 * A claim carries the same icon, copy, footnotes and proof list on every page
 * that makes it, so the product pages quote the sustainability card rather than
 * wording it again — pass the titles this page states, in the order it states
 * them.
 *
 * `prefix` keeps uids unique across stories, and the index makes them stable:
 * `scripts/merge-claim-cards.mjs` pairs live cards by `_uid`, so reordering a
 * list here would read to it as a set of new cards.
 *
 * Throws on an unknown title. That is deliberate — a typo should stop the build
 * rather than quietly drop a claim from a page.
 */
function claimCards(prefix: string, titles: string[]): ClaimCardBlok[] {
  return titles.map((title, index) => {
    const claim = CLAIMS.find((card) => card.title === title);
    if (!claim) throw new Error(`No claim titled "${title}" in CLAIMS`);
    return { ...structuredClone(claim), _uid: `${prefix}-claim-${index + 1}` };
  });
}

/**
 * One "where to buy" directory entry. `category` is a comma-separated list of
 * category labels; `url` is the brand's external shop link.
 */
function brand(uid: string, name: string, category: string, url: string): BrandItemBlok {
  return {
    _uid: uid,
    component: "brand_item",
    name,
    category,
    link: { url, linktype: "url" },
  };
}

/**
 * A mock story at `path`. A start page stands for its folder: its `full_slug` is
 * the folder's with a trailing slash, as Storyblok writes it.
 */
function story<T extends StoryContent>(
  path: string,
  name: string,
  content: T,
  { startpage = false }: { startpage?: boolean } = {},
): SbStory<T> {
  return {
    id: 0,
    uuid: `mock-${path}`,
    name,
    slug: path.slice(path.lastIndexOf("/") + 1),
    full_slug: startpage ? `${path}/` : path,
    ...(startpage ? { is_startpage: true } : {}),
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
 * The fiber types page — Figma frame 2039:961 on the "Desktop Dev" page, the
 * third portfolio revision (after 2010:465 and 2019:1326). The earlier
 * certification wall, production diagrams and comparison table left the page
 * with the first portfolio design; they live on in git history and the block
 * library.
 *
 * This revision takes the three spec rows OFF the cards: a card is photo and
 * underlined name, and the name opens a pop-up (frame 2039:359) carrying a
 * description and the rows — fiber diameter, key applications, fiber
 * features. It adds an eighth fiber, VEOCEL™ Lyocell EC, and writes the two
 * Viscose names "Viscostar", closing the split with the hygiene tampon copy
 * that 2019:1326's "Vicostar" had opened.
 *
 * The spec values are still the 2019:1326 transcriptions — this revision
 * draws no specs of its own — so they still need checking against product
 * documentation. Only one description exists in the design, Lyocell Dry's
 * (the pop-up preview); the other cards open on their specs alone until copy
 * is written, and Lyocell EC, with neither, keeps a plain name until it has
 * something to show. Two 2019:1326 typos stay corrected: the Lyocell Skin
 * card labelled its key-applications row "fiber features", and Vicostar
 * Core's features read "triobal" for "trilobal".
 */
function fiberCard(
  uid: string,
  name: string,
  specs?: { diameter: string; applications: string; features: string },
  description?: string,
): FiberProductCardBlok {
  return {
    _uid: uid,
    component: "fiber_product_card",
    name,
    description,
    ...specs,
  };
}

const fiberTypes: PageBlok = {
  _uid: "mock-fiber-types",
  component: "page",
  seo_title: "VEOCEL™ fibers — the nonwoven fiber portfolio",
  // Storyblok caps seo_description at 160 characters; the API rejects the whole
  // story on save if this runs over.
  seo_description:
    "The VEOCEL™ nonwoven portfolio: Lyocell and Viscose fiber types and the applications each serves — wipes, hygiene, beauty and surface cleaning.",
  body: [
    {
      _uid: "f-hero",
      component: "hero",
      headline: "explore VEOCEL™ fibers",
      // The pale blue plate on "fibers" is off for now; uncomment to bring it back.
      // headline_highlight: "fibers",
      headline_size: "title",
      nav_cards: heroTabs("f"),
    },
    {
      _uid: "f-lyocell",
      component: "fiber_product_grid",
      heading: "VEOCEL™ Lyocell Fibers Nonwoven Portfolio",
      intro:
        "Lenzing provides a wide range of Lyocell fibers designed for the use in various applications.",
      items: [
        fiberCard("f-ly-1", "VEOCEL™ Lyocell Nonwoven", {
          diameter: "standard, fine, coarse",
          applications: "wipes, industrial",
          features: "crimp, TCF, EC",
        }),
        fiberCard(
          "f-ly-2",
          "VEOCEL™ Lyocell Dry",
          {
            diameter: "standard, fine, coarse",
            applications: "sanitary pads, wipes, technical",
            features: "hydrophobic, TCF",
          },
          "Lyocell Dry fibers achieve liquid-controlling properties with a performance " +
            "enhancing treatment. Consumers can experience impeccable dryness and " +
            "next-to-skin comfort.",
        ),
        fiberCard("f-ly-3", "VEOCEL™ Lyocell Skin", {
          diameter: "standard, micro",
          applications: "MTTs, wipes",
          features: "translucency",
        }),
        fiberCard("f-ly-4", "VEOCEL™ Lyocell Shortcut", {
          diameter: "standard, fine",
          applications: "MTTs, wipes",
          features: "dispersibility, special cut, antistat",
        }),
        // New in 2039:961. The frame gives it a photograph and a name, nothing
        // else, so until specs or copy arrive the name stays plain text.
        fiberCard("f-ly-5", "VEOCEL™ Lyocell EC"),
      ],
    },
    {
      _uid: "f-viscose",
      component: "fiber_product_grid",
      heading: "VEOCEL™ Viscose Fibers Nonwoven Portfolio",
      intro:
        "Lenzing provides a wide range of Viscose fibers designed for the use in various applications.",
      items: [
        fiberCard("f-vi-1", "VEOCEL™ Viscose Nonwoven", {
          diameter: "standard, fine, coarse",
          applications: "wipes, AHP, industrial",
          features: "TCF, absorbency",
        }),
        fiberCard("f-vi-2", "VEOCEL™ Tampon, Viscostar", {
          diameter: "coarse",
          applications: "tampons",
          features: "TCF, trilobal, bright, high absorbency",
        }),
        fiberCard("f-vi-3", "VEOCEL™ Viscostar Core", {
          diameter: "coarse",
          applications: "AHP core",
          features: "trilobal, absorbency, liquid spread",
        }),
      ],
    },
  ],
};
/*
 * The wipes page — Figma frame 2010:900 (revision of 492:1468; same content,
 * new hero photo, and the fiber rows dropped from the end).
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
    // The 2010:900 revision ends after the application cards — no fiber rows.
    //
    // The claims grid is not in that frame. It repeats the sustainability
    // page's `claim_grid` — same ruled heading, same tinted plates — with the
    // claims this page states.
    {
      _uid: "w-claims",
      component: "claim_grid",
      heading: "claims",
      items: claimCards("w", [
        "gentle on skin",
        "skin-friendly fibers",
        "dermatologically tested",
        "high quality standards",
        "fragrance-free fibers",
        "great wet strength",
        "liquid management",
        "totally chlorine-free fibers",
      ]),
    },
  ],
};

/*
 * The hygiene page — Figma frame 2010:764 (revision of 492:1326; same content,
 * new hero photo, and the fiber rows dropped from the end).
 *
 * The same shape as wipes: intro, then four application cards. The intro and
 * the pads description are transcribed from the frame; the other three cards
 * are drawn collapsed there, so that copy is written to match and is a
 * reconstruction.
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
    // The 2010:764 revision ends after the application cards — no fiber rows.
    //
    // The claims grid is not in that frame — see the note on the wipes page.
    // Hygiene states two claims the other pages do not: "natural wearing
    // comfort", second, and "premium European-made fibers" at the end.
    {
      _uid: "hy-claims",
      component: "claim_grid",
      heading: "claims",
      items: claimCards("hy", [
        "gentle on skin",
        "natural wearing comfort",
        "skin-friendly fibers",
        "dermatologically tested",
        "high quality standards",
        "fragrance-free fibers",
        "great wet strength",
        "liquid management",
        "totally chlorine-free fibers",
        "premium European-made fibers",
      ]),
    },
  ],
};

/*
 * The beauty page — Figma "Desktop [Rev]" frame 2010:642, the revision that
 * superseded 492:1198. Like the wipes and hygiene revisions, it ends after the
 * application cards — the closing fiber write-ups have left the site.
 *
 * The fourth tab, and the page that completes the strip. This is a fiber
 * application page; it does not restore the deleted `beauty-skincare` category
 * page, which had a different shape entirely.
 *
 * Only two application cards here, not four.
 *
 * NOTE ON THE INTRO: the frame's intro paragraph is the hygiene page's text,
 * unchanged — still, in the 2010:642 revision — it argues about hygiene
 * products, baby care, feminine care and adult care on a beauty page, which
 * reads as a copy-paste the designer has not come back to. Shipping it verbatim
 * would put visibly wrong copy on the page, so the intro below is written for
 * beauty in the same shape and register. Swap it for the real text once the
 * design is finished.
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
    // The 2010:642 revision ends after the application cards — no fiber rows.
    //
    // The claims grid is not in that frame — see the note on the wipes page.
    // Beauty closes on "premium European-made fibers" where wipes closes on the
    // chlorine-free claim; the seven before it are the same.
    {
      _uid: "be-claims",
      component: "claim_grid",
      heading: "claims",
      items: claimCards("be", [
        "gentle on skin",
        "skin-friendly fibers",
        "dermatologically tested",
        "high quality standards",
        "fragrance-free fibers",
        "great wet strength",
        "liquid management",
        "premium European-made fibers",
      ]),
    },
  ],
};

/*
 * The "where to buy" page — Figma "Desktop [Rev]" frame 2010:171, which
 * superseded 492:81. Tab 6, whose label is "daily care products with VEOCEL™
 * fibers"; the page itself is the brand directory.
 *
 * The revision's directory section is literally a screen capture of the real
 * veocel.com where-to-buy page, so THE LIST BELOW IS REAL DATA, not
 * scaffolding: all 47 brands, their category memberships and their outbound
 * shop links come from that page's own data API
 * (https://www.veocel.com/1/api/where-to-buy&lang=en, read 2026-08-22). The
 * source directory shows only logos and carries no brand names, so the names
 * here are transcribed from the logos for alt text and A-Z grouping —
 * CJK/Korean marks are romanized so they group under the letter the source
 * files them under (水99% Super → "Mizu 99% Super" under m, 예지미인 →
 * "Yejimiin" under y, and so on).
 *
 * Norafin is filed under all four categories on the source site — that is why
 * `category` takes a comma-separated list. Tracking parameters (utm, fbclid,
 * srsltid, spm) are stripped from the links; the targets are unchanged.
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
        brand("dc-b-1", "Adventure Ready", "body", "https://adventurereadyoutdoor.com/products/body-wipes"),
        brand("dc-b-2", "Annie's Way", "beauty", "https://anniesway.com.tw/%E5%A4%A2%E5%B9%BB%E7%A7%98%E5%A2%83"),
        brand("dc-b-3", "Annie's Way Bubble Tea Mask", "beauty", "https://anniesway.com.tw/%E5%AE%89%E5%A6%AE%E7%B5%B2%E8%96%87%E7%8F%8D%E7%8F%A0%E5%A5%B6%E8%8C%B6%E9%9D%A2%E8%86%9C,Annie--039;s-Way-Bubble-Tea-Mask"),
        brand("dc-b-4", "BIANCO", "beauty", "https://smartstore.naver.com/bianco_/products/5505862030"),
        brand("dc-b-5", "BIO-RAL", "body", "http://www.lifecorp.jp/pb/bioral/tmp/item_detail.html?janCode=4973220239603"),
        brand("dc-b-6", "BRIDGE", "beauty", "https://www.bridge247.net/products/hydrasoothingfacialmask"),
        brand("dc-b-7", "carefree", "intimate", "https://carefreelinersandpads.com/collections/carefree-pads"),
        brand("dc-b-8", "cettua", "beauty", "https://smartstore.naver.com/cettua/products/8555095920"),
        brand("dc-b-9", "CHIARA AMBRA", "beauty", "https://www.chiara-ambra.de/en"),
        brand("dc-b-10", "COSDAN", "beauty", "https://www.cosdan.com.tw/products/centella-asiatica-snail-mucus-soothing-mask"),
        brand("dc-b-11", "coterie", "body", "https://www.coterie.com/products/wipes"),
        brand("dc-b-12", "DeepFresh", "surface", "https://www.deepfresh.com.tr/"),
        brand("dc-b-13", "DJEDNEL", "beauty", "https://djednel.jp/"),
        brand("dc-b-14", "Dr. Hsieh", "beauty", "https://www.dr-hsieh.com/collections/masksale"),
        brand("dc-b-15", "evne", "intimate", "https://kindoh.co.kr/product/list.html?cate_no=197"),
        brand("dc-b-16", "FRISS", "body", "https://www.alibaba.com/product-detail/80Pcs-Natural-Eco-Friendly-Flushable-Wet_1601377949314.html"),
        brand("dc-b-17", "Gbuuty", "beauty", "https://pse.is/66e5b4"),
        brand("dc-b-18", "GIVE A SH!T", "body", "https://www.amazon.com/Plant-Based-Full-Body-Wipes-Dogs/dp/B0CW7D6PRS"),
        brand("dc-b-19", "goop", "beauty", "https://goop.com/goop-beauty-goopgenes-lift-and-depuff-eye-masks/30-pack/p/"),
        brand("dc-b-20", "HARTMANN", "surface", "https://www.bode-chemie.com/en/products/surfaces/bacillol-zero"),
        brand("dc-b-21", "Hogara", "beauty", "https://hogara.jp/products/4580532121207"),
        brand("dc-b-22", "I'mO", "intimate", "https://imo.imweb.me/shop-pad/?idx=96in"),
        brand("dc-b-23", "IMCLEAN", "body", "https://smartstore.naver.com/allgoodlife/products/4411804776"),
        brand("dc-b-24", "kindoh", "body", "https://kindoh.co.kr/product/%ED%82%A8%EB%8F%84-%EC%95%84%EA%B8%B0-%EB%AC%BC%ED%8B%B0%EC%8A%88-%EA%B3%A8%EB%93%9C-%EC%9D%BC%EB%B0%98%ED%98%95-10%ED%8C%A9-700%EB%A7%A4/58/category/1/display/3/"),
        brand("dc-b-25", "KUDOS", "body", "https://mykudos.com/products/babywipes"),
        brand("dc-b-26", "Lab. Smart", "beauty", "https://www.dr-hsieh.com/collections/lab-smart%E9%9D%A2%E8%86%9C"),
        brand("dc-b-27", "LIL LUV DOG", "body", "https://lilluvdog.com/products/the-daily-wipe"),
        brand("dc-b-28", "Merhen Haus", "surface", "https://smartstore.naver.com/merhenhaus/products/6083463218"),
        brand("dc-b-29", "Mizu 99% Super", "body", "https://shop.akachan.jp/shop/g/g216986400/"),
        brand("dc-b-30", "Mui Mui Bear", "body", "https://pse.is/66e57b"),
        brand("dc-b-31", "mytowel", "surface", "https://mytowel.com/en/"),
        brand("dc-b-32", "neomamaism", "body", "https://neomamaism.com/products/wood-based-wipes18"),
        brand("dc-b-33", "Neroli", "beauty", "http://shop.neroliaroma.com/shopdetail/000000000655/ct140/page1/order/"),
        brand("dc-b-34", "Norafin", "surface, beauty, body, intimate", "https://www.norafin.de/produktdetails/0316099-spunlace-140gsm-100-lyocell/"),
        brand("dc-b-35", "PAEDIPROTECT", "body", "https://paediprotect.de/produkt/feuchttuecher/"),
        brand("dc-b-36", "popotine", "intimate", "https://popotine.com/en/what-is-veocel-the-cellulosic-fiber-used-in-popotine-diapers-how-is-it-manufactured/"),
        brand("dc-b-37", "QYING", "body", "https://detail.tmall.com/item.htm?id=810977038431"),
        brand("dc-b-38", "RICO Baby", "body", "https://smartstore.naver.com/ricobabywipes/products/9526286323"),
        brand("dc-b-39", "Sansho Shigyo", "surface", "https://www.sanshoshigyo.jp/product_page_02.html"),
        brand("dc-b-40", "seazons", "body", "https://detail.tmall.com/item.htm?id=860243335058"),
        brand("dc-b-41", "Sensatia Botanicals", "beauty", "https://www.sensatia.com/face/facial-mask/"),
        brand("dc-b-42", "The Beautid", "intimate", "https://thebeautid.com/product/list.html?cate_no=42"),
        brand("dc-b-43", "watsons", "beauty", "https://www.watsons.co.th/en/search?text=%E0%B8%A7%E0%B8%B1%E0%B8%95%E0%B8%AA%E0%B8%B1%E0%B8%99%2B%E0%B9%80%E0%B8%A5%E0%B8%B4%E0%B8%9F%2B%E0%B8%A1%E0%B8%B2%E0%B8%A2%2B%E0%B9%82%E0%B8%81%E0%B8%A5%E0%B8%A7%E0%B9%8C&useDefaultSearch=false&brandRedirect=true"),
        brand("dc-b-44", "Welkeeps", "body", "https://www.skstoa.com/display/goods/29858254"),
        brand("dc-b-45", "wellros", "body", "https://www.amway.co.kr/shop/one-for-one/baby/wellros/p/300180K"),
        brand("dc-b-46", "Yejimiin", "intimate", "https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000121067"),
        brand("dc-b-47", "29 Days", "intimate", "https://29days.co.kr/category/%EB%8B%A8%ED%92%88/120/"),
      ],
    },
  ],
};

/*
 * The sustainability page — Figma "Desktop [Rev]" frame 2010:279. Tab 5, so
 * only the partner page now renders its tab as a dead link.
 *
 * EVERY CERTIFICATE BELOW IS A COMPLIANCE CLAIM transcribed from artwork, not
 * from the issuing bodies — names, numbers and scopes need verification before
 * launch (see HANDOFF.md). Three deliberate deviations from the frame:
 *
 * - The frame draws a row of languages (english 简体中文 繁體中文 한국어 日本語)
 *   between the intro and the claims, with nothing linked. The site's language
 *   picker lives in the header and the space has no such locales, so the strip
 *   is not built — raise with whoever owns the Figma.
 * - The frame's ISEGA No. 68954 caption reads "LENZING™ Lycocell fibers"; no
 *   such fiber exists, so "Lyocell" is written here instead of the typo.
 * - The captions "OK biodegradable INDUSTRIAL" and "HOME" are transcribed
 *   verbatim, but the artwork under both is TÜV's OK *compost* mark (matching
 *   the claim copy, which says compostable under those conditions). One of the
 *   two — caption or artwork — is wrong; flagged rather than resolved.
 */
const sustainability: PageBlok = {
  _uid: "mock-sustainability",
  component: "page",
  seo_title: "sustainability | VEOCEL™",
  seo_description:
    "How VEOCEL™ fibers back their environmental claims — wood-based, responsibly produced, biodegradable — and the product certificates behind them.",
  body: [
    {
      _uid: "su-hero",
      component: "hero",
      headline: "sustainability",
      headline_size: "title",
      nav_cards: heroTabs("su"),
    },
    {
      _uid: "su-intro",
      component: "text_columns",
      align: "split",
      heading: "we take regulations and green claims seriously",
      body:
        "Adhering to regulations is key in the fast-changing and complex environment " +
        "for claims. That’s why we have a process in place, factoring in " +
        "rapidly-evolving regulatory requirements when developing and updating the " +
        "claims. With our QR-coded claims and updated webpage, we provide more " +
        "clarity on what our fibers offer to conscious consumers.",
    },
    {
      _uid: "su-claims",
      component: "claim_grid",
      heading: "environmental responsibility claims",
      items: CLAIMS,
    },
    {
      _uid: "su-certificates",
      component: "certification_grid",
      heading: "product certificates",
      align: "left",
      items: [
        {
          _uid: "su-cert-1",
          component: "certification_item",
          label: "FSC (Chain of Custody)",
        },
        {
          _uid: "su-cert-2",
          component: "certification_item",
          label: "PEFC (Chain of Custody)",
        },
        {
          _uid: "su-cert-3",
          component: "certification_item",
          label: "The EU Ecolabel (Chain of Custody)",
        },
        {
          _uid: "su-cert-4",
          component: "certification_item",
          label: "USDA Certified Biobased Product",
        },
        {
          _uid: "su-cert-5",
          component: "certification_item",
          label: "OK biodegradable SOIL",
        },
        {
          _uid: "su-cert-6",
          component: "certification_item",
          label: "OK biodegradable WATER",
        },
        {
          _uid: "su-cert-7",
          component: "certification_item",
          label: "OK biodegradable MARINE",
        },
        {
          _uid: "su-cert-8",
          component: "certification_item",
          label: "OK biodegradable INDUSTRIAL",
        },
        {
          _uid: "su-cert-9",
          component: "certification_item",
          label: "OK biodegradable HOME",
        },
        {
          _uid: "su-cert-10",
          component: "certification_item",
          label: "ISEGA (No. 68954)",
          note: "(Applying to LENZING™ Lyocell fibers)",
        },
        {
          _uid: "su-cert-11",
          component: "certification_item",
          label: "ISEGA (No. 59063)",
          note: "(Applying to LENZING™ Viscose fibers)",
        },
        {
          _uid: "su-cert-12",
          component: "certification_item",
          label: "STANDARD 100 by OEKO-TEX",
          note: "(Annex 6, product class 1)",
        },
        {
          _uid: "su-cert-13",
          component: "certification_item",
          label: "Medically Tested - Tested for Toxins",
        },
      ],
    },
  ],
};

/*
 * The partner page — Figma frame 2039:549 on the "Desktop Dev" page, the
 * later of that page's two partner frames. (2039:435 keeps the 2010:56
 * layout, whose second panel was the "explore our product knowledge"
 * brochure download; 2039:549 replaces that panel with the three licensing
 * steps, and is the one built.) Tab 7, the last page of the strip.
 *
 * A white CTA panel on the tinted band, then three photo-led step cards on
 * the same band. The LENZING Pro target is real, taken from the live
 * veocel.com site's "VEOCEL™ for partners" nav on 2026-08-22. The brochure
 * link the dropped panel carried — the VEOCEL™ General Brochure PDF from that
 * site's downloads page — is in git history should the panel come back. The
 * step copy is transcribed as drawn, "then prepare" and "benefit, claims"
 * included.
 */
const partners: PageBlok = {
  _uid: "mock-partners",
  component: "page",
  seo_title: "how to become a VEOCEL™ partner",
  seo_description:
    "Become a VEOCEL™ partner — explore the LENZING Pro portal, fill out the online forms, send a sample for testing and receive your brand license.",
  body: [
    {
      _uid: "pt-hero",
      component: "hero",
      headline: "how to become a VEOCEL™ partner",
      headline_size: "title",
      nav_cards: heroTabs("pt"),
    },
    {
      _uid: "pt-lenzing-pro",
      component: "cta_panel",
      heading: "Lenzing Pro",
      body:
        "interested in becoming a VEOCEL™ partner? Explore Lenzing Pro to discover " +
        "our fiber solutions, learn more about partnership opportunities, and access " +
        "helpful resources designed to support your business journey with VEOCEL™.",
      link_label: "explore LENZING Pro",
      link: {
        url: "https://lenzingpro.com/en/portal/login?companySelectionRoute=en%2Fportal%2FcompanySelection",
        linktype: "url",
      },
    },
    {
      _uid: "pt-steps",
      component: "process_row",
      layout: "cards",
      steps: [
        {
          _uid: "pt-step-1",
          component: "process_step",
          title: "fill out the online forms",
          description:
            "Lenzing Partners from Nonwoven Industry planning to use VEOCEL™ can start right away.",
        },
        {
          _uid: "pt-step-2",
          component: "process_step",
          title: "send us a physical sample for testing and verifications",
          description:
            "Lenzing reviews your license application and a sample needs to be provided for testing.",
        },
        {
          _uid: "pt-step-3",
          component: "process_step",
          title: "receive your license confirmation letter",
          description:
            "After successful review by Lenzing, you will receive a VEOCEL™ brand license. " +
            "then prepare your product launch using our brand logos, benefit, claims with " +
            "the support of our Licensing team.",
        },
      ],
    },
  ],
};

/*
 * #ItsInOurHands — the social responsibility platform the band above the footer
 * links to. The hub (frame 2081:242) is the start page of an `itsinourhands`
 * folder and lists the articles in it; frame 2081:310 draws the one article
 * that has copy.
 *
 * The hub frame names four more articles. They exist so the hub renders as
 * drawn, but their bodies are still to be written. The "lorem ipsum" tag and the
 * one date all five share, 08/09/2026, are the frame's placeholders, transcribed
 * as drawn. Photographs live in Storyblok only, like the rest.
 */
const ITSINOURHANDS = "itsinourhands";

const itsInOurHands: PageBlok = {
  _uid: "iioh-page",
  component: "page",
  seo_description:
    "Articles from #ItsInOurHands, the VEOCEL™ social responsibility platform, on plastic pollution and what each of us can do about it.",
  body: [
    {
      _uid: "iioh-hub",
      component: "article_hub",
      heading: "#ItsInOurHands",
      folder: ITSINOURHANDS,
    },
  ],
};

function article(slug: string, title: string, fields: Partial<ArticleBlok> = {}): SbStory<ArticleBlok> {
  return story(`${ITSINOURHANDS}/${slug}`, title, {
    _uid: `iioh-${slug}`,
    component: "article",
    title,
    category: "lorem ipsum",
    date: "2026-09-08 00:00",
    ...fields,
  });
}

/**
 * In the hub frame's order. They share a date, so the live hub orders them by
 * when each was first published, latest first; the mock, having no publish
 * times, keeps this order. The first two are highlighted — the frame's banner
 * article and its first row — so they slide in the banner.
 */
const articles: SbStory<ArticleBlok>[] = [
  article(
    "how-to-play-an-important-role-in-reducing-plastic-pollution",
    "how to play an important role in reducing plastic pollution",
    {
      highlight: true,
      seo_description:
        "Where the ocean's microplastics come from, and the everyday steps that help keep them out of the environment.",
      body: [
        {
          _uid: "iioh-plastic-1",
          component: "article_text",
          style: "body",
          body:
            "Globally, the use of plastics has shot up from around 5 million metric tons in the 1950s to more than 330 million metric tons in 2020. According to the World Bank, plastics comprise about 5–12% of the world’s total waste generation (20–30% by weight). There has been an alarming rise in the use of plastics despite the fact they can take hundreds or thousands of years to decompose and wreak havoc on the environment.\n\n" +
            "On top of all this, one of the biggest challenges we face from plastic pollution is the rise in microplastics. A report by the Ellen MacArthur Foundation predicts that there will be an equal amount of microplastics in the oceans compared to fish by 2050.\n\n" +
            "We have all heard of microplastics, but what exactly are they and how can we help to reduce plastic pollution?\n\n" +
            "Microplastics come from a variety of sources, including from larger plastic debris that degrades into smaller and smaller pieces. In addition, microbeads, a type of microplastic, are very tiny pieces of manufactured polyethylene plastic that are added as exfoliants to health and beauty products.",
        },
        {
          // The frame draws the second address with a space ("deep dive") and
          // links it nowhere; the hyphenated page is the foundation's own.
          _uid: "iioh-plastic-2",
          component: "article_text",
          style: "note",
          body:
            "<https://datatopics.worldbank.org/what-a-waste/trends_in_solid_waste_management.html>\n\n" +
            "<https://www.ellenmacarthurfoundation.org/plastics-and-the-circular-economy-deep-dive#:~:text=A%20staggering%208%20million%20tonnes,we%20design%2C%20use%2C%20and%20reuse>",
        },
        {
          _uid: "iioh-plastic-3",
          component: "article_image",
          width: "inset",
          caption:
            "Source: <https://www.statista.com/chart/17957/where-the-oceans-microplastics-come-from/>",
        },
        {
          _uid: "iioh-plastic-4",
          component: "article_text",
          style: "lead",
          body: "how can you help? we can do our part to reduce microplastic pollution in our daily lives by following the steps outlined in the infographic.",
        },
        {
          _uid: "iioh-plastic-5",
          component: "article_image",
          width: "full",
        },
        {
          _uid: "iioh-plastic-6",
          component: "article_text",
          style: "body",
          body: "These simple steps can help to cut down on microplastics and keep them from entering the environment. #ItIsInOurHands to live a more sustainable life and bring about positive changes when it comes to plastics and protect the Earth. This can start today by raising awareness around how to reduce plastic pollution by sharing the infographic with friends and family.",
        },
      ],
    },
  ),
  article(
    "take-the-test-how-much-do-you-know-about-plastic-pollution-in-the-oceans",
    "take the test: How much do you know about plastic pollution in the oceans?",
    { highlight: true },
  ),
  article(
    "plastic-will-outweigh-all-fish-in-the-sea-by-2050",
    "plastic will outweigh all fish in the sea by 2050 - is ‘plastic soup’ already on the menu?",
  ),
  // The frame's German placeholder ("gemeinsam für den Wandel: die UN ruft zur
  // weltweiten bekämpfung der ..."), put into English as dummy copy.
  article(
    "together-for-change",
    "together for change: the UN calls for a worldwide fight against plastic pollution",
  ),
  article(
    "choose-plant-based-fibers-to-prevent-plastic-toxicity-in-our-food-chain",
    "choose plant-based fibers to prevent plastic toxicity in our food chain",
  ),
];

export const mockStories: Record<string, SbStory<StoryContent>> = {
  home: story("home", "Home", home),
  "fiber-types": story("fiber-types", "VEOCEL™ fibers", fiberTypes),
  wipes: story("wipes", "VEOCEL™ fibers for wipes", wipes),
  hygiene: story("hygiene", "VEOCEL™ fibers for hygiene", hygiene),
  beauty: story("beauty", "VEOCEL™ fibers for beauty", beauty),
  "daily-care": story("daily-care", "where to buy", dailyCare),
  sustainability: story("sustainability", "sustainability", sustainability),
  partners: story("partners", "how to become a VEOCEL™ partner", partners),
  [ITSINOURHANDS]: story(ITSINOURHANDS, "#ItsInOurHands", itsInOurHands, { startpage: true }),
  ...Object.fromEntries(articles.map((entry) => [entry.full_slug, entry])),
};
