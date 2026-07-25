import Link from "next/link";
import type { ReactNode } from "react";

import type { StoryblokLink } from "@/lib/types";

/**
 * Turns a Storyblok link field into an href.
 *
 * Storyblok stores internal links as `cached_url` ("beauty-skincare"), external
 * ones as `url`. Returns `null` when the field is empty so callers can render
 * something non-interactive instead of an `<a href="">`.
 */
export function resolveHref(link?: StoryblokLink): string | null {
  if (!link) return null;

  if (link.linktype === "email") {
    return link.url ? `mailto:${link.url}` : null;
  }

  if (link.linktype === "url" || link.linktype === "asset") {
    return link.url || null;
  }

  const slug = (link.cached_url ?? link.url ?? "").replace(/^\/+/, "").replace(/\/+$/, "");
  if (!slug && !link.anchor) return null;

  const path = !slug || slug === "home" ? "/" : `/${slug}`;
  return link.anchor ? `${path}#${link.anchor}` : path;
}

function isExternal(href: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(href);
}

type SmartLinkProps = {
  link?: StoryblokLink;
  children: ReactNode;
  className?: string;
  /** Announced to screen readers when the visible label is decorative. */
  ariaLabel?: string;
};

/**
 * Renders a link when the Storyblok field has a target, and a plain `<span>`
 * when it doesn't — cards stay visually identical either way.
 */
export function SmartLink({ link, children, className, ariaLabel }: SmartLinkProps) {
  const href = resolveHref(link);

  if (!href) {
    return <span className={className}>{children}</span>;
  }

  if (isExternal(href)) {
    return (
      <a
        href={href}
        className={className}
        aria-label={ariaLabel}
        target={link?.target || "_blank"}
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      aria-label={ariaLabel}
      target={link?.target || undefined}
    >
      {children}
    </Link>
  );
}
