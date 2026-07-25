# VEOCEL™ website

Next.js (App Router) + Storyblok implementation of the VEOCEL design: the home page
and the `beauty + skincare` category page.

- **Next.js 16** with React Server Components; one client component in the block
  library (`FeatureAccordion`) and one in the chrome (`SiteHeader`)
- **Tailwind CSS v4**, themed entirely from tokens in `app/globals.css`
- **Storyblok** as the CMS, with a 13-block library, Visual Editor live preview and
  webhook-driven cache invalidation

## Getting started

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:3000. **No Storyblok account is needed to see the
designs** — with `STORYBLOK_ACCESS_TOKEN` unset, both pages render from the local
mock content in `lib/mock/`. Images are absent there, so each one shows a tinted
placeholder in the right aspect ratio.

## Connecting Storyblok

1. Copy the env template and fill it in:

   ```bash
   cp .env.example .env.local
   ```

2. Push the component library into your space (creates all 24 components with their
   fields, whitelists and dropdowns):

   ```bash
   npx storyblok login
   ```

   ```bash
   npx storyblok components push --file storyblok/components.json --space YOUR_SPACE_ID
   ```

3. Create the stories:
   - `home` — content type **Page**
   - `beauty-skincare` — content type **Page**
   - `config` — content type **Site configuration** (header, footer, newsletter).
     The slug must be exactly `config`.

   `lib/mock/pages.ts` and `lib/mock/config.ts` are the reference for what to put in
   each field.

4. Point the space's preview URL at the draft route so the Visual Editor works:

   ```
   https://<your-host>/api/draft?secret=<STORYBLOK_PREVIEW_SECRET>&slug=
   ```

5. Add a webhook on story publish so changes go live immediately instead of waiting
   out the one-hour revalidate window:

   ```
   https://<your-host>/api/revalidate?secret=<STORYBLOK_WEBHOOK_SECRET>
   ```

## How content reaches the page

```
Storyblok CDN ──► lib/storyblok.ts ──► app/[...slug]/page.tsx
                  (fetch + cache)      └─► StoryView ──► BlockRenderer ──► one component per blok
```

`lib/storyblok.ts` fetches with plain `fetch` rather than the Storyblok JS client, so
Next's own cache and tag revalidation apply directly. Its failure behaviour is
deliberate:

| Situation | Result |
| --- | --- |
| No access token | Local mock content, so the design is always reviewable |
| Token set, story missing | `null` → a real 404 |
| Token set, request failed | Throws for pages; header/footer fall back to mock so a CDN blip can't blank the site |

## Adding a block

Four places, always in step:

1. `lib/types.ts` — the blok type, added to the `AnyBlok` union
2. `components/storyblok/YourBlock.tsx` — the component, spreading `editable(blok)`
   on its root element for Visual Editor click-to-edit
3. `components/storyblok/BlockRenderer.tsx` — one line in the registry
4. `storyblok/components.json` — the schema, plus the name in `page.body`'s
   `component_whitelist`

A block present in Storyblok but missing from the registry renders a visible notice
in development and nothing in production.

## Design tokens

Colours, type scale, radii and section rhythm live in the `@theme` block of
`app/globals.css`. Nothing else hardcodes a brand value, so retheming is a
single-file change.

Headings are written lowercase in the CMS rather than lowercased in CSS — a blanket
`text-transform` would also flatten `VEOCEL™` to `veocel™`.

## Known gaps

These need input that wasn't available at build time:

- **Photography.** Every image field is empty; placeholders stand in. Upload assets
  in Storyblok — no code changes needed.
- **The logo** in `components/layout/Logo.tsx` is drawn from the mockups, not from
  brand artwork. Replace it with the official asset.
- **The typeface** is Nunito, the closest widely available match to the rounded sans
  in the design. Swap the two `next/font` calls in `app/layout.tsx` for the licensed
  brand face.
- **Newsletter signup** posts to the provider endpoint set in the `config` story.
  Until that field is filled the input renders disabled rather than dropping
  addresses silently.
- **Copy** in `lib/mock/` is transcribed from low-resolution mockups. Treat the
  Storyblok content as the source of truth.

## Scripts

```bash
npm run build
```

```bash
npm run lint
```
