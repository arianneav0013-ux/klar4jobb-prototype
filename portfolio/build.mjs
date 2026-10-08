// Static site generator for the portfolio. No dependencies: `node build.mjs`.
// Reads content/{en,no}.mjs + config.mjs and writes a ready-to-host site to dist/.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import config from "./config.mjs";
import en from "./content/en.mjs";
import no from "./content/no.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "dist");
const STATIC = join(ROOT, "static");

const LANGS = { en, no };
const PAGES = ["", "services", "work", "about", "beyond", "contact"];
const NAV = ["services", "work", "about", "beyond", "contact"];

// --- Config checks ----------------------------------------------------------

const hasCv = existsSync(join(STATIC, "assets/cv", config.cvFile));
const hasHeadshot = existsSync(join(STATIC, "assets/img", config.headshot));
const email = config.email || "hello@example.com";

const warnings = [];
if (!config.email) warnings.push("config.email is empty (using hello@example.com placeholder)");
if (!config.linkedin) warnings.push("config.linkedin is empty (LinkedIn link hidden)");
if (!config.bookingUrl) warnings.push("config.bookingUrl is empty (contact page shows email fallback)");
if (!hasCv) warnings.push(`static/assets/cv/${config.cvFile} not found (showing "Request my CV")`);
if (!hasHeadshot) warnings.push(`static/assets/img/${config.headshot} not found (showing monogram)`);

// --- Helpers ----------------------------------------------------------------

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const pagePath = (lang, slug) => `${lang}/${slug ? slug + "/" : ""}`;
const absUrl = (lang, slug) => `${config.siteUrl}/${pagePath(lang, slug)}`;
const mailto = (subject) => `mailto:${email}?subject=${encodeURIComponent(subject)}`;

// Relative prefix from a page back to the site root, so dist/ works on any host or sub-path.
const prefixFor = (slug) => (slug ? "../../" : "../");

const icon = {
  menu: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
};

// --- Layout -----------------------------------------------------------------

function layout({ t, slug, title, description, body }) {
  const p = prefixFor(slug);
  const link = (s) => `${p}${pagePath(t.lang, s)}`;
  const other = t.lang === "en" ? no : en;

  const navItems = NAV.map(
    (s) =>
      `<li><a href="${link(s)}"${s === slug ? ' aria-current="page"' : ""}>${t.nav[s]}</a></li>`
  ).join("");

  const langLink = (c) =>
    `<a href="${p}${pagePath(c.lang, slug)}" hreflang="${c.hreflang}" lang="${c.htmlLang}"${
      c.lang === t.lang ? ' aria-current="true"' : ""
    }><span aria-hidden="true">${c.lang.toUpperCase()}</span><span class="visually-hidden">${
      c.lang === "en" ? "English" : "Norsk"
    }</span></a>`;

  const alternates = [en, no]
    .map((c) => `<link rel="alternate" hreflang="${c.hreflang}" href="${absUrl(c.lang, slug)}">`)
    .join("\n  ");

  const analytics = config.plausibleDomain
    ? `\n  <script defer data-domain="${esc(config.plausibleDomain)}" src="https://plausible.io/js/script.js"></script>`
    : "";

  const footerLinks = ["", ...NAV]
    .map((s) => `<li><a href="${link(s)}">${t.nav[s || "home"]}</a></li>`)
    .join("");

  return `<!doctype html>
<html lang="${t.htmlLang}" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${absUrl(t.lang, slug)}">
  ${alternates}
  <link rel="alternate" hreflang="x-default" href="${absUrl("en", slug)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${absUrl(t.lang, slug)}">
  <meta property="og:locale" content="${t.lang === "en" ? "en_GB" : "nb_NO"}">
  <meta name="theme-color" content="#f7f6f3" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#0d0e10" media="(prefers-color-scheme: dark)">
  <link rel="icon" href="${p}assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${p}assets/site.css">
  <script>document.documentElement.className = "js";</script>
  <script defer src="${p}assets/site.js"></script>${analytics}
</head>
<body>
  <a class="skip-link" href="#main">${t.ui.skip}</a>
  <header class="site-header">
    <div class="wrap header-inner">
      <a class="brand" href="${link("")}">Arianne Villaluna</a>
      <nav class="nav" id="site-nav" aria-label="${t.ui.mainNav}">
        <ul>${navItems}</ul>
      </nav>
      <div class="lang-switch" role="group" aria-label="${t.ui.language}" data-active="${t.lang}">
        ${langLink(en)}${langLink(no)}
      </div>
      <a class="btn btn-primary btn-sm header-cta" href="${link("contact")}">${t.ui.book}</a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
        ${icon.menu}<span class="visually-hidden">${t.ui.menu}</span>
      </button>
    </div>
  </header>

  <main id="main">
${body}
${slug === "contact" ? "" : ctaBand(t, link)}
  </main>

  <footer class="site-footer">
    <div class="wrap footer-inner">
      <p style="margin:0">© ${new Date().getFullYear()} ${t.name} · ${t.ui.footerNote}</p>
      <ul>${footerLinks}<li><a href="${p}${pagePath(other.lang, slug)}" hreflang="${other.hreflang}" lang="${other.htmlLang}">${other.lang === "en" ? "English" : "Norsk"}</a></li></ul>
    </div>
  </footer>
</body>
</html>
`;
}

