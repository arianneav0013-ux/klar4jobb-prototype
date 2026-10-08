// Site-wide settings. Everything marked TODO must be filled in before launch.
// `npm run build` (or `node build.mjs`) prints a warning for each empty value.

export default {
  // Public origin, no trailing slash. Used for canonical + hreflang URLs and the sitemap.
  siteUrl: "https://ariannevillaluna.com", // TODO: confirm domain (.com or .no)

  // Contact details
  email: "", // TODO: e.g. "hello@ariannevillaluna.com"
  linkedin: "", // TODO: full LinkedIn profile URL

  // Cal.com or Calendly scheduling page, e.g. "https://cal.com/arianne/30min".
  // When empty, the contact page shows an email fallback instead of the embed.
  bookingUrl: "", // TODO

  // Secret Identity form: a Formspree (https://formspree.io/f/xxxx) or Web3Forms-style
  // endpoint that accepts a JSON POST. Empty = the form opens a pre-filled email instead.
  formEndpoint: "", // TODO

  // Plausible analytics domain (e.g. "ariannevillaluna.com"). Empty = no analytics script.
  plausibleDomain: "",

  // Drop the PDF at static/assets/cv/<cvFile>. When the file is missing, the site
  // shows "Request my CV" (email) instead of a broken download link.
  cvFile: "Arianne-Villaluna-CV-EN.pdf",

  // Drop a square headshot at static/assets/img/<headshot>. Missing = monogram placeholder.
  headshot: "headshot.jpg",
};
