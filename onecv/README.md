# OneCV landing page

Smoke-test landing page for OneCV, deployed on Vercel as the `onecv-landing` project
(https://onecv-landing.vercel.app).

- `index.html` – the landing page (sign-up form + pricing question)
- `api/event.js` – records visits, sign-ups, pricing answers and email removals
- `api/stats.js` – results page at `/api/stats?key=STATS_KEY`
  - `&emails=1` lists sign-ups with Edit / Delete buttons
  - `&format=xlsx` downloads an Excel export, `&format=json` returns raw numbers

Data is stored in the private Vercel Blob store `onecv-landing-blob`, not in this repo.
The project needs two environment variables in Vercel: `BLOB_READ_WRITE_TOKEN`
(added automatically by connecting the Blob store) and `STATS_KEY` (the results-page password).

Track channels by sharing links with `?src=<channel>`, e.g. `/?src=instagram`.

The landing page is in English and Norwegian (Bokmål), with an EN/NO switch in the top corner.
It picks Norwegian automatically for Norwegian browsers and remembers the visitor's choice.
Force a language with `?lang=no` or `?lang=en` (combine with src: `/?src=instagram&lang=no`).
Norwegian texts live in the `T.no` dictionary in `index.html`; English comes from the page itself.

To redeploy, set this folder as the project's root directory in Vercel, or run
`vercel deploy --prod` from inside it.
