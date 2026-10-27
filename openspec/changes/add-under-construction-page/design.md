# Design

## Context

The repository is empty apart from OpenSpec scaffolding — there is no existing code, framework, or styling to follow. The owner has fixed three constraints: Astro, Netlify, and a responsive text/SVG side-by-side layout. The owner has supplied: brand colors (#668FAF primary, #1F3D63 secondary, #F7CC4C accent, #F5F4F0 background), PNG logos in `~/Downloads/wetransfer_amity_logo2000px-png_2026-10-12_0054/`, and an animated illustration at `~/Downloads/company discussion.svg` (882×551 `viewBox`, ~200 KB, looping SMIL animation, its own non-brand palette). There is no SVG logo. See proposal.md for motivation; see the specs for required behavior.

## Goals / Non-Goals

**Goals:**
- A small, fast, zero-JS static page that can be dropped in front of any future site.
- Brand tokens and a base layout the future landing page can reuse instead of rewriting.
- A maintenance switch that needs only a Netlify env var change and redeploy — no code edit.

**Non-Goals:**
- Instant (no-redeploy) failover. Netlify's "publish previous deploy" covers emergency rollback; this design does not try to detect outages automatically.
- Any UI framework (React, Vue, etc.), CSS framework, or client-side interactivity.

## Decisions

### 1. Astro in static output mode, no adapter
Use Astro's default `output: 'static'`. Netlify serves the `dist/` folder directly.
- *Alternative:* `@astrojs/netlify` adapter with SSR — rejected; nothing here needs a server, and static is cheaper, faster, and has fewer failure modes (important for a page whose job is to be up when other things are down).

### 2. Project layout
```
src/
  assets/logo.png    wordmark, from Amity_logo_1000px.png
public/
  illustration.svg         animated illustration, from "company discussion.svg"
  illustration-still.svg   same with all <animate*> elements removed
  favicon.png              round tooth mark, from Amity_logo_500px_blu.png
  styles/tokens.css  brand colors, fonts, spacing as CSS custom properties
  styles/global.css  reset + base typography, imports tokens.css
  layouts/BaseLayout.astro         <html>, <head> (title, meta, favicon), global CSS
  components/UnderConstruction.astro  the page body (text + SVG)
  pages/index.astro        renders UnderConstruction (until landing page exists)
  pages/maintenance.astro  always renders UnderConstruction
  pages/404.astro          branded not-found page
netlify.toml
```
`UnderConstruction` is a component, not just a page, so both `/` and `/maintenance` render the same markup from one source.

### 3. Brand colors as CSS custom properties
Define in `src/styles/tokens.css` on `:root`, with semantic names layered over raw brand names:
```css
:root {
  --brand-primary: #668FAF;
  --brand-secondary: #1F3D63;
  --brand-accent: #F7CC4C;
  --brand-background: #F5F4F0;
  --color-bg: var(--brand-background);
  --color-text: var(--brand-secondary);
  --color-heading: var(--brand-secondary);
  --color-decoration: var(--brand-primary);
  --color-highlight: var(--brand-accent);
}
```
Measured contrast on #F5F4F0: #1F3D63 is 10.0:1 (all text), #668FAF is 3.1:1 (large text or decoration only), #F7CC4C is 1.4:1 (decoration only, e.g. an underline under a headline word or a divider). That is why both text tokens map to the secondary color. Components only reference the semantic names. This satisfies the "single definition" requirement and lets the landing page reuse the palette.
- *Alternative:* Tailwind with a theme config — rejected for now; it adds tooling for a one-page site. Can be adopted later and still read these variables.

### 4. Responsive layout with CSS Grid, mobile-first
Markup order is text then illustration (so screen readers and no-CSS views reach the copy first). Mobile default: single column with the illustration visually on top via `order: -1` on the illustration. At `@media (min-width: 768px)`: `grid-template-columns: 1fr 1fr` with `align-items: center`, `order` reset, text left / SVG right. The copy is structured as `<h1>` headline, `<p>` message, `<p>` closing line, and a signature `<p>` styled smaller/italic. The section is centered with `min-height: 100dvh` and a `max-width` (~1200px) container with fluid padding (`clamp()`). Typography uses `clamp()` so the headline scales smoothly between breakpoints.
- *Alternative:* Flexbox with `flex-wrap` — works, but grid gives a deterministic two-column split and simpler ordering.

### 5. SVG handling
- **Illustration**: served as a file and shown with
  ```html
  <picture>
    <source srcset="/illustration-still.svg" media="(prefers-reduced-motion: reduce)">
    <img src="/illustration.svg" alt="" width="882" height="551">
  </picture>
  ```
  SMIL animation runs inside `<img>` SVGs, and the `<picture>` media query swaps in the still copy for reduced-motion users with no JavaScript. `alt=""` marks it decorative. CSS: `width: 100%; height: auto; max-width: …`. The still copy is produced once during asset prep by removing every `<animate>`, `<animateTransform>`, and `<animateMotion>` element; check visually that the resulting frame looks right.
  - *Alternative:* inline the SVG (Astro SVG component) — rejected: SMIL can't be paused from CSS, so reduced motion would need two 200 KB inline copies in the HTML or JavaScript. A separate file is also cached across `/` and `/maintenance`.
- **Logo**: `Amity_logo_1000px.png` (wordmark with "Dental Solutions") rendered with Astro's `<Image />` (auto-converted to WebP, explicit width/height) and `alt="Amity Dental Solutions"`. Because the wordmark contains the business name, no separate name text is shown.
- **Favicon**: `Amity_logo_500px_blu.png` (round tooth mark) copied to `public/favicon.png`.

### 6. Maintenance switch evaluated at build time
`src/pages/index.astro` reads `import.meta.env.MAINTENANCE_MODE`. For this change there is no landing page, so it always renders `UnderConstruction`; the conditional is written now so that when the landing page lands, the branch is already there:
```astro
---
const maintenance = import.meta.env.MAINTENANCE_MODE === 'true';
---
{maintenance || !LANDING_READY ? <UnderConstruction /> : <Landing />}
```
(Exact shape is left to implementation; the behavior is defined in the `site-hosting` spec.) Declare the variable via Astro's `env.schema` in `astro.config.mjs` so it is typed and documented.
- *Alternative:* a `_redirects` rule `/* /maintenance 302` toggled by commit — rejected: requires a code change under pressure, and a 302 changes the URL users see.
- *Alternative:* Netlify Edge Function reading an env var at request time — gives instant toggling but adds runtime code; revisit only if redeploy time becomes a problem.

### 7. Netlify configuration
`netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"
[build.environment]
  NODE_VERSION = "22"
```
Plus long-cache headers for `/_astro/*` (hashed assets) and default caching for HTML. Netlify serves `dist/404.html` automatically for unknown paths with a 404 status.

### 10. Custom domain: amitydentalsolutions.com, DNS stays at Squarespace
The domain is registered with Squarespace and its DNS stays there (no nameserver move, so any existing email records are untouched). In Squarespace DNS settings:

| Host | Type | Value |
|---|---|---|
| `@` | A | `75.2.60.5` (Netlify's load balancer) |
| `www` | CNAME | `<netlify-site-name>.netlify.app` |

Remove any Squarespace default records for `@` and `www` that conflict (e.g. Squarespace website A/CNAME presets). In Netlify, add `amitydentalsolutions.com` as the primary domain; Netlify then 301-redirects `www` and HTTP to `https://amitydentalsolutions.com` and issues a Let's Encrypt certificate automatically once DNS resolves. Set `site: 'https://amitydentalsolutions.com'` in `astro.config.mjs` so `BaseLayout` can emit the canonical link from `Astro.site`.
- *Alternative:* move nameservers to Netlify DNS — rejected: simpler for the site, but every email/verification record would have to be recreated, for no benefit on a static page.
- *Alternative:* `www` as primary — rejected by the owner; bare domain is the main address.

### 8. Fonts
The owner chose **Montserrat**, loaded from Google Fonts with a `<link>` in `BaseLayout` (weights 400–700, italic 400, `display=swap` so the system font shows until it loads). This is a stylesheet, not a script, so the spec's no-third-party-scripts rule still holds.
- *Alternative:* self-host with `@fontsource-variable/montserrat` — tried and rejected by the owner: an extra dependency to maintain for one page. Self-hosting would avoid the Google request (slightly faster, no visitor IPs sent to Google, no outside dependency) if that ever matters.

### 9. Verification with Playwright against the built site
Add `@playwright/test` as a dev dependency with a few smoke tests run against `astro preview`: content present, side-by-side at 1280px and 768px (compare bounding boxes), stacked at 360px with no horizontal overflow (`scrollWidth <= clientWidth`), `/maintenance` returns 200, unknown path returns 404, and the page works with JavaScript disabled. Contrast is checked with `@axe-core/playwright`.
- *Alternative:* manual checks only — rejected; the responsive layout is the core requirement and is cheap to assert automatically, and the same tests protect the page when the landing page is added later.

## Risks / Trade-offs

- [Brand colors may fail contrast for body text] → Check each text/background pair during implementation; if a pair fails, use the darker brand color for text or adjust only text weight/size and flag it to the owner.
- [The 200 KB illustration slows first paint on mobile] → Run SVGO with animation-preserving settings and confirm the animation still plays afterwards; set `loading`/`fetchpriority` appropriately and fixed dimensions so layout doesn't shift. No embedded rasters were found.
- [Illustration palette doesn't match brand colors] → Accepted by the owner; the illustration keeps its own colors.
- [Still frame (animations removed) may show an odd pose] → Visual check during asset prep; if it looks wrong, set the still copy's transforms to a chosen keyframe by hand.
- [Squarespace default records conflict with the new ones, or old records linger in caches] → Remove conflicting `@`/`www` records first; verify with `dig +short amitydentalsolutions.com` before expecting HTTPS to work.
- [Maintenance toggle needs a redeploy (~1 min)] → Acceptable for planned maintenance; for emergencies use Netlify's instant "publish previous deploy".

## Migration Plan

1. Build and verify locally (`npm run build && npm run preview`).
2. Connect the repo to a new Netlify site; it picks up `netlify.toml`.
3. Verify the Netlify preview URL, then add `amitydentalsolutions.com` in Netlify and the Squarespace DNS records from Decision 10. DNS can take minutes to a few hours to propagate; the certificate is issued after that.
4. Rollback: Netlify "publish previous deploy". Nothing stateful is involved.
