import { ArrowMarker } from "@/components/ui/ArrowButton";
import { Container } from "@/components/ui/Container";
import { SmartLink } from "@/components/ui/SmartLink";
import type { ConfigBlok, SocialLinkBlok } from "@/lib/types";

/**
 * Pale blue band above the footer: newsletter signup on the left, social links on
 * the right.
 *
 * The form posts directly to the email provider's own endpoint
 * (`config.newsletter_action_url`). There is no local API route and no subscriber
 * storage — so when that field is empty the input is disabled rather than
 * accepting an address it would silently drop.
 */
export function NewsletterBand({ config }: { config: ConfigBlok }) {
  const action = config.newsletter_action_url?.trim();

  return (
    <section className="bg-brand-200/70 text-brand-800" aria-labelledby="newsletter-heading">
      <Container>
        <div className="grid gap-10 py-12 md:grid-cols-2 md:gap-16">
          <div>
            <h2 id="newsletter-heading" className="text-sm font-semibold">
              {config.newsletter_heading ?? "newsletter subscription"}
            </h2>

            <form
              action={action || undefined}
              method={action ? "post" : undefined}
              className="mt-4 flex items-center gap-3 border-b border-brand-800/25 pb-2"
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
                placeholder={config.newsletter_placeholder ?? "type your e-mail address…"}
                className="w-full bg-transparent text-sm placeholder:text-brand-800/55 focus:outline-none disabled:cursor-not-allowed"
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

          <div className="md:pl-12">
            <h2 className="text-sm font-semibold">
              {config.social_heading ?? "follow us on social media"}
            </h2>
            <ul className="mt-4 flex items-center gap-3">
              {(config.socials ?? []).map((social) => (
                <li key={social._uid}>
                  <SmartLink
                    link={social.link}
                    ariaLabel={social.platform}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <SocialIcon platform={social.platform} />
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

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
        <svg {...common}>
          <path d="M6.2 9.5H3.4V21h2.8V9.5ZM4.8 3a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4ZM21 14.6c0-3.2-1.7-4.7-4-4.7a3.5 3.5 0 0 0-3.1 1.7V9.5H8.9V21h2.9v-6.1c0-1.6.8-2.5 2.1-2.5s1.9.9 1.9 2.5V21H21v-6.4Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common}>
          <path d="M12 4c-2.2 0-2.5 0-3.3.05-.85.04-1.4.17-1.9.36a3.9 3.9 0 0 0-1.4.9 3.9 3.9 0 0 0-.9 1.4c-.19.5-.32 1.05-.36 1.9C4.1 9.4 4.1 9.7 4.1 12s0 2.6.05 3.4c.04.85.17 1.4.36 1.9a3.9 3.9 0 0 0 .9 1.4 3.9 3.9 0 0 0 1.4.9c.5.19 1.05.32 1.9.36.8.05 1.1.05 3.3.05s2.5 0 3.3-.05c.85-.04 1.4-.17 1.9-.36a4.2 4.2 0 0 0 2.3-2.3c.19-.5.32-1.05.36-1.9.05-.8.05-1.1.05-3.4s0-2.6-.05-3.4c-.04-.85-.17-1.4-.36-1.9a3.9 3.9 0 0 0-.9-1.4 3.9 3.9 0 0 0-1.4-.9c-.5-.19-1.05-.32-1.9-.36C14.5 4 14.2 4 12 4Zm0 1.8c2.15 0 2.45 0 3.25.05.7.03 1.05.15 1.3.24.3.12.52.27.75.5.23.23.38.45.5.75.09.25.21.6.24 1.3.05.8.05 1.1.05 3.36s0 2.56-.05 3.36c-.03.7-.15 1.05-.24 1.3-.12.3-.27.52-.5.75-.23.23-.45.38-.75.5-.25.09-.6.21-1.3.24-.8.05-1.1.05-3.25.05s-2.45 0-3.25-.05c-.7-.03-1.05-.15-1.3-.24-.3-.12-.52-.27-.75-.5a2.1 2.1 0 0 1-.5-.75c-.09-.25-.21-.6-.24-1.3C5.9 14.56 5.9 14.26 5.9 12s0-2.56.05-3.36c.03-.7.15-1.05.24-1.3.12-.3.27-.52.5-.75.23-.23.45-.38.75-.5.25-.09.6-.21 1.3-.24C9.55 5.8 9.85 5.8 12 5.8Zm0 2.9a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6Zm0 5.44a2.14 2.14 0 1 1 0-4.28 2.14 2.14 0 0 1 0 4.28Zm4.2-5.62a.77.77 0 1 1-1.54 0 .77.77 0 0 1 1.54 0Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common}>
          <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8C22 15.2 22 12 22 12s0-3.2-.4-4.8ZM10 15.2V8.8L15.5 12 10 15.2Z" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common}>
          <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.6V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.3H7.6V13h2.7v8h3.2Z" />
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