function ctaBand(t, link) {
  return `
    <section class="section section-alt cta-band" aria-labelledby="cta-title">
      <div class="wrap reveal">
        <h2 id="cta-title">${t.cta.title}</h2>
        <p>${t.cta.text}</p>
        <div class="btn-row">
          <a class="btn btn-primary" href="${link("contact")}">${t.ui.book}</a>
          <a class="btn btn-ghost" href="${mailto(t.contact.details.emailSubject)}">${t.cta.secondary}</a>
        </div>
      </div>
    </section>`;
}

const hero = (h, extra = "", cls = "hero-sub") => `
    <section class="hero ${cls}">
      <div class="wrap">
        <span class="eyebrow reveal">${h.eyebrow}</span>
        <h1 class="reveal" data-delay="1">${h.h1}</h1>
        <p class="lead reveal" data-delay="2">${h.lead}</p>
        ${extra}
      </div>
    </section>`;

const cvLink = (t, p, cls = "btn btn-ghost") =>
  hasCv
    ? `<a class="${cls}" href="${p}assets/cv/${config.cvFile}" download>${t.ui.downloadCv}</a>`
    : `<a class="${cls}" href="${mailto(t.contact.details.cvSubject)}">${t.ui.requestCv}</a>`;

// --- Pages ------------------------------------------------------------------

function home(t, link) {
  const h = t.home;
  const stats = h.stats
    .map(
      (s, i) => `
          <div class="stat reveal" data-delay="${i}">
            <span class="stat-value">${s.value}</span>
            <span class="stat-label">${s.label}</span>
          </div>`
    )
    .join("");

  const fixCards = h.fix.items
    .map(
      (it, i) => `
          <a class="card reveal" data-delay="${i}" href="${link("services")}">
            <span class="card-num">0${i + 1}</span>
            <h3>${it.title}</h3>
            <p>${it.text}</p>
          </a>`
    )
    .join("");

  const caseCards = t.work.cases
    .map(
      (c, i) => `
          <a class="card reveal" data-delay="${i}" href="${link("work")}#${c.id}">
            <span class="tag">${c.tag}</span>
            <h3>${c.title}</h3>
            <p>${c.summary}</p>
            <span class="arrow-link" style="margin-top:auto">${t.ui.readCase}</span>
          </a>`
    )
    .join("");

  return `${hero(
    h.hero,
    `<div class="btn-row reveal" data-delay="3">
          <a class="btn btn-primary" href="${link("contact")}">${t.ui.book}</a>
          <a class="btn btn-ghost" href="${link("work")}">${t.ui.seeWork}</a>
        </div>`,
    ""
  )}

    <section class="section" style="padding-top:0">
      <div class="wrap">
        <div class="stats">${stats}
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="fix-title">
      <div class="wrap">
        <div class="section-head reveal">
          <span class="eyebrow">${h.fix.eyebrow}</span>
          <h2 id="fix-title">${h.fix.title}</h2>
          <p>${h.fix.text}</p>
        </div>
        <div class="grid grid-3">${fixCards}
        </div>
        <p class="reveal" style="margin-top:32px"><a class="arrow-link" href="${link("services")}">${t.ui.seeServices}</a></p>
      </div>
    </section>

    <section class="section section-alt" aria-labelledby="work-title">
      <div class="wrap">
        <div class="section-head reveal">
          <span class="eyebrow">${h.work.eyebrow}</span>
          <h2 id="work-title">${h.work.title}</h2>
        </div>
        <div class="grid grid-3">${caseCards}
        </div>
      </div>
    </section>

    <section class="section" aria-label="${h.strip.label}">
      <div class="wrap">
        <div class="strip reveal">
          <span>${h.strip.label}</span>
          ${h.strip.items.map((x) => `<strong>${x}</strong>`).join("\n          ")}
          <a class="arrow-link" href="${link("about")}" style="margin-left:auto">${t.ui.moreAboutMe}</a>
        </div>
        <div class="personal-note reveal" style="margin-top:40px">
          <span class="emoji" aria-hidden="true">🌲</span>
          <p>${h.personal.text}</p>
          <a class="arrow-link" href="${link("beyond")}">${t.ui.beyondLink}</a>
        </div>
      </div>
    </section>`;
}

