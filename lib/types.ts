/**
 * Storyblok content model for the VEOCEL site.
 *
 * Every nestable block below has a matching schema file in `storyblok/schemas/`
 * and a matching React component registered in `components/storyblok/registry.ts`.
 * Keep the three in sync: field name here === field name in the schema === prop read
 * by the component.
 */

export type StoryblokAsset = {
  id?: number | null;
  filename: string;
  alt?: string | null;
  title?: string | null;
  focus?: string | null;
};

export type StoryblokLink = {
  id?: string;
  url?: string;
  cached_url?: string;
  linktype?: "story" | "url" | "email" | "asset";
  target?: "_blank" | "_self" | "";
  anchor?: string;
};

export type SbBlock = {
  _uid: string;
  component: string;
  /** Present only in draft mode; drives the Visual Editor click-to-edit outline. */
  _editable?: string;
};

export type SbStory<T = PageBlok> = {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  full_slug: string;
  content: T;
  published_at?: string | null;
  first_published_at?: string | null;
  /** A folder's start page. Its `full_slug` is the folder's, with a trailing "/". */
  is_startpage?: boolean;
};

/* ------------------------------------------------------------------ *
 * Content types
 * ------------------------------------------------------------------ */

export type PageBlok = SbBlock & {
  component: "page";
  body?: BodyBlok[];
  seo_title?: string;
  seo_description?: string;
};

/**
 * What can appear in a page body: any block we have a type for, or a bare
 * `SbBlock` for components added in Storyblok but not yet implemented here
 * (`BlockRenderer` reports those rather than crashing).
 *
 * Because the known blocks are a union discriminated on `component`, TypeScript
 * still catches misspelled field names on any block it recognises.
 */
export type BodyBlok = AnyBlok | SbBlock;

export type ConfigBlok = SbBlock & {
  component: "config";
  main_nav?: NavItemBlok[];
  utility_nav?: NavItemBlok[];
  newsletter_heading?: string;
  newsletter_placeholder?: string;
  /**
   * Where the signup form posts — the provider's own form endpoint (Mailchimp,
   * HubSpot, …). Without it the field renders disabled rather than pretending to
   * submit; there is no in-app subscriber storage.
   */
  newsletter_action_url?: string;
  social_heading?: string;
  socials?: SocialLinkBlok[];
  /**
   * Third panel of the band above the footer: the social-responsibility
   * platform. The panel only renders when `responsibility_label` is set.
   */
  responsibility_heading?: string;
  responsibility_label?: string;
  responsibility_link?: StoryblokLink;
  footer_tagline?: string;
  footer_columns?: FooterColumnBlok[];
  /** Shown on the footer search field. The form posts to the /search page. */
  search_placeholder?: string;
  /** Parent-company mark (Lenzing) in the footer. Omitted when unset. */
  parent_logo?: StoryblokAsset;
  parent_logo_link?: StoryblokLink;
  /** Second mark next to the footer lockup (#ItsInOurHands). Omitted when unset. */
  secondary_logo?: StoryblokAsset;
  secondary_logo_link?: StoryblokLink;
  copyright?: string;
  legal_links?: NavItemBlok[];
};

export type NavItemBlok = SbBlock & {
  component: "nav_item";
  label: string;
  link?: StoryblokLink;
  children?: NavItemBlok[];
};

export type FooterColumnBlok = SbBlock & {
  component: "footer_column";
  title?: string;
  links?: NavItemBlok[];
};

export type SocialLinkBlok = SbBlock & {
  component: "social_link";
  platform: "linkedin" | "instagram" | "youtube" | "facebook" | "x";
  link?: StoryblokLink;
};

/* ------------------------------------------------------------------ *
 * Home page blocks
 * ------------------------------------------------------------------ */

export type HeroBlok = SbBlock & {
  component: "hero";
  eyebrow?: string;
  headline: string;
  /**
   * A word or phrase inside `headline` to set in a pale blue plate — the fibers
   * page boxes "fibers" that way. Ignored when it isn't found in the headline.
   */
  headline_highlight?: string;
  subline?: string;
  background_image?: StoryblokAsset;
  scroll_hint?: string;
  /**
   * `display` is the home page's word-as-poster type. `title` is the smaller
   * setting a section landing page wants, where the headline is a name rather
   * than a statement.
   */
  headline_size?: "display" | "title";
  /**
   * `left` starts the type at the column edge, clearing room for imagery on the
   * right — the home revision's arrangement. Default is centred.
   */
  align?: "center" | "left";
  /** Numbered shortcut cards pinned along the bottom edge of the hero. */
  nav_cards?: HeroNavCardBlok[];
  /**
   * What the phone-width dropdown says when no card matches the page — the
   * home page, mostly. Falls back to "select destination".
   */
  nav_placeholder?: string;
};

