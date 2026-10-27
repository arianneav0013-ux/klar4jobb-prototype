import { list, put, del } from '@vercel/blob';
import ExcelJS from 'exceljs';

const authed = url => process.env.STATS_KEY && url.searchParams.get('key') === process.env.STATS_KEY;
const PLANS = ['free', 'basic49', 'premium99', 'notsure'];
const PROFILES = ['bachelor', 'master_phd', 'recent_grad', 'working', 'other'];
const APPLYING = ['active', 'soon', 'no'];
const SEGMENT = ['bachelor', 'master_phd', 'recent_grad']; // the target group ("in segment")
const NONE = 'none';
const cleanId = s => String(s || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);

async function readBlob(b) {
  const r = await fetch(b.url, { headers: { authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` } });
  return r.json();
}

// Admin actions from the results page: delete a sign-up entirely, or fix its email address.
export async function POST(request) {
  const url = new URL(request.url);
  if (!authed(url)) return new Response('Not found', { status: 404 });
  const f = await request.formData();
  const id = cleanId(f.get('id'));
  if (!id) return new Response('Missing id', { status: 400 });
  const found = (await list({ prefix: `emails/${id}.json` })).blobs[0];
  if (!found) return new Response('Sign-up not found', { status: 404 });
  const rec = await readBlob(found);
  if (f.get('action') === 'delete') {
    const src = cleanId(rec.src) || 'direct';
    const paths = [`signups/${src}/${id}.json`,
      ...PLANS.map(p => `plans/${p}/${src}/${id}.json`),
      ...PROFILES.map(p => `profiles/${p}/${src}/${id}.json`),
      ...APPLYING.map(a => `applying/${a}/${src}/${id}.json`)];
    const hits = (await Promise.all(paths.map(p => list({ prefix: p })))).flatMap(r => r.blobs);
    await del([found.url, ...hits.map(b => b.url)]);
  } else if (f.get('action') === 'edit') {
    const email = String(f.get('email') || '').trim().slice(0, 200);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return new Response('Invalid email', { status: 400 });
    await put(`emails/${id}.json`, JSON.stringify({ ...rec, email }),
      { access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' });
  } else {
    return new Response('Unknown action', { status: 400 });
  }
  return new Response(null, { status: 303, headers: { location: `/api/stats?key=${encodeURIComponent(url.searchParams.get('key'))}&emails=1` } });
}

async function all(prefix) {
  const out = [];
  let cursor;
  do {
    const r = await list({ prefix, cursor, limit: 1000 });
    out.push(...r.blobs);
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);
  return out;
}

const seg = (p, i) => p.split('/')[i];
const tally = (blobs, i) => blobs.reduce((m, b) => { const k = seg(b.pathname, i); m[k] = (m[k] || 0) + 1; return m; }, {});
const pct = (a, b) => (b ? ((100 * a) / b).toFixed(1) + '%' : '–');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// Answer blobs are stored as {question}/{code}/{src}/{id}.json; map each sign-up id to its code.
const codeById = blobs => Object.fromEntries(blobs.map(b => [seg(b.pathname, 3).replace(/\.json$/, ''), seg(b.pathname, 1)]));
// Visit file names start with a millisecond timestamp; newer ones also carry __r-{referrer}__d-{device}__b-{y|n}.
const visitInfo = b => {
  const [rid, ...parts] = seg(b.pathname, 2).replace(/\.json$/, '').split('__');
  const v = { src: seg(b.pathname, 1), ts: Number(rid.split('-')[0]), ref: null, dev: null, bot: null };
  parts.forEach(p => { const val = p.slice(2); if (p[0] === 'r') v.ref = val; if (p[0] === 'd') v.dev = val; if (p[0] === 'b') v.bot = val; });
  return v;
};
const osloDay = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Oslo' });
const dayOf = ts => (Number.isFinite(ts) && ts > 0 ? osloDay.format(new Date(ts)) : 'unknown');
const DEVICES = ['mobile', 'desktop', 'tablet'];
const refLabel = r => (r === 'none' ? 'none (typed, QR code, app or bookmark)' : r);
const PLAN_LABELS = { free: 'Free (0 kr)', basic49: 'Basic (49 kr/mo)', premium99: 'Premium (99 kr/mo)', notsure: "Wouldn't use it / not sure" };
const PROFILE_LABELS = { bachelor: "Bachelor's student", master_phd: "Master's or PhD student", recent_grad: 'Graduated in the last 2 years',
  working: 'Working / graduated more than 2 years ago', other: 'Other' };
const APPLYING_LABELS = { active: 'Yes, actively', soon: 'Within the next 6 months', no: 'No' };
const SHORT = { bachelor: 'Bachelor', master_phd: 'Master/PhD', recent_grad: 'Recent grad', working: 'Working', other: 'Other',
  active: 'Actively', soon: 'Within 6 months', no: 'No', [NONE]: 'No answer', segment: 'In segment' };
const SEGMENT_NOTE = 'In segment = bachelor + master/PhD + graduated in the last 2 years';

export async function GET(request) {
  const url = new URL(request.url);
  if (!authed(url)) {
    return new Response('Not found', { status: 404 });
  }
  const [visits, signups, plans, removed, profiles, applying] = await Promise.all(
    ['visits/', 'signups/', 'plans/', 'removed/', 'profiles/', 'applying/'].map(all));
  const vBy = tally(visits, 1), sBy = tally(signups, 1), pBy = tally(plans, 1), rBy = tally(removed, 1);
  const paid = (pBy.basic49 || 0) + (pBy.premium99 || 0);
  const answered = plans.length;
  const srcs = [...new Set([...Object.keys(vBy), ...Object.keys(sBy)])].sort();

  // One row per sign-up with its answers (or "none"), used for the question tables and breakdowns.
  const planOf = codeById(plans), profileOf = codeById(profiles), applyingOf = codeById(applying);
  const people = signups.map(b => {
    const id = seg(b.pathname, 2).replace(/\.json$/, '');
    return { id, src: seg(b.pathname, 1), plan: planOf[id] || NONE, profile: profileOf[id] || NONE, applying: applyingOf[id] || NONE };
  });
  const inSeg = p => SEGMENT.includes(p.profile);
  const segmentCount = people.filter(inSeg).length;
  const count = (rows, field, code) => rows.filter(p => p[field] === code).length;
  // Column groups for breakdowns: each answer code, "no answer", and the in-segment total for Q1.
  const profileCols = [...PROFILES, NONE].map(c => ({ key: c, test: p => p.profile === c })).concat([{ key: 'segment', test: inSeg }]);
  const applyingCols = [...APPLYING, NONE].map(c => ({ key: c, test: p => p.applying === c }));
  const planRows = [...PLANS.map(c => [PLAN_LABELS[c], c]), ['No answer', NONE]];
  const crossTab = cols => planRows.map(([label, c]) => [label, ...cols.map(col => people.filter(p => col.test(p) && p.plan === c).length)]);
  const colTotals = cols => cols.map(col => people.filter(col.test).length);
  const bySource = [...new Set(people.map(p => p.src))].sort()
    .map(s => { const rows = people.filter(p => p.src === s); return [s, ...profileCols.map(col => rows.filter(col.test).length), rows.length]; });

  // Visits by day (all visits) and visit details (only visits recorded since details were added).
  const vinfo = visits.map(visitInfo);
  const detailed = vinfo.filter(v => v.dev);
  const visitSrcs = [...new Set(vinfo.map(v => v.src))].sort();
  const signupDay = p => dayOf(Number(p.id.split('-')[0]));
  const days = [...new Set([...vinfo.map(v => dayOf(v.ts)), ...people.map(signupDay)])].sort().reverse();
  const byDay = days.map(d => { const vs = vinfo.filter(v => dayOf(v.ts) === d);
    return [d, ...visitSrcs.map(s => vs.filter(v => v.src === s).length), vs.length, people.filter(p => signupDay(p) === d).length]; });
  const detailRow = vs => [vs.length, ...DEVICES.map(c => vs.filter(v => v.dev === c).length), vs.filter(v => v.bot === 'y').length];
  const countBy = (vs, f) => vs.reduce((m, v) => { m[v[f]] = (m[v[f]] || 0) + 1; return m; }, {});
  const refCounts = countBy(detailed, 'ref');
  const byRef = Object.keys(refCounts).sort((a, b) => refCounts[b] - refCounts[a])
    .map(r => { const vs = detailed.filter(v => v.ref === r); return [refLabel(r), ...detailRow(vs), [...new Set(vs.map(v => v.src))].sort().join(', ')]; });
  const byChanDetail = visitSrcs.map(s => { const vs = detailed.filter(v => v.src === s); const rc = countBy(vs, 'ref');
    const top = Object.keys(rc).sort((a, b) => rc[b] - rc[a])[0];
    return [s, vinfo.filter(v => v.src === s).length, ...detailRow(vs), top ? refLabel(top) : '–']; });
  const DETAIL_NOTE = `Only visits recorded since visit details were added have a referrer, device and bot flag (${detailed.length} of ${vinfo.length} visits). Likely bots are counted, not removed, so totals stay comparable.`;

  let emails = [];
  const format = url.searchParams.get('format');
  if (url.searchParams.get('emails') === '1' || format === 'xlsx') {
    const eb = await all('emails/');
    emails = await Promise.all(eb.map(async b => {
      try {
        return { ...(await readBlob(b)), id: b.pathname.slice('emails/'.length, -'.json'.length) };
      } catch { return { email: '(unreadable)', src: '', ts: '', id: b.pathname.slice('emails/'.length, -'.json'.length) }; }
    }));
    emails.sort((a, b) => String(a.ts).localeCompare(String(b.ts)));
  }

  if (format === 'xlsx') {
    const wb = new ExcelJS.Workbook();
    const sheet = (name, cols, rows, pctCols = []) => {
      const ws = wb.addWorksheet(name);
      ws.columns = cols.map(([header, width]) => ({ header, width }));
      ws.getRow(1).font = { bold: true };
      ws.views = [{ state: 'frozen', ySplit: 1 }];
      rows.forEach(r => ws.addRow(r));
      pctCols.forEach(i => { ws.getColumn(i).numFmt = '0.0%'; });
      return ws;
    };
    const ratio = (a, b) => (b ? a / b : null);
    const n = signups.length;
    const summary = sheet('Summary', [['Metric', 36], ['Value', 14]], [
      ['Unique visitors', visits.length], ['Sign-ups', n],
      ['Sign-up rate', ratio(n, visits.length)],
      ['In segment (sign-ups)', segmentCount], ['In segment share of sign-ups', ratio(segmentCount, n)],
      ['Answered pricing question', answered], ['Would pick a paid plan', paid],
      ['Paid share of answers', ratio(paid, answered)],
      ['Removed email after debrief', removed.length],
      ['Exported (UTC)', new Date().toISOString().slice(0, 16).replace('T', ' ')],
    ]);
    summary.getColumn(2).eachCell((c, i) => { if ([4, 6, 9].includes(i)) c.numFmt = '0.0%'; });
    sheet('By channel', [['Source', 20], ['Visitors', 12], ['Sign-ups', 12], ['Sign-up rate', 14], ['Removed', 12]],
      srcs.map(s => [s, vBy[s] || 0, sBy[s] || 0, ratio(sBy[s] || 0, vBy[s] || 0), rBy[s] || 0]), [4]);
    const answerSheet = (name, labels, field, extra = []) => sheet(name, [['Answer', 44], ['Count', 10], ['% of sign-ups', 14]],
      [...Object.keys(labels).map(c => [labels[c], count(people, field, c), ratio(count(people, field, c), n)]),
       ['No answer', count(people, field, NONE), ratio(count(people, field, NONE), n)], ...extra], [3]);
    answerSheet('Describes you', PROFILE_LABELS, 'profile', [[], [SEGMENT_NOTE, segmentCount, ratio(segmentCount, n)]]);
    answerSheet('Applying', APPLYING_LABELS, 'applying');
    sheet('Pricing', [['Answer', 30], ['Count', 10], ['Share of answers', 18]],
      [...Object.keys(PLAN_LABELS).map(p => [PLAN_LABELS[p], pBy[p] || 0, ratio(pBy[p] || 0, answered)]),
       ['Skipped the question', Math.max(0, n - answered), null]], [3]);
    const crossSheet = (name, cols) => sheet(name, [['Pricing answer (counts)', 30], ...cols.map(c => [SHORT[c.key], 14])],
      [...crossTab(cols), ['Total', ...colTotals(cols)]]);
    crossSheet('Pricing by segment', profileCols);
    crossSheet('Pricing by applying', applyingCols);
    sheet('Visits by day', [['Date (Oslo)', 14], ...visitSrcs.map(s => [s, 12]), ['All visits', 12], ['Sign-ups', 10]], byDay);
    sheet('Visit sources', [['Referring site', 38], ['Visits', 10], ['Mobile', 10], ['Desktop', 10], ['Tablet', 10], ['Likely bots', 12], ['Channels', 30]],
      [...byRef, [], [DETAIL_NOTE]]);
    sheet('Visit details by channel', [['Source', 20], ['All visits', 12], ['With details', 13], ['Mobile', 10], ['Desktop', 10], ['Tablet', 10], ['Likely bots', 12], ['Top referring site', 38]],
      [...byChanDetail, [], [DETAIL_NOTE]]);
    sheet('Segment by channel', [['Source', 20], ...profileCols.map(c => [SHORT[c.key], 14]), ['Sign-ups', 12]], bySource);
    const person = Object.fromEntries(people.map(p => [p.id, p]));
    const label = (labels, code) => labels[code] || '';
    sheet('Sign-ups', [['Time (UTC)', 18], ['Email', 34], ['Source', 14], ['Describes you', 34], ['Applying', 24], ['Pricing answer', 28]],
      emails.map(e => { const p = person[e.id] || {};
        return [String(e.ts).slice(0, 16).replace('T', ' '), e.email, e.src,
          label(PROFILE_LABELS, p.profile), label(APPLYING_LABELS, p.applying), label(PLAN_LABELS, p.plan)]; }));
    const buf = await wb.xlsx.writeBuffer();
    return new Response(buf, { headers: {
      'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'content-disposition': `attachment; filename="onecv-results-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      'cache-control': 'no-store' } });
  }

  if (format === 'json') {
    return Response.json({ visits: vBy, signups: sBy, plans: pBy, removed: rBy,
      profiles: Object.fromEntries([...PROFILES, NONE].map(c => [c, count(people, 'profile', c)])),
      applying: Object.fromEntries([...APPLYING, NONE].map(c => [c, count(people, 'applying', c)])),
      totals: { visits: visits.length, signups: signups.length, inSegment: segmentCount, answered, paid, removed: removed.length }, emails });
  }

  const n = signups.length;
  const row = s => `<tr><td>${esc(s)}</td><td>${vBy[s] || 0}</td><td>${sBy[s] || 0}</td><td>${pct(sBy[s] || 0, vBy[s] || 0)}</td><td>${rBy[s] || 0}</td></tr>`;
  const answerTable = (labels, field, extra = '') => `<table><tr><th>Answer</th><th>Count</th><th>% of sign-ups</th></tr>
${Object.keys(labels).map(c => `<tr><td>${esc(labels[c])}</td><td>${count(people, field, c)}</td><td>${pct(count(people, field, c), n)}</td></tr>`).join('')}
<tr class="na"><td>No answer</td><td>${count(people, field, NONE)}</td><td>${pct(count(people, field, NONE), n)}</td></tr>${extra}</table>`;
  // Breakdown tables: each cell is a count, with its share of that column underneath.
  const crossTable = (first, cols, rows, totals, lastHead) => `<div class="wide"><table class="x"><tr><th>${first}</th>${cols.map(c => `<th${c.key === 'segment' ? ' class="seg"' : ''}>${SHORT[c.key]}</th>`).join('')}${lastHead ? `<th>${lastHead}</th>` : ''}</tr>
${rows.map(r => `<tr><td>${esc(r[0])}</td>${r.slice(1).map((v, i) => `<td${cols[i] && cols[i].key === 'segment' ? ' class="seg"' : ''}>${v}${totals && totals[i] ? `<small>${pct(v, totals[i])}</small>` : ''}</td>`).join('')}</tr>`).join('')}
${totals ? `<tr class="tot"><td>Total</td>${totals.map((t, i) => `<td${cols[i].key === 'segment' ? ' class="seg"' : ''}>${t}</td>`).join('')}</tr>` : ''}</table></div>`;
  const simple = (head, rows) => `<div class="wide"><table class="x"><tr>${head.map(h => `<th>${esc(h)}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table></div>`;
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>OneCV results</title>
<style>body{font:15px/1.5 system-ui,sans-serif;max-width:860px;margin:32px auto;padding:0 16px;color:#1d1b18;background:#f7f5f0}table{border-collapse:collapse;width:100%;margin:8px 0 28px;background:#fff}td,th{border:1px solid #e3ded4;padding:8px 10px;text-align:left}th{background:#eee9df}.k{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:16px 0 28px}.k div{background:#fff;border:1px solid #e3ded4;border-radius:10px;padding:12px}.k b{display:block;font-size:24px}.n{color:#5f5a52;font-size:13px}form{margin:0}.f{display:flex;gap:6px}.f input{flex:1;min-width:0;font:inherit;padding:4px 6px;border:1px solid #e3ded4;border-radius:6px}button{font:inherit;padding:4px 10px;border:1px solid #e3ded4;border-radius:6px;background:#fff;cursor:pointer}.del{color:#a3322d}.na td,.tot td{color:#5f5a52}.tot td,.segrow td{font-weight:600}.segrow td{background:#e7efe9}.wide{overflow-x:auto;margin:8px 0 28px}.wide table{margin:0}.x td,.x th{white-space:nowrap;font-size:14px}.x td small{display:block;color:#5f5a52;font-size:12px}.x .seg{background:#e7efe9}h3{margin:20px 0 4px;font-size:16px}</style>
<h1>OneCV smoke test results</h1><p>As of ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC · <a href="?key=${esc(encodeURIComponent(url.searchParams.get('key')))}&format=xlsx">Download Excel (.xlsx)</a></p>
<div class="k">
<div>Unique visitors<b>${visits.length}</b>Pass: 100+</div>
<div>Sign-ups<b>${n}</b>Rate ${pct(n, visits.length)} (pass: 15%+)</div>
<div>In segment<b>${segmentCount}</b>${pct(segmentCount, n)} of sign-ups</div>
<div>Would pick a paid plan<b>${paid}</b>${pct(paid, answered)} of those who answered</div>
<div>Removed email after debrief<b>${removed.length}</b>${pct(removed.length, n)} of sign-ups</div>
</div>
<h2>Which describes you best?</h2>${answerTable(PROFILE_LABELS, 'profile',
  `<tr class="segrow"><td>In segment<br><span class="n">${SEGMENT_NOTE}</span></td><td>${segmentCount}</td><td>${pct(segmentCount, n)}</td></tr>`)}
<h2>Are you currently applying for jobs or internships?</h2>${answerTable(APPLYING_LABELS, 'applying')}
<h2>Pricing question (side observation)</h2><table><tr><th>Answer</th><th>Count</th><th>% of answers</th></tr>
${Object.keys(PLAN_LABELS).map(p => `<tr><td>${PLAN_LABELS[p]}</td><td>${pBy[p] || 0}</td><td>${pct(pBy[p] || 0, answered)}</td></tr>`).join('')}
<tr><td>Skipped the question</td><td>${Math.max(0, n - answered)}</td><td class="n">${pct(Math.max(0, n - answered), n)} of sign-ups</td></tr></table>
<h3>Pricing by segment</h3><p class="n">Number of sign-ups; the small % is the share of that column. ${SEGMENT_NOTE}.</p>
${crossTable('Pricing answer', profileCols, crossTab(profileCols), colTotals(profileCols))}
<h3>Pricing by job-search status</h3><p class="n">Number of sign-ups; the small % is the share of that column.</p>
${crossTable('Pricing answer', applyingCols, crossTab(applyingCols), colTotals(applyingCols))}
<h2>By channel</h2><table><tr><th>Source</th><th>Visitors</th><th>Sign-ups</th><th>Sign-up rate</th><th>Removed</th></tr>${srcs.map(row).join('') || '<tr><td colspan=5>No data yet</td></tr>'}</table>
<p class="n">Tip: report the overall rate with and without the "friends" channel.</p>
<h2>Where visits come from</h2>
<h3>Visits by day</h3><p class="n">Visits per channel for each day (Oslo time), newest first, with that day's sign-ups. Use it to match jumps in visits to when you posted, printed posters or tested.</p>
${byDay.length ? simple(['Date', ...visitSrcs, 'All visits', 'Sign-ups'], byDay) : '<p class="n">No visits yet.</p>'}
<h3>Referring sites</h3><p class="n">The site a visitor came from. "none" means no referrer was sent: typed in, QR codes, many apps (Instagram, Messenger, Snapchat) and bookmarks. ${DETAIL_NOTE}</p>
${byRef.length ? simple(['Referring site', 'Visits', 'Mobile', 'Desktop', 'Tablet', 'Likely bots', 'Channels'], byRef) : '<p class="n">No visits with details yet.</p>'}
<h3>Visit details by channel</h3>
${visitSrcs.length ? simple(['Source', 'All visits', 'With details', 'Mobile', 'Desktop', 'Tablet', 'Likely bots', 'Top referring site'], byChanDetail) : '<p class="n">No visits yet.</p>'}
<h3>Who signed up, by channel</h3><p class="n">Sign-ups per channel by their answer to "Which describes you best?".</p>
${bySource.length ? crossTable('Source', profileCols, bySource, null, 'Sign-ups') : '<p class="n">No sign-ups yet.</p>'}
${emails.length ? `<h2>Sign-up emails</h2><table><tr><th>Time (UTC)</th><th>Email</th><th>Source</th><th></th></tr>${emails.map(e => `<tr><td>${esc(String(e.ts).slice(0, 16).replace('T', ' '))}</td><td><form method="post" class="f"><input type="hidden" name="action" value="edit"><input type="hidden" name="id" value="${esc(e.id)}"><input type="email" name="email" value="${esc(e.email)}" required><button>Save</button></form></td><td>${esc(e.src)}</td><td><form method="post" onsubmit="return confirm('Delete this sign-up? It will no longer count in the results.')"><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="${esc(e.id)}"><button class="del">Delete</button></form></td></tr>`).join('')}</table><p class="n">Delete removes the email, the sign-up and all of its answers. The visit it came from still counts.</p>` : `<p><a href="?key=${esc(url.searchParams.get('key'))}&emails=1">Show sign-up emails</a></p>`}`;
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
