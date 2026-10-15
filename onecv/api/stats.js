import { list, put, del } from '@vercel/blob';
import ExcelJS from 'exceljs';

const authed = url => process.env.STATS_KEY && url.searchParams.get('key') === process.env.STATS_KEY;
const PLANS = ['free', 'basic49', 'premium99', 'notsure'];
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
    const paths = [`signups/${src}/${id}.json`, ...PLANS.map(p => `plans/${p}/${src}/${id}.json`)];
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
const PLAN_LABELS = { free: 'Free (0 kr)', basic49: 'Basic (49 kr/mo)', premium99: 'Premium (99 kr/mo)', notsure: "Wouldn't use it / not sure" };

export async function GET(request) {
  const url = new URL(request.url);
  if (!authed(url)) {
    return new Response('Not found', { status: 404 });
  }
  const [visits, signups, plans, removed] = await Promise.all([all('visits/'), all('signups/'), all('plans/'), all('removed/')]);
  const vBy = tally(visits, 1), sBy = tally(signups, 1), pBy = tally(plans, 1), rBy = tally(removed, 1);
  const paid = (pBy.basic49 || 0) + (pBy.premium99 || 0);
  const answered = plans.length;
  const srcs = [...new Set([...Object.keys(vBy), ...Object.keys(sBy)])].sort();

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
    const planOf = Object.fromEntries(plans.map(b => [seg(b.pathname, 3).replace(/\.json$/, ''), seg(b.pathname, 1)]));
    const wb = new ExcelJS.Workbook();
    const sheet = (name, cols, rows) => {
      const ws = wb.addWorksheet(name);
      ws.columns = cols.map(([header, width]) => ({ header, width }));
      ws.getRow(1).font = { bold: true };
      ws.views = [{ state: 'frozen', ySplit: 1 }];
      rows.forEach(r => ws.addRow(r));
    };
    const ratio = (a, b) => (b ? a / b : null);
    sheet('Summary', [['Metric', 32], ['Value', 14]], [
      ['Unique visitors', visits.length], ['Sign-ups', signups.length],
      ['Sign-up rate', ratio(signups.length, visits.length)],
      ['Answered pricing question', answered], ['Would pick a paid plan', paid],
      ['Paid share of answers', ratio(paid, answered)],
      ['Removed email after debrief', removed.length],
      ['Exported (UTC)', new Date().toISOString().slice(0, 16).replace('T', ' ')],
    ]);
    wb.getWorksheet('Summary').getColumn(2).eachCell((c, i) => { if ([4, 7].includes(i)) c.numFmt = '0.0%'; });
    sheet('By channel', [['Source', 20], ['Visitors', 12], ['Sign-ups', 12], ['Sign-up rate', 14], ['Removed', 12]],
      srcs.map(s => [s, vBy[s] || 0, sBy[s] || 0, ratio(sBy[s] || 0, vBy[s] || 0), rBy[s] || 0]));
    wb.getWorksheet('By channel').getColumn(4).numFmt = '0.0%';
    sheet('Pricing', [['Answer', 30], ['Count', 10], ['Share of answers', 18]],
      [...Object.keys(PLAN_LABELS).map(p => [PLAN_LABELS[p], pBy[p] || 0, ratio(pBy[p] || 0, answered)]),
       ['Skipped the question', Math.max(0, signups.length - answered), null]]);
    wb.getWorksheet('Pricing').getColumn(3).numFmt = '0.0%';
    sheet('Sign-ups', [['Time (UTC)', 18], ['Email', 34], ['Source', 14], ['Pricing answer', 28]],
      emails.map(e => [String(e.ts).slice(0, 16).replace('T', ' '), e.email, e.src, PLAN_LABELS[planOf[e.id]] || '']));
    const buf = await wb.xlsx.writeBuffer();
    return new Response(buf, { headers: {
      'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'content-disposition': `attachment; filename="onecv-results-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      'cache-control': 'no-store' } });
  }

  if (format === 'json') {
    return Response.json({ visits: vBy, signups: sBy, plans: pBy, removed: rBy,
      totals: { visits: visits.length, signups: signups.length, answered, paid, removed: removed.length }, emails });
  }

  const row = s => `<tr><td>${esc(s)}</td><td>${vBy[s] || 0}</td><td>${sBy[s] || 0}</td><td>${pct(sBy[s] || 0, vBy[s] || 0)}</td><td>${rBy[s] || 0}</td></tr>`;
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>OneCV results</title>
<style>body{font:15px/1.5 system-ui,sans-serif;max-width:760px;margin:32px auto;padding:0 16px;color:#1d1b18;background:#f7f5f0}table{border-collapse:collapse;width:100%;margin:8px 0 28px;background:#fff}td,th{border:1px solid #e3ded4;padding:8px 10px;text-align:left}th{background:#eee9df}.k{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:16px 0 28px}.k div{background:#fff;border:1px solid #e3ded4;border-radius:10px;padding:12px}.k b{display:block;font-size:24px}.n{color:#5f5a52;font-size:13px}form{margin:0}.f{display:flex;gap:6px}.f input{flex:1;min-width:0;font:inherit;padding:4px 6px;border:1px solid #e3ded4;border-radius:6px}button{font:inherit;padding:4px 10px;border:1px solid #e3ded4;border-radius:6px;background:#fff;cursor:pointer}.del{color:#a3322d}</style>
<h1>OneCV smoke test results</h1><p>As of ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC · <a href="?key=${esc(encodeURIComponent(url.searchParams.get('key')))}&format=xlsx">Download Excel (.xlsx)</a></p>
<div class="k">
<div>Unique visitors<b>${visits.length}</b>Pass: 100+</div>
<div>Sign-ups<b>${signups.length}</b>Rate ${pct(signups.length, visits.length)} (pass: 15%+)</div>
<div>Would pick a paid plan<b>${paid}</b>${pct(paid, answered)} of those who answered</div>
<div>Removed email after debrief<b>${removed.length}</b>${pct(removed.length, signups.length)} of sign-ups</div>
</div>
<h2>Pricing question (side observation)</h2><table><tr><th>Answer</th><th>Count</th><th>% of answers</th></tr>
${Object.keys(PLAN_LABELS).map(p => `<tr><td>${PLAN_LABELS[p]}</td><td>${pBy[p] || 0}</td><td>${pct(pBy[p] || 0, answered)}</td></tr>`).join('')}
<tr><td>Skipped the question</td><td>${Math.max(0, signups.length - answered)}</td><td class="n">${pct(Math.max(0, signups.length - answered), signups.length)} of sign-ups</td></tr></table>
<h2>By channel</h2><table><tr><th>Source</th><th>Visitors</th><th>Sign-ups</th><th>Sign-up rate</th><th>Removed</th></tr>${srcs.map(row).join('') || '<tr><td colspan=5>No data yet</td></tr>'}</table>
<p class="n">Tip: report the overall rate with and without the "friends" channel.</p>
${emails.length ? `<h2>Sign-up emails</h2><table><tr><th>Time (UTC)</th><th>Email</th><th>Source</th><th></th></tr>${emails.map(e => `<tr><td>${esc(String(e.ts).slice(0, 16).replace('T', ' '))}</td><td><form method="post" class="f"><input type="hidden" name="action" value="edit"><input type="hidden" name="id" value="${esc(e.id)}"><input type="email" name="email" value="${esc(e.email)}" required><button>Save</button></form></td><td>${esc(e.src)}</td><td><form method="post" onsubmit="return confirm('Delete this sign-up? It will no longer count in the results.')"><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="${esc(e.id)}"><button class="del">Delete</button></form></td></tr>`).join('')}</table><p class="n">Delete removes the email, the sign-up and its pricing answer. The visit it came from still counts.</p>` : `<p><a href="?key=${esc(url.searchParams.get('key'))}&emails=1">Show sign-up emails</a></p>`}`;
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