export type HeroNavCardBlok = SbBlock & {
  component: "hero_nav_card";
  label: string;
  link?: StoryblokLink;
};

export type IntroSectionBlok = SbBlock & {
  component: "intro_section";
  heading?: string;
  body?: string;
  align?: "left" | "center" | "right";
  /** `split` puts the body in a narrow column beside the heading. */
  layout?: "split" | "stacked";
};

export type CategoryCardBlok = SbBlock & {
  component: "category_card";
  kicker?: string;
  title: string;
  image?: StoryblokAsset;
  link?: StoryblokLink;
};

export type CategoryGridBlok = SbBlock & {
  component: "category_grid";
  items?: CategoryCardBlok[];
  columns?: "2" | "3" | "4";
};

export type ProcessStepBlok = SbBlock & {
  component: "process_step";
  title: string;
  description?: string;
  image?: StoryblokAsset;
};

export type ProcessRowBlok = SbBlock & {
  component: "process_row";
  heading?: string;
  align?: "left" | "center" | "right";
  steps?: ProcessStepBlok[];
  /**
   * `ring` arranges the steps evenly around a circle with the copy beside them —
   * the natural-circularity diagram. `row` is a single horizontal strip.
   * `cards` sets each step on a white, photo-led card, three up on the tinted
   * band — the partner page's licensing steps.
   */
  layout?: "row" | "ring" | "cards";
  /**
   * The segmented-wheel artwork of the ring layout: one circular image whose
   * wedges carry the photography, with the step titles drawn over it as live
   * text. When empty the ring falls back to a circle of per-step images.
   */
  diagram_image?: StoryblokAsset;
  /** Supporting copy, shown next to the ring. Blank lines start a new paragraph. */
  body?: string;
  link_label?: string;
  link?: StoryblokLink;
};

export type ImageBannerBlok = SbBlock & {
  component: "image_banner";
  image?: StoryblokAsset;
  title?: string;
  subtitle?: string;
  link_label?: string;
  link?: StoryblokLink;
  height?: "medium" | "tall";
};

export type ExploreTabBlok = SbBlock & {
  component: "explore_tab";
  title: string;
  description?: string;
  image?: StoryblokAsset;
  link?: StoryblokLink;
};

export type ExploreTabsBlok = SbBlock & {
  component: "explore_tabs";
  heading?: string;
  tabs?: ExploreTabBlok[];
};

export type NewsItemBlok = SbBlock & {
  component: "news_item";
  category?: string;
  /** ISO date, `YYYY-MM-DD`. Formatted for display, never printed raw. */
  date?: string;
  title: string;
  image?: StoryblokAsset;
  link?: StoryblokLink;
};

export type NewsListBlok = SbBlock & {
  component: "news_list";
  heading?: string;
  intro?: string;
  items?: NewsItemBlok[];
};

/* ------------------------------------------------------------------ *
 * Category page blocks
 * ------------------------------------------------------------------ */

export type PageHeroBlok = SbBlock & {
  component: "page_hero";
  title: string;
  subtitle?: string;
  image?: StoryblokAsset;
  /** `dark` = white type over a scrim; `light` = brand-blue type on a tint. */
  theme?: "dark" | "light";
};

export type TextColumnsBlok = SbBlock & {
  component: "text_columns";
  heading?: string;
  body?: string;
  /** `center` stacks a centred heading above a right-aligned body column. */
  align?: "split" | "center";
};

export type ProductCardBlok = SbBlock & {
  component: "product_card";
  title: string;
  image?: StoryblokAsset;
  link?: StoryblokLink;
};

export type ProductGridBlok = SbBlock & {
  component: "product_grid";
  heading?: string;
  intro?: string;
  items?: ProductCardBlok[];
};

export type FeatureSplitBlok = SbBlock & {
  component: "feature_split";
  image?: StoryblokAsset;
  /**
   * Optional second image, revealed under a magnifying lens on hover — used for a
   * before/after, e.g. the sheet mask turning translucent when wet.
   *
   * The lens appears only when both this and `image` are set; otherwise the block
   * renders as a plain image.
   */
  image_reveal?: StoryblokAsset;
  icon?: StoryblokAsset;
  heading?: string;
  body?: string;
  media_position?: "left" | "right";
};

export type AccordionItemBlok = SbBlock & {
  component: "accordion_item";
  title: string;
  /** Blank lines start a new paragraph. */
  body?: string;
  /** Small mark, used by the `tiles` layout. */
  icon?: StoryblokAsset;
  /** Photograph, used by the `cards` layout. Ignored by the other two. */
  image?: StoryblokAsset;
};

