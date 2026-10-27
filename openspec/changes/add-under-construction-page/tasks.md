# Tasks

## 1. Project setup

- [x] 1.1 Scaffold a minimal Astro project (TypeScript strict, static output, npm) at the repo root without overwriting `openspec/` or `.claude/`; verify `npm run dev` serves the default page
- [x] 1.2 Add `@astrojs/check` and `typescript`, plus an `npm run check` script; verify `npm run check` passes with 0 errors
- [x] 1.3 Add `.gitignore` (node_modules, dist, .astro, .netlify, test-results, playwright-report) and an `.nvmrc` pinned to Node 22; verify `git status` shows no build output
- [x] 1.4 Add `@playwright/test` and `@axe-core/playwright`, a `playwright.config.ts` whose `webServer` runs `npm run build && npm run preview`, and an `npm test` script; verify `npm test` runs (with zero or a placeholder test) and exits 0

## 2. Brand tokens and base layout

- [x] 2.1 Create `src/styles/tokens.css` with brand tokens `--brand-primary: #668FAF`, `--brand-secondary: #1F3D63`, `--brand-accent: #F7CC4C`, `--brand-background: #F5F4F0` and the semantic names from design.md Decision 3; verify no hex color appears anywhere else in `src/` (`grep -rnE '#[0-9a-fA-F]{3,8}\b' src --include=*.astro --include=*.css` matches only `tokens.css`)
- [x] 2.2 Create `src/styles/global.css` (minimal reset, system font stack, fluid `clamp()` type scale) importing `tokens.css`; verify styles load on the dev page
- [x] 2.3 Set `site: 'https://amitydentalsolutions.com'` in `astro.config.mjs` and create `src/layouts/BaseLayout.astro` with `lang="en"`, viewport meta, `title` prop (always including "Amity Dental Solutions"), meta description, favicon, and `<link rel="canonical">` built from `Astro.site` + path; verify the built `dist/index.html` has the expected `<title>` and `<link rel="canonical" href="https://amitydentalsolutions.com/">`
- [x] 2.4 Copy owner assets from `~/Downloads`: `wetransfer_amity_logo2000px-png_2026-10-12_0054/Amity_logo_1000px.png` → `src/assets/logo.png`, `…/Amity_logo_500px_blu.png` → `public/favicon.png`, `company discussion.svg` → `public/illustration.svg`; verify the files exist and the favicon shows in the browser tab
- [x] 2.5 Optimize `public/illustration.svg` with SVGO using settings that keep `<animate*>` elements; verify the file is smaller and the animation still plays when opened directly in a browser
- [x] 2.6 Create `public/illustration-still.svg` by removing every `<animate>`, `<animateTransform>`, and `<animateMotion>` element (small script or SVGO `removeElementsByAttr`/custom plugin); verify `grep -c '<animate' public/illustration-still.svg` returns 0 and the still frame looks correct when opened

## 3. Under-construction page

- [x] 3.1 Build `src/components/UnderConstruction.astro`: wordmark logo via `<Image />` with `alt="Amity Dental Solutions"`; `<h1>`"Uh oh! You reached the website while it's under construction!"; `<p>`"We're just as stoked as you are at Amity, however, we want to ensure you're provided the best experience possible."; `<p>`"We'll be done soon!"; signature `<p>`"- Amity Team"; and the `<picture>` illustration from design.md Decision 5 (`alt=""`, width 882, height 551). Text uses `--color-text`/`--color-heading` only; accent/primary only for decoration. Add a Playwright test asserting the logo alt and each of the four text strings exactly, in order, and that the illustration is visible
- [x] 3.2 Add mobile-first CSS Grid layout: single column below 768px with the illustration visually on top (`order: -1`, text stays first in the markup), two columns (text left, SVG right, centers aligned) at ≥768px, centered container with max-width and `min-height: 100dvh`; add Playwright tests at 1280px and 768px (text box left of SVG box, overlapping vertical ranges) and at 360px (SVG box above text box, `scrollWidth <= clientWidth`)
- [x] 3.3 Create `src/pages/index.astro` and `src/pages/maintenance.astro`, both rendering `UnderConstruction` inside `BaseLayout`; add Playwright tests that `/` and `/maintenance` return 200 with the headline
- [x] 3.4 Add a Playwright test that loads `/` with JavaScript disabled and asserts the same content and 1280px side-by-side layout; verify it passes
- [x] 3.5 Add a Playwright test using `page.emulateMedia({ reducedMotion: 'reduce' })` that asserts the illustration's `currentSrc` ends with `illustration-still.svg`, and with no preference ends with `illustration.svg`; verify both pass
- [x] 3.6 Add an `@axe-core/playwright` scan of `/` with zero violations (including color contrast); also assert computed `color` of all text elements is `rgb(31, 61, 99)` (#1F3D63) and body background is `rgb(245, 244, 240)` (#F5F4F0)

## 4. Hosting and maintenance mode

- [x] 4.1 Declare `MAINTENANCE_MODE` (optional, default unset) in `astro.config.mjs` `env.schema` and make `index.astro` branch on it so `/` renders `UnderConstruction` when it is `true` or when no landing page exists; verify `MAINTENANCE_MODE=true npm run build` and a plain build both produce the page at `dist/index.html`
- [x] 4.2 Create `src/pages/404.astro` using `BaseLayout` and brand styling with a link to `/`; add a Playwright test that an unknown path returns 404 and contains a link to `/`
- [x] 4.3 Add `netlify.toml` with `command = "npm run build"`, `publish = "dist"`, `NODE_VERSION = "22"`, and immutable cache headers for `/_astro/*`; verify with `npx netlify build` locally (or by inspecting the first Netlify deploy log) that these settings are used
- [x] 4.4 Write `README.md` covering local dev, `npm run check` / `npm test`, where to change brand colors and assets, Netlify setup, the Squarespace DNS records for amitydentalsolutions.com, and the maintenance-mode runbook (set `MAINTENANCE_MODE=true` → redeploy; emergency: "publish previous deploy"); verify each documented command runs as written

## 5. Integration checks before first deploy

- [x] 5.1 Run `npm run check && npm test` on a clean install (`rm -rf node_modules dist && npm ci`); verify all pass
- [x] 5.2 Check page weight: build output for `/` (HTML + CSS + logo + illustration) loads in under 1 s on Lighthouse mobile "Slow 4G" or LCP ≤ 2.5 s; if not, revisit SVGO settings or logo size
- [ ] 5.3 Deploy to a Netlify preview, open it on a real phone and a desktop browser, and verify the layout, `/maintenance`, and a 404 path behave as specified

- [ ] 5.4 In Netlify, add `amitydentalsolutions.com` as the primary domain; in Squarespace DNS, remove conflicting `@`/`www` records and add `@` A `75.2.60.5` and `www` CNAME `<netlify-site-name>.netlify.app`; verify `dig +short amitydentalsolutions.com` returns `75.2.60.5` and Netlify shows the domain and certificate as active
- [ ] 5.5 Verify redirects and HTTPS: `curl -sI https://amitydentalsolutions.com` returns 200; `curl -sI http://amitydentalsolutions.com` and `curl -sI https://www.amitydentalsolutions.com/maintenance` return 301 with `location` on `https://amitydentalsolutions.com` (same path)

## Workflow follow-up

- Archive the change after review with `/opsx:archive`.
