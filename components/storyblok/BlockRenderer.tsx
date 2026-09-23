import type { ComponentType } from "react";

import { DEFAULT_LOCALE } from "@/lib/i18n";
import type { SbBlock } from "@/lib/types";

import { ArticleHub } from "./ArticleHub";
import { BrandDirectory } from "./BrandDirectory";
import { BrandStrip } from "./BrandStrip";
import { CategoryGrid } from "./CategoryGrid";
import { CertificationGrid } from "./CertificationGrid";
import { ClaimGrid } from "./ClaimGrid";
import { CtaPanel } from "./CtaPanel";
import { ExploreTabs } from "./ExploreTabs";
import { FeatureAccordion } from "./FeatureAccordion";
import { FeatureSplit } from "./FeatureSplit";
import { FiberPortfolio } from "./FiberPortfolio";
import { FiberProductGrid } from "./FiberProductGrid";
import { FiberTypeGrid } from "./FiberTypeGrid";
import { Hero } from "./Hero";
import { ImageBanner } from "./ImageBanner";
import { IntroSection } from "./IntroSection";
import { NewsList } from "./NewsList";
import { PageHero } from "./PageHero";
import { ProcessDiagram } from "./ProcessDiagram";
import { ProcessRow } from "./ProcessRow";
import { ProductGrid } from "./ProductGrid";
import { TextColumns } from "./TextColumns";

/**
 * Maps Storyblok component technical names to React components.
 *
 * These keys are a contract with three other places — keep them in sync:
 *   - the `component` literal on each blok type in `lib/types.ts`
 *   - the `name` of each entry in `storyblok/components.json`
 *   - the component created in the Storyblok space
 */

/**
 * What every block is rendered with. Most read only `blok`; `locale` is there
 * for the few that fetch content of their own — the article hub — since
 * Storyblok links are stored without a language and a server component cannot
 * read it off the URL the way `SmartLink` does.
 */
type BlockProps = { blok: SbBlock; locale: string };

/**
 * Narrows a block component to the registry's uniform signature.
 *
 * Needed because `ComponentType` props are contravariant: a component that
 * requires `HeroBlok` is not directly assignable to one accepting any `SbBlock`.
 * The renderer guarantees the match by looking components up by `component` name.
 */
function block<T extends SbBlock>(component: ComponentType<{ blok: T; locale: string }>) {
  return component as ComponentType<BlockProps>;
}

const registry: Record<string, ComponentType<BlockProps>> = {
  // Home
  hero: block(Hero),
  intro_section: block(IntroSection),
  category_grid: block(CategoryGrid),
  process_row: block(ProcessRow),
  image_banner: block(ImageBanner),
  explore_tabs: block(ExploreTabs),
  news_list: block(NewsList),

  // Category pages
  page_hero: block(PageHero),
  text_columns: block(TextColumns),
  product_grid: block(ProductGrid),
  feature_split: block(FeatureSplit),
  feature_accordion: block(FeatureAccordion),
  brand_strip: block(BrandStrip),

  // Fiber types
  fiber_product_grid: block(FiberProductGrid),
  fiber_type_grid: block(FiberTypeGrid),
  certification_grid: block(CertificationGrid),
  process_diagram: block(ProcessDiagram),
  fiber_portfolio: block(FiberPortfolio),

  // Where to buy
  brand_directory: block(BrandDirectory),

  // Sustainability
  claim_grid: block(ClaimGrid),

  // Partner
  cta_panel: block(CtaPanel),

  // #ItsInOurHands
  article_hub: block(ArticleHub),
};

/** Blocks that open a page and clear the fixed header themselves. */
const OPENERS = new Set(["hero", "page_hero", "article_hub"]);

/** Renders a story's `body` field in order. */
export function BlockRenderer({
  blocks,
  locale = DEFAULT_LOCALE,
}: {
  blocks?: SbBlock[];
  locale?: string;
}) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <>
      {/*
        The header is fixed, so a page that opens on copy rather than a hero —
        the claims & certifications page — starts below the bar at rest.
      */}
      {OPENERS.has(blocks[0].component) ? null : (
        <div aria-hidden className="h-[83px] md:h-auto md:pt-header-bar" />
      )}
      {blocks.map((blok) => {
        const Component = registry[blok.component];
        if (!Component) return <UnknownBlock key={blok._uid} component={blok.component} />;
        return <Component key={blok._uid} blok={blok} locale={locale} />;
      })}
    </>
  );
}

/**
 * A block exists in Storyblok but has no React component yet.
 *
 * Loud in development so it gets fixed; silent in production so a new content
 * type can't put a visible error on a live page.
 */
function UnknownBlock({ component }: { component: string }) {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="mx-auto my-4 max-w-[1200px] rounded-card border border-dashed border-brand-400 bg-brand-50 px-6 py-4 text-sm text-brand-800">
      No component registered for Storyblok block{" "}
      <code className="font-mono font-semibold">{component}</code>. Add it to the registry in{" "}
      <code className="font-mono">components/storyblok/BlockRenderer.tsx</code>.
    </div>
  );
}