function services(t) {
  const s = t.services;
  const cards = s.items
    .map(
      (it, i) => `
          <article class="card reveal" data-delay="${i % 3}">
            <span class="card-num">0${i + 1}</span>
            ${it.tag ? `<span class="tag">${it.tag}</span>` : ""}
            <h3>${it.title}</h3>
            <p>${it.text}</p>
            <ul class="list-clean">${it.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
            <p class="proof"><span class="visually-hidden">${s.proofLabel}: </span>${it.proof}</p>
          </article>`
    )
    .join("");

  const steps = s.process.steps
    .map((st) => `<li class="reveal"><h3>${st.title}</h3><p>${st.text}</p></li>`)
    .join("");

  return `${hero(s.hero)}

    <section class="section" aria-label="${t.nav.services}" style="padding-top:0">
      <div class="wrap">
        <div class="grid grid-3">${cards}
        </div>
      </div>
    </section>

    <section class="section section-alt" aria-labelledby="process-title">
      <div class="wrap">
        <div class="section-head reveal">
          <span class="eyebrow">${s.process.eyebrow}</span>
          <h2 id="process-title">${s.process.title}</h2>
        </div>
        <ol class="steps">${steps}</ol>
      </div>
    </section>

    <section class="section" aria-labelledby="fit-title">
      <div class="wrap reveal">
        <h2 id="fit-title" style="font-size:var(--step-2)">${s.fit.title}</h2>
        <ul class="list-clean" style="font-size:var(--step-1)">${s.fit.items.map((x) => `<li>${x}</li>`).join("")}</ul>
      </div>
    </section>`;
}

function work(t) {
  const w = t.work;
  const cases = w.cases
    .map(
      (c) => `
        <article class="case" id="${c.id}" aria-labelledby="${c.id}-title">
          <div class="case-head reveal">
            <span class="tag">${c.tag}</span>
            <h2 id="${c.id}-title">${c.title}</h2>
            <span class="case-meta">${c.meta}</span>
          </div>
          <div class="case-body">
            <div class="reveal"><h3>${w.labels.problem}</h3><p>${c.problem}</p></div>
            <div class="reveal" data-delay="1"><h3>${w.labels.approach}</h3><ul>${c.approach
              .map((a) => `<li>${a}</li>`)
              .join("")}</ul></div>
            <div class="reveal" data-delay="2"><h3>${w.labels.outcome}</h3><p>${c.outcome}</p></div>
          </div>
          <div class="case-figures reveal">${c.figures
            .map((f) => `<div><strong>${f.value}</strong><span>${f.label}</span></div>`)
            .join("")}</div>
        </article>`
    )
    .join("");

  return `${hero(w.hero)}

    <section class="section" style="padding-top:0">
      <div class="wrap">${cases}
      </div>
    </section>`;
}

