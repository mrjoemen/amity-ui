# Amity Dental Solutions website

Static [Astro](https://astro.build) site for **amitydentalsolutions.com**, deployed on Netlify.

Right now it serves the under-construction page, which is also kept at `/maintenance` as a fallback while the main site is down.

## Local development

Requires Node 22 or newer (`nvm use` picks up `.nvmrc`).

```sh
npm install
npx playwright install chromium   # once, for the tests
npm run dev                       # http://localhost:4321
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run check` | Type-check Astro and TypeScript files |
| `npm test` | Build, serve, and run the Playwright tests (content, responsive layout, accessibility, routes) |
| `npm run svg:optimize` | Shrink `public/illustration.svg` without breaking its animation |
| `npm run svg:still` | Regenerate `public/illustration-still.svg` (no animation) from the animated file |

## Where things live

| What | Where |
| --- | --- |
| Brand colors | `src/styles/tokens.css` (the only place hex colors are defined) |
| Logo | `src/assets/logo.png` |
| Illustration | `public/illustration.svg` (animated) and `public/illustration-still.svg` (shown when the visitor's device asks for reduced motion) |
| Favicon | `public/favicon.png` |
| Page text and layout | `src/components/UnderConstruction.astro` |
| Pages | `src/pages/` (`index`, `maintenance`, `404`) |

**Replacing the illustration:** copy the new SVG over `public/illustration.svg`, then run `npm run svg:optimize && npm run svg:still`. Open both files in a browser to check them. `svgo.config.mjs` explains why the default SVGO preset isn't used.

## Deploying to Netlify

1. In Netlify, choose **Add new site → Import an existing project** and pick this repository.
2. Leave the build settings empty. `netlify.toml` already sets the build command (`npm run build`), the publish folder (`dist`) and Node 22.
3. Every push to `main` deploys to production. Pull requests get preview URLs.

### Custom domain (DNS stays at Squarespace)

1. In Netlify: **Domain management → Add a domain** → `amitydentalsolutions.com`, and set it as the primary domain.
2. In Squarespace: **Domains → amitydentalsolutions.com → DNS settings**.
   - Delete any existing `@` or `www` records that point to Squarespace (A, AAAA, or CNAME presets).
   - Leave email-related records (MX, TXT) alone.
   - Add:

   | Host | Type | Value |
   | --- | --- | --- |
   | `@` | A | `75.2.60.5` |
   | `www` | CNAME | `<your-site-name>.netlify.app` |

3. Wait for DNS to update (minutes to a few hours). `dig +short amitydentalsolutions.com` should print `75.2.60.5`.
4. Netlify then issues the HTTPS certificate automatically. `www` and `http://` redirect to `https://amitydentalsolutions.com`.

## Maintenance mode

The `MAINTENANCE_MODE` setting decides what `/` shows. It is read when the site is **built**, so changing it needs a redeploy.

- **Turn on:** Netlify → **Site configuration → Environment variables** → add `MAINTENANCE_MODE` = `true` → **Deploys → Trigger deploy → Deploy site**. Takes about a minute.
- **Turn off:** delete the variable (or set it to anything other than `true`) and redeploy.
- **Emergency (instant):** if a bad deploy broke the site, go to **Deploys**, open the last good deploy, and click **Publish deploy**. No rebuild needed.

While no landing page exists, `/` always shows the under-construction page. When one is added, render it in `src/pages/index.astro` and set `LANDING_READY = true` there.
