import { ArrowMarker } from "@/components/ui/ArrowButton";
import { SmartLink } from "@/components/ui/SmartLink";
import type { ConfigBlok, SocialLinkBlok } from "@/lib/types";

/**
 * Band above the footer, split into tinted panels: newsletter signup, social
 * links, and — when `config.responsibility_label` is set — the social
 * responsibility platform. Each panel centres its own content, and the tints run
 * edge to edge rather than sitting inside the page gutters.
 *
 * The form posts directly to the email provider's own endpoint
 * (`config.newsletter_action_url`). There is no local API route and no subscriber
 * storage — so when that field is empty the input is disabled rather than
 * accepting an address it would silently drop.
 */
export function NewsletterBand({ config }: { config: ConfigBlok }) {
  const action = config.newsletter_action_url?.trim();
  const responsibility = config.responsibility_label?.trim();

  return (
    <section
      className={`grid text-brand-800 ${responsibility ? "md:grid-cols-3" : "md:grid-cols-2"}`}
      aria-labelledby="newsletter-heading"
    >
      <div className="flex flex-col items-center bg-brand-100 px-6 py-12">
        <h2 id="newsletter-heading" className="text-sm font-semibold">
          {config.newsletter_heading ?? "newsletter subscriptions"}
        </h2>

        <form
          action={action || undefined}
          method={action ? "post" : undefined}
          className="mt-4 flex w-full max-w-sm items-center gap-3 border-b border-brand-800/30 pb-2"
        >
          <label htmlFor="newsletter-email" className="sr-only">
            E-mail address
          </label>
          <input
            id="newsletter-email"
            type="email"
            name="EMAIL"
            required
            disabled={!action}
            placeholder={config.newsletter_placeholder ?? "type your e-mail address"}
            className="w-full bg-transparent text-sm italic placeholder:text-brand-800/55 focus:outline-none disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!action}
            className="group rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-40"
          >
            <span className="sr-only">Subscribe</span>
            <ArrowMarker tone="brand" size="sm" />
          </button>
        </form>

        {!action ? (
          <p className="mt-2 text-[0.7rem] text-brand-800/60">
            Signup opens once a provider endpoint is set in the Storyblok config story.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col items-center bg-brand-200 px-6 py-12">
        <h2 className="text-sm font-semibold">
          {config.social_heading ?? "follow us on social media"}
        </h2>

        <ul className="mt-4 flex items-center gap-3">
          {(config.socials ?? []).map((social) => (
            <li key={social._uid}>
              {/* overflow-hidden lets the Facebook mark crop at the circle's
                  bottom edge, the way the platform (and the frame) draw it. */}
              <SmartLink
                link={social.link}
                ariaLabel={social.platform}
                className="flex h-[2.375rem] w-[2.375rem] items-center justify-center overflow-hidden rounded-full bg-brand text-white transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <SocialIcon platform={social.platform} />
              </SmartLink>
            </li>
          ))}
        </ul>
      </div>

      {responsibility ? (
        <div className="flex flex-col items-center bg-brand-100 px-6 py-12">
          <h2 className="text-sm font-semibold">
            {config.responsibility_heading ?? "social responsibility platform"}
          </h2>

          <SmartLink
            link={config.responsibility_link}
            className="mt-3 text-2xl font-bold italic md:text-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          >
            {responsibility}
          </SmartLink>
        </div>
      ) : null}
    </section>
  );
}

/**
 * Platform marks matched to the 2019:1441 footer revision: LinkedIn is its
 * rounded square with the "in" knocked out, YouTube its play badge with the
 * triangle knocked out, and Facebook the large "f" that fills the disc and
 * crops at its bottom edge. Sizes differ per mark, as the frame draws them.
 */
function SocialIcon({ platform }: { platform: SocialLinkBlok["platform"] }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "currentColor",
    className: "h-4 w-4",
    "aria-hidden": true,
  };

  switch (platform) {
    case "linkedin":
      return (
        <svg {...common} className="h-[1.2rem] w-[1.2rem]">
          <path
            fillRule="evenodd"
            d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3.35 6.6H5.9v7.9h2.45V9.6ZM7.12 6.2a1.42 1.42 0 1 0 0 2.84 1.42 1.42 0 0 0 0-2.84ZM18.1 12.98c0-2.36-1.26-3.56-2.94-3.56-1.36 0-1.97.75-2.31 1.28V9.6h-2.44v7.9h2.44v-4.4c0-1.1.52-1.76 1.44-1.76.9 0 1.36.62 1.36 1.76v4.4h2.45v-4.52Z"
          />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common} className="h-[1.4rem] w-[1.4rem]">
          <path d="M12 4c-2.2 0-2.5 0-3.3.05-.85.04-1.4.17-1.9.36a3.9 3.9 0 0 0-1.4.9 3.9 3.9 0 0 0-.9 1.4c-.19.5-.32 1.05-.36 1.9C4.1 9.4 4.1 9.7 4.1 12s0 2.6.05 3.4c.04.85.17 1.4.36 1.9a3.9 3.9 0 0 0 .9 1.4 3.9 3.9 0 0 0 1.4.9c.5.19 1.05.32 1.9.36.8.05 1.1.05 3.3.05s2.5 0 3.3-.05c.85-.04 1.4-.17 1.9-.36a4.2 4.2 0 0 0 2.3-2.3c.19-.5.32-1.05.36-1.9.05-.8.05-1.1.05-3.4s0-2.6-.05-3.4c-.04-.85-.17-1.4-.36-1.9a3.9 3.9 0 0 0-.9-1.4 3.9 3.9 0 0 0-1.4-.9c-.5-.19-1.05-.32-1.9-.36C14.5 4 14.2 4 12 4Zm0 1.8c2.15 0 2.45 0 3.25.05.7.03 1.05.15 1.3.24.3.12.52.27.75.5.23.23.38.45.5.75.09.25.21.6.24 1.3.05.8.05 1.1.05 3.36s0 2.56-.05 3.36c-.03.7-.15 1.05-.24 1.3-.12.3-.27.52-.5.75-.23.23-.45.38-.75.5-.25.09-.6.21-1.3.24-.8.05-1.1.05-3.25.05s-2.45 0-3.25-.05c-.7-.03-1.05-.15-1.3-.24-.3-.12-.52-.27-.75-.5a2.1 2.1 0 0 1-.5-.75c-.09-.25-.21-.6-.24-1.3C5.9 14.56 5.9 14.26 5.9 12s0-2.56.05-3.36c.03-.7.15-1.05.24-1.3.12-.3.27-.52.5-.75.23-.23.45-.38.75-.5.25-.09.6-.21 1.3-.24C9.55 5.8 9.85 5.8 12 5.8Zm0 2.9a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6Zm0 5.44a2.14 2.14 0 1 1 0-4.28 2.14 2.14 0 0 1 0 4.28Zm4.2-5.62a.77.77 0 1 1-1.54 0 .77.77 0 0 1 1.54 0Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common} className="h-[1.6rem] w-[1.6rem]">
          <path
            fillRule="evenodd"
            d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8C22 15.2 22 12 22 12s0-3.2-.4-4.8ZM10 15.2V8.8L15.5 12 10 15.2Z"
          />
        </svg>
      );
    case "facebook":
      // Drawn at the full button size so the stem meets the viewBox bottom,
      // where the circle's overflow clipping crops it.
      return (
        <svg {...common} className="h-full w-full">
          <path d="M16.4 13.6l.5-3.4h-3.3V8c0-.95.45-1.85 1.95-1.85h1.55V3.2S15.75 3 14.45 3c-2.8 0-4.6 1.7-4.6 4.7v2.5H6.8v3.4h3.05V24h3.75V13.6h2.8Z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M17.5 3h3l-6.6 7.6L21.7 21h-5.4l-4.2-5.5L7 21H4l7-8L3.6 3H9l3.9 5.2L17.5 3Z" />
        </svg>
      );
  }
}
