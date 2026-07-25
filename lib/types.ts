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
  | BrandStripBlok;
