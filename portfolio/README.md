# Arianne A. Villaluna — personal site

A fast, dependency-free static site built from `brief.md` (v0.2): six pages (Home, Services, Work, About, Beyond work, Contact) in English (`/en/`) and Norwegian (`/no/`).

## Build & preview

```bash
node build.mjs          # writes the site to dist/
npm run serve           # build + local preview on http://localhost:4173
```

`dist/` is plain HTML/CSS/JS and can be hosted anywhere (GitHub Pages, Netlify, Cloudflare Pages). The build prints a "Before launch" list of anything still missing.

## Deploy on Vercel

`vercel.json` at the repo root already tells Vercel how to build the site, so no project settings are needed:

1. At [vercel.com/new](https://vercel.com/new), import `arianneav0013-ux/klar4jobb-prototype`.
2. Leave **Root Directory** as the repo root and **Framework Preset** as "Other". Click **Deploy**.
3. Every push then deploys automatically, with a preview URL for each pull request.
4. When the domain is ready: Project → Settings → Domains, then update `siteUrl` in `config.mjs`.

Or from a terminal with the Vercel CLI: `npx vercel` (preview) and `npx vercel --prod`.

## Where things live

| What | File |
|---|---|
| Domain, email, LinkedIn, booking link, analytics | `config.mjs` |
| English copy | `content/en.mjs` |
| Norwegian copy (to proofread) | `content/no.mjs` |
| Page templates | `build.mjs` |
| Styles / motion / EN-NO switch | `static/assets/site.css`, `static/assets/site.js` |
| Headshot | `static/assets/img/headshot.jpg` (monogram shown until added) |
| CV | `static/assets/cv/Arianne-Villaluna-CV-EN.pdf` ("Request my CV" shown until added) |

## How the brief is covered

- **Language:** EN | NO switch in the header keeps you on the same page; separate URLs per language with `hreflang` tags and a sitemap with alternates. The root URL sends Norwegian-language browsers to `/no/`, everyone else to `/en/`, and remembers an explicit choice.
- **Look & feel:** oversized system sans-serif type (no third-party font requests), off-white / near-black with a Nordic-blue accent, generous white space, gentle scroll reveals and hover states (disabled for reduced-motion users), automatic light/dark mode.
- **Accessibility:** WCAG AA contrast for text in both themes, skip link, visible focus, keyboard-operable menu, semantic landmarks, works without JavaScript.
- **Conversion:** "Book a conversation" in the header and a closing call-to-action on every page; Cal.com/Calendly embed on `/contact` once `bookingUrl` is set.
- **Analytics:** Plausible script is added only when `plausibleDomain` is set (no cookies, no banner).

## Still to do (from the brief's content inventory)

- [ ] Fill in `config.mjs` (email, LinkedIn, booking URL, domain)
- [ ] Headshot, CV PDF, and 4–6 layout design samples (gallery currently shows placeholders)
- [ ] Review the three case studies; they are drafted from the proof points in the brief
- [ ] Testimonials (none added; no quotes were invented)
- [ ] Proofread Norwegian copy
- [ ] Decisions assumed for open questions: "Chief Engagement Officer" (per CV); Merita shown at concept level, as a product in the Insj UiO incubator; service lines 1–3 lead, 4 secondary, 5 as an add-on