function about(t, link, p) {
  const a = t.about;
  const portrait = hasHeadshot
    ? `<img src="${p}assets/img/${config.headshot}" alt="${esc(a.portraitAlt)}" width="760" height="950">`
    : `<span class="monogram" role="img" aria-label="${esc(a.portraitAlt)}">AV</span>`;

  const chapters = a.chapters
    .map(
      (c) => `
          <li class="reveal">
            <span class="when">${c.when}</span>
            <h3>${c.title}</h3>
            <span class="where">${c.where}</span>
            <ul>${c.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
          </li>`
    )
    .join("");

  return `
    <section class="hero hero-sub">
      <div class="wrap about-intro">
        <div>
          <span class="eyebrow reveal">${a.hero.eyebrow}</span>
          <h1 class="reveal" data-delay="1">${a.hero.h1}</h1>
          <p class="lead reveal" data-delay="2">${a.hero.lead}</p>
        </div>
        <div class="portrait reveal" data-delay="2">${portrait}</div>
      </div>
    </section>

    <section class="section" aria-labelledby="story-title" style="padding-top:0">
      <div class="wrap">
        <h2 id="story-title" class="reveal" style="font-size:var(--step-3);margin-bottom:56px">${a.storyTitle}</h2>
        <ol class="timeline">${chapters}
        </ol>
      </div>
    </section>

    <section class="section section-alt" aria-labelledby="cred-title">
      <div class="wrap">
        <h2 id="cred-title" class="reveal" style="font-size:var(--step-2)">${a.credentials.title}</h2>
        <ul class="chips reveal">${a.credentials.items.map((c) => `<li>${c}</li>`).join("")}</ul>
      </div>
    </section>

    <section class="section" aria-labelledby="words-title">
      <div class="wrap grid grid-2" style="gap:48px;align-items:end">
        <div class="reveal">
          <span class="eyebrow" id="words-title">${a.words.title}</span>
          <p class="words">${a.words.items.map((w) => `<span>${w}</span>`).join("")}</p>
        </div>
        <div class="reveal" data-delay="1">
          <h2 style="font-size:var(--step-2)">${a.cv.title}</h2>
          <p class="muted">${a.cv.text}</p>
          ${cvLink(t, p)}
        </div>
      </div>
    </section>`;
}

function beyond(t) {
  const b = t.beyond;
  const blocks = b.blocks
    .map(
      (bl) => `
        <div class="beyond-block reveal">
          <div><span class="emoji" aria-hidden="true">${bl.emoji}</span><h2>${bl.title}</h2></div>
          <div>
            <p class="lead" style="margin-bottom:0.8em">${bl.text}</p>
            ${bl.bullets.length ? `<ul class="list-clean">${bl.bullets.map((x) => `<li>${x}</li>`).join("")}</ul>` : ""}
          </div>
        </div>`
    )
    .join("");

  const gallery = b.gallery.items
    .map(
      (label, i) => `
          <figure class="reveal" data-delay="${i % 3}">
            <div class="ph">${b.gallery.placeholder}</div>
            <figcaption>${label}</figcaption>
          </figure>`
    )
    .join("");

  return `${hero(b.hero)}

    <section class="section" style="padding-top:0">
      <div class="wrap">${blocks}
      </div>
    </section>

    <section class="section section-alt" aria-labelledby="gallery-title">
      <div class="wrap">
        <div class="section-head reveal">
          <span class="eyebrow" aria-hidden="true">🎨</span>
          <h2 id="gallery-title">${b.gallery.title}</h2>
          <p>${b.gallery.text}</p>
        </div>
        <div class="gallery">${gallery}
        </div>
      </div>
    </section>`;
}

function contact(t, link, p) {
  const c = t.contact;
  const booking = config.bookingUrl
    ? `<iframe class="booking-frame" src="${esc(config.bookingUrl)}" title="${c.booking.frameTitle}" loading="lazy"></iframe>`
    : `<div class="card">
            <h2 style="font-size:var(--step-2)">${c.booking.fallbackTitle}</h2>
            <p>${c.booking.fallbackText}</p>
            <div class="btn-row"><a class="btn btn-primary" href="${mailto(c.details.emailSubject)}">${c.booking.fallbackButton}</a></div>
          </div>`;

  const items = [
    `<li><span class="label">${c.details.email}</span><a href="mailto:${email}">${email}</a></li>`,
    config.linkedin
      ? `<li><span class="label">${c.details.linkedin}</span><a href="${esc(config.linkedin)}" rel="me noopener" target="_blank">${esc(
          config.linkedin.replace(/^https?:\/\/(www\.)?/, "")
        )}</a></li>`
      : "",
    `<li><span class="label">${c.details.cv}</span>${cvLink(t, p, "")}</li>`,
    `<li><span class="label">${c.details.location}</span>${c.details.locationValue}</li>`,
  ].join("");

  return `${hero(c.hero)}

    <section class="section" style="padding-top:0">
      <div class="wrap contact-grid">
        <div class="reveal">${booking}</div>
        <div class="reveal" data-delay="1">
          <h2 style="font-size:var(--step-1)">${c.details.title}</h2>
          <ul class="contact-list">${items}</ul>
          <p class="signoff" lang="nb">${c.signoff}</p>
          ${c.signoffNote ? `<p class="muted">${c.signoffNote}</p>` : ""}
        </div>
      </div>
    </section>`;
}

