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
  footer_tagline?: string;
  footer_columns?: FooterColumnBlok[];
  /** Shown on the footer search field. The form posts to the /search page. */
  search_placeholder?: string;
  /** Parent-company mark (Lenzing) in the footer. Omitted when unset. */
  parent_logo?: StoryblokAsset;
  parent_logo_link?: StoryblokLink;
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
  subline?: string;
  background_image?: StoryblokAsset;
  scroll_hint?: string;
  /**
   * `display` is the home page's word-as-poster type. `title` is the smaller
   * setting a section landing page wants, where the headline is a name rather
   * than a statement.
   */
  headline_size?: "display" | "title";
  /** Numbered shortcut cards pinned along the bottom edge of the hero. */
  nav_cards?: HeroNavCardBlok[];
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
   */
  layout?: "row" | "ring";
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
 * Category (beauty + skincare) page blocks
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
  body?: string;
  icon?: StoryblokAsset;
};

export type FeatureAccordionBlok = SbBlock & {
  component: "feature_accordion";
  heading?: string;
  items?: AccordionItemBlok[];
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

export type CertificationItemBlok = SbBlock & {
  component: "certification_item";
  logo?: StoryblokAsset;
  label?: string;
  /** Qualifier under the label — scope, certificate number, product class. */
  note?: string;
  link?: StoryblokLink;
};

export type CertificationGridBlok = SbBlock & {
  component: "certification_grid";
  heading?: string;
  intro?: string;
  items?: CertificationItemBlok[];
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
  | CertificationGridBlok
  | ProcessDiagramBlok
  | FiberPortfolioBlok;
