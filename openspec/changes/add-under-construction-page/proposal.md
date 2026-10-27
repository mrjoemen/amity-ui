# Proposal

## Why

Amity Dental Solutions needs a public web presence before its full landing page is built. A branded "under construction" page gives visitors something trustworthy at the domain now, and the same page can be reused as a maintenance fallback later when the main site is down or being redeployed.

## What Changes

- Scaffold a new Astro project in this (currently empty) repository, built as a fully static site.
- Add a reusable under-construction page that shows the Amity Dental Solutions logo, the owner's "under construction" message, and an animated illustration SVG placed side by side with the text.
- Make the layout responsive: text and SVG side by side on wider screens, stacked with the SVG on top on narrow (phone) screens. Show a still illustration to visitors who ask for reduced motion.
- Define the brand hex colors once as design tokens (CSS custom properties) so the future landing page can reuse them.
- Serve the page at `/` for now (no landing page exists yet) and at a stable `/maintenance` path so it can be pointed to when something is down.
- Add a build-time maintenance switch (`MAINTENANCE_MODE`) so that, once a landing page exists, `/` can be flipped back to this page with an environment variable and a redeploy.
- Add Netlify deployment configuration (`netlify.toml`) with the build command, publish directory, and Node version.

## Capabilities

### New Capabilities
- `under-construction-page`: The branded placeholder/maintenance page — its content (logo, message, illustration), brand color usage, side-by-side responsive layout, accessibility, and the routes it is served on.
- `site-hosting`: How the site is built and deployed to Netlify, including the maintenance-mode switch that decides what `/` serves.

### Modified Capabilities
<!-- None: there are no existing specs in this project. -->

## Impact

- **New code**: entire Astro project (`package.json`, `astro.config.mjs`, `src/`, `public/`), plus `netlify.toml`.
- **Dependencies**: `astro` (and its dev tooling such as `@astrojs/check` and `typescript`); `@playwright/test` and `@axe-core/playwright` as dev-only test dependencies. No UI framework or CSS framework is required.
- **Owner assets (provided)**: brand colors #668FAF (primary), #1F3D63 (secondary), #F7CC4C (accent), #F5F4F0 (background); PNG logos; animated illustration `company discussion.svg`.
- **Systems**: a Netlify site connected to this repository; optionally a custom domain.
- **Out of scope**: the real landing page, contact forms, analytics, CMS, and email capture.