const RENDER = { "": home, services, work, about, beyond, contact };
const META = { "": "home", services: "services", work: "work", about: "about", beyond: "beyond", contact: "contact" };

// --- Build ------------------------------------------------------------------

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(STATIC, OUT, { recursive: true });

let count = 0;
for (const t of Object.values(LANGS)) {
  for (const slug of PAGES) {
    const p = prefixFor(slug);
    const link = (s) => `${p}${pagePath(t.lang, s)}`;
    const m = t[META[slug]];
    const html = layout({ t, slug, title: m.title, description: m.description, body: RENDER[slug](t, link, p) });
    const dir = join(OUT, pagePath(t.lang, slug));
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), html);
    count++;
  }
}

// Root: send visitors to /no/ if their browser prefers Norwegian (or they chose it before), else /en/.
writeFileSync(
  join(OUT, "index.html"),
  `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Arianne A. Villaluna</title>
  <link rel="canonical" href="${absUrl("en", "")}">
  <link rel="alternate" hreflang="en" href="${absUrl("en", "")}">
  <link rel="alternate" hreflang="nb" href="${absUrl("no", "")}">
  <link rel="alternate" hreflang="x-default" href="${absUrl("en", "")}">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <script>
    (function () {
      var lang;
      try { lang = localStorage.getItem("lang"); } catch (e) {}
      if (lang !== "en" && lang !== "no") {
        var prefs = navigator.languages || [navigator.language || ""];
        lang = /^(nb|nn|no)\\b/i.test(prefs[0] || "") ? "no" : "en";
      }
      location.replace(lang + "/");
    })();
  </script>
  <noscript><meta http-equiv="refresh" content="0; url=en/"></noscript>
  <style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#f7f6f3;color:#121314}@media(prefers-color-scheme:dark){body{background:#0d0e10;color:#f2f1ee}a{color:#8db8ea}}</style>
</head>
<body>
  <p><a href="en/">English</a> · <a href="no/" hreflang="nb" lang="nb">Norsk</a></p>
</body>
</html>
`
);

// 404 for static hosts that support it (GitHub Pages, Netlify, Cloudflare Pages).
writeFileSync(
  join(OUT, "404.html"),
  `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Page not found — Arianne A. Villaluna</title>
  <link rel="stylesheet" href="/assets/site.css">
</head>
<body>
  <main class="wrap hero">
    <span class="eyebrow">404</span>
    <h1>This page got lost in a handover.</h1>
    <p class="lead">Siden finnes ikke.</p>
    <div class="btn-row"><a class="btn btn-primary" href="/en/">Home</a><a class="btn btn-ghost" href="/no/" lang="nb">Hjem</a></div>
  </main>
</body>
</html>
`
);

const urls = PAGES.flatMap((slug) =>
  [en, no].map(
    (t) => `  <url>
    <loc>${absUrl(t.lang, slug)}</loc>
${[en, no].map((c) => `    <xhtml:link rel="alternate" hreflang="${c.hreflang}" href="${absUrl(c.lang, slug)}"/>`).join("\n")}
  </url>`
  )
);
writeFileSync(
  join(OUT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`
);
writeFileSync(join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${config.siteUrl}/sitemap.xml\n`);

console.log(`Built ${count} pages into dist/`);
if (warnings.length) {
  console.log("\nBefore launch:");
  for (const w of warnings) console.log(`  - ${w}`);
}