export type FeatureAccordionBlok = SbBlock & {
  component: "feature_accordion";
  heading?: string;
  items?: AccordionItemBlok[];
  /**
   * One open at a time in every arrangement; only the presentation differs.
   *
   *   tiles — compact three-up tiles led by an icon
   *   cards — two-up cards led by a photograph, for product applications
   *   rows  — full-width rows under a large heading, for long-form copy
   */
  layout?: "tiles" | "cards" | "rows";
};

export type BrandStripBlok = SbBlock & {
  component: "brand_strip";
  heading?: string;
  logos?: StoryblokAsset[];
  link_label?: string;
  link?: StoryblokLink;
};

/* ------------------------------------------------------------------ *
 * Fiber types page blocks
 * ------------------------------------------------------------------ */

export type FiberTypeCardBlok = SbBlock & {
  component: "fiber_type_card";
  title: string;
  /** Second line under the title — the fiber's variant name, set smaller. */
  subtitle?: string;
  image?: StoryblokAsset;
  /** Button text. Falls back to "explore". */
  link_label?: string;
  link?: StoryblokLink;
};

export type FiberTypeGridBlok = SbBlock & {
  component: "fiber_type_grid";
  heading?: string;
  intro?: string;
  items?: FiberTypeCardBlok[];
};

export type FiberProductCardBlok = SbBlock & {
  component: "fiber_product_card";
  name: string;
  /**
   * Where the name leads instead of opening the pop-up — the fiber's detail
   * page, once one exists. Empty, the name opens the pop-up (when the card has
   * anything to show in it).
   */
  link?: StoryblokLink;
  image?: StoryblokAsset;
  /** Portrait photograph for the pop-up's left half. Falls back to `image`. */
  detail_image?: StoryblokAsset;
  /** Shown in the pop-up above the spec rows. Blank lines start a new paragraph. */
  description?: string;
  diameter?: string;
  /** The applications the fiber serves — the middle spec row. */
  applications?: string;
  features?: string;
};

export type FiberProductGridBlok = SbBlock & {
  component: "fiber_product_grid";
  heading?: string;
  intro?: string;
  /** Labels of the three spec rows in every card's pop-up, shared by the grid. */
  diameter_label?: string;
  applications_label?: string;
  features_label?: string;
  items?: FiberProductCardBlok[];
};

export type CertificationItemBlok = SbBlock & {
  component: "certification_item";
  logo?: StoryblokAsset;
  /** Shown in a pop-up when the mark is clicked — the certificate itself, say. */
  detail_image?: StoryblokAsset;
  label?: string;
  /** Qualifier under the label — scope, certificate number, product class. */
  note?: string;
  link?: StoryblokLink;
};

export type CertificationGridBlok = SbBlock & {
  component: "certification_grid";
  heading?: string;
  intro?: string;
  /**
   * `center` is the original wall with its centred heading; `left` ranges the
   * heading with the rest of the page, as the sustainability frame draws it.
   */
  align?: "center" | "left";
  items?: CertificationItemBlok[];
};

export type ClaimCardBlok = SbBlock & {
  component: "claim_card";
  /** Line-drawn mark above the title. Decorative — the title carries the meaning. */
  icon?: StoryblokAsset;
  title: string;
  /** Blank lines start a new paragraph; footnote paragraphs begin with "*". */
  body?: string;
  /** Caption over the proof list — its own field so it can be translated. */
  proof_label?: string;
  /** One certification or document per line. */
  proof?: string;
};

export type ClaimGridBlok = SbBlock & {
  component: "claim_grid";
  heading?: string;
  items?: ClaimCardBlok[];
};

export type CtaPanelBlok = SbBlock & {
  component: "cta_panel";
  heading?: string;
  /** Blank lines start a new paragraph. */
  body?: string;
  /** The button only renders when a label is set. */
  link_label?: string;
  link?: StoryblokLink;
};

export type ProcessDiagramBlok = SbBlock & {
  component: "process_diagram";
  heading?: string;
  /**
   * The diagram itself, as artwork. Its own alt text is what screen readers get,
   * so it must be set in Storyblok — `caption` is shown to everyone and is not a
   * substitute.
   */
  image?: StoryblokAsset;
  caption?: string;
};

export type PortfolioColumnBlok = SbBlock & {
  component: "portfolio_column";
  title: string;
  subtitle?: string;
  image?: StoryblokAsset;
  /**
   * One line per row, in the same order as the table's `row_labels`. Blank lines
   * count, so an empty cell is an empty line.
   */
  values?: string;
};

