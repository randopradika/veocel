import type { ConfigBlok } from "../types";

/**
 * Local stand-in for the `config` story, so header/footer render before a
 * Storyblok space exists. Once the space is live this is never read —
 * see `getConfig()` in `lib/storyblok.ts`.
 *
 * Copy is transcribed from the supplied design mockups; all placeholder values.
 */
export const mockConfig: ConfigBlok = {
  _uid: "mock-config",
  component: "config",

  main_nav: [
    {
      _uid: "nav-1",
      component: "nav_item",
      label: "explore VEOCEL™",
      link: { cached_url: "explore", linktype: "story" },
    },
    {
      _uid: "nav-2",
      component: "nav_item",
      label: "fiber types",
      link: { cached_url: "fiber-types", linktype: "story" },
    },
    {
      _uid: "nav-3",
      component: "nav_item",
      label: "our stories",
      link: { cached_url: "stories", linktype: "story" },
    },
    {
      _uid: "nav-4",
      component: "nav_item",
      label: "for partners",
      link: { cached_url: "partners", linktype: "story" },
    },
  ],

  utility_nav: [
    {
      _uid: "util-1",
      component: "nav_item",
      label: "contact",
      link: { cached_url: "contact", linktype: "story" },
    },
    {
      _uid: "util-2",
      component: "nav_item",
      label: "en",
      link: { cached_url: "/", linktype: "story" },
    },
  ],

  newsletter_heading: "newsletter subscription",
  newsletter_placeholder: "type your e-mail address…",
  // Left empty on purpose: no signup endpoint exists yet, so the field renders
  // disabled instead of silently discarding an address.
  newsletter_action_url: "",
  social_heading: "follow us on social media",
  socials: [
    {
      _uid: "soc-1",
      component: "social_link",
      platform: "linkedin",
      link: { url: "https://www.linkedin.com/", linktype: "url", target: "_blank" },
    },
    {
      _uid: "soc-2",
      component: "social_link",
      platform: "instagram",
      link: { url: "https://www.instagram.com/", linktype: "url", target: "_blank" },
    },
    {
      _uid: "soc-3",
      component: "social_link",
      platform: "youtube",
      link: { url: "https://www.youtube.com/", linktype: "url", target: "_blank" },
    },
    {
      _uid: "soc-4",
      component: "social_link",
      platform: "facebook",
      link: { url: "https://www.facebook.com/", linktype: "url", target: "_blank" },
    },
  ],

  footer_tagline: "Purely for you.",

  footer_columns: [
    {
      _uid: "fc-1",
      component: "footer_column",
      title: "applications",
      links: [
        {
          _uid: "fl-1",
          component: "nav_item",
          label: "beauty + skincare",
          link: { cached_url: "beauty-skincare", linktype: "story" },
        },
        {
          _uid: "fl-2",
          component: "nav_item",
          label: "personal + body care",
          link: { cached_url: "personal-body-care", linktype: "story" },
        },
        {
          _uid: "fl-3",
          component: "nav_item",
          label: "intimate + hygiene care",
          link: { cached_url: "intimate-hygiene-care", linktype: "story" },
        },
        {
          _uid: "fl-4",
          component: "nav_item",
          label: "household + surface care",
          link: { cached_url: "household-surface-care", linktype: "story" },
        },
      ],
    },
    {
      _uid: "fc-2",
      component: "footer_column",
      title: "fibers",
      links: [
        {
          _uid: "fl-5",
          component: "nav_item",
          label: "VEOCEL™ fiber types",
          link: { cached_url: "fiber-types", linktype: "story" },
        },
        {
          _uid: "fl-6",
          component: "nav_item",
          label: "certifications",
          link: { cached_url: "certifications", linktype: "story" },
        },
        {
          _uid: "fl-7",
          component: "nav_item",
          label: "branding services",
          link: { cached_url: "branding-services", linktype: "story" },
        },
      ],
    },
    {
      _uid: "fc-3",
      component: "footer_column",
      title: "newsroom",
      links: [
        {
          _uid: "fl-8",
          component: "nav_item",
          label: "latest news",
          link: { cached_url: "news", linktype: "story" },
        },
        {
          _uid: "fl-9",
          component: "nav_item",
          label: "events + trade fairs",
          link: { cached_url: "events", linktype: "story" },
        },
        {
          _uid: "fl-10",
          component: "nav_item",
          label: "downloads",
          link: { cached_url: "downloads", linktype: "story" },
        },
      ],
    },
    {
      _uid: "fc-4",
      component: "footer_column",
      title: "get in touch",
      links: [
        {
          _uid: "fl-11",
          component: "nav_item",
          label: "business contact",
          link: { cached_url: "contact", linktype: "story" },
        },
        {
          _uid: "fl-12",
          component: "nav_item",
          label: "media contact",
          link: { cached_url: "media-contact", linktype: "story" },
        },
        {
          _uid: "fl-13",
          component: "nav_item",
          label: "where to buy",
          link: { cached_url: "where-to-buy", linktype: "story" },
        },
      ],
    },
  ],

  copyright: "© VEOCEL™",

  legal_links: [
    {
      _uid: "lg-1",
      component: "nav_item",
      label: "privacy policy",
      link: { cached_url: "privacy-policy", linktype: "story" },
    },
    {
      _uid: "lg-2",
      component: "nav_item",
      label: "terms of use",
      link: { cached_url: "terms-of-use", linktype: "story" },
    },
    {
      _uid: "lg-3",
      component: "nav_item",
      label: "imprint",
      link: { cached_url: "imprint", linktype: "story" },
    },
    {
      _uid: "lg-4",
      component: "nav_item",
      label: "cookie settings",
      link: { cached_url: "cookie-settings", linktype: "story" },
    },
  ],
};