export type FiberPortfolioBlok = SbBlock & {
  component: "fiber_portfolio";
  heading?: string;
  intro?: string;
  /** One row label per line. Each column supplies its values in this order. */
  row_labels?: string;
  columns?: PortfolioColumnBlok[];
};

/* ------------------------------------------------------------------ *
 * Where to buy
 * ------------------------------------------------------------------ */

export type BrandCategoryBlok = SbBlock & {
  component: "brand_category";
  /** Shown under the icon, and matched against each brand's `category`. */
  label: string;
  icon?: StoryblokAsset;
};

export type BrandItemBlok = SbBlock & {
  component: "brand_item";
  /** Drives both the alphabet grouping and the logo's alt text. */
  name: string;
  logo?: StoryblokAsset;
  /**
   * One or more category `label`s, comma-separated — a brand can sit in
   * several. Blank shows under "all" only.
   */
  category?: string;
  link?: StoryblokLink;
};

export type BrandDirectoryBlok = SbBlock & {
  component: "brand_directory";
  heading?: string;
  intro?: string;
  categories?: BrandCategoryBlok[];
  brands?: BrandItemBlok[];
};

/* ------------------------------------------------------------------ *
 * #ItsInOurHands
 * ------------------------------------------------------------------ */

/**
 * One #ItsInOurHands article. A content type of its own rather than a `page`,
 * because the hub lists articles by their fields — date, category, photograph —
 * and a page body has nothing to list by. Articles live in the `itsinourhands`
 * folder.
 */
export type ArticleBlok = SbBlock & {
  component: "article";
  title: string;
  /** The tag, shown as a pill on the hub: beside the date in the banner, above the title in the list. */
  category?: string;
  /** Storyblok datetime, `YYYY-MM-DD HH:mm`. Only the date is shown. Orders the hub, latest first. */
  date?: string;
  /** Opens the article, and stands for it on the hub. */
  image?: StoryblokAsset;
  /**
   * Unused since 2026-09-18. It moved an article into the hub's banner slider
   * whatever its date; the hub now runs strictly by date, latest on top, and
   * the slider holds the two latest articles. Kept so stories that set it
   * still validate.
   */
  highlight?: boolean;
  body?: (ArticleTextBlok | ArticleImageBlok)[];
  seo_title?: string;
  seo_description?: string;
};

export type ArticleTextBlok = SbBlock & {
  component: "article_text";
  /** Markdown. Blank lines start a new paragraph. */
  body?: string;
  /**
   *   body — the running copy
   *   lead — a bold statement introducing what follows
   *   note — small print: sources and references
   */
  style?: "body" | "lead" | "note";
};

export type ArticleImageBlok = SbBlock & {
  component: "article_image";
  image?: StoryblokAsset;
  /** Markdown, centred under the image — usually a source line. */
  caption?: string;
  /** `inset` centres the image at a narrower measure; `full` spans the column. */
  width?: "full" | "inset";
};

/** Lists a folder's articles: the newest as a banner, the rest as rows. */
export type ArticleHubBlok = SbBlock & {
  component: "article_hub";
  /** The page heading, centred on the banner. Defaults to `#ItsInOurHands`. */
  heading?: string;
  /** Takes the banner off; the heading is then for screen readers only. */
  hide_banner?: boolean;
  /**
   * Starts the header solid white, with the banner below it rather than behind
   * it. Nothing to do while the banner is hidden — the header is white then.
   */
  white_header?: boolean;
  /** The banner's photograph, under the header. */
  banner_image?: StoryblokAsset;
  /** Slug of the folder whose articles are listed. Defaults to `itsinourhands`. */
  folder?: string;
};

/** Every content type a story can have that renders as a page of its own. */
export type StoryContent = PageBlok | ArticleBlok;

/** Every block that can sit directly in a page body. Keep in step with the registry. */
export type AnyBlok =
  | HeroBlok
  | IntroSectionBlok
  | CategoryGridBlok
  | ProcessRowBlok
  | ImageBannerBlok
  | ExploreTabsBlok
  | NewsListBlok
  | PageHeroBlok
  | TextColumnsBlok
  | ProductGridBlok
  | FeatureSplitBlok
  | FeatureAccordionBlok
  | BrandStripBlok
  | FiberTypeGridBlok
  | FiberProductGridBlok
  | CertificationGridBlok
  | ClaimGridBlok
  | CtaPanelBlok
  | ProcessDiagramBlok
  | FiberPortfolioBlok
  | BrandDirectoryBlok
  | ArticleHubBlok;
