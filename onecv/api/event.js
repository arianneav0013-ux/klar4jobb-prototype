import { put, list, del } from '@vercel/blob';

// Storage layout (all private):
//   visits/{src}/{rid}.json      one per unique visitor
//   signups/{src}/{id}.json      one per sign-up (no personal data, used for counting)
//   emails/{id}.json             the email itself; deleted if the person clicks "Remove my email"
//   plans/{plan}/{src}/{id}.json answer to the pricing question
//   profiles/{code}/{src}/{id}.json   answer to "Which describes you best?"
//   applying/{code}/{src}/{id}.json   answer to "Are you currently applying for jobs or internships?"
//   removed/{src}/{id}.json      marker that someone withdrew after the debrief

const clean = (s, n = 30) => String(s || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, n);
const rid = () => Date.now() + '-' + Math.random().toString(36).slice(2, 10);
const PLANS = ['free', 'basic49', 'premium99', 'notsure'];
const PROFILES = ['bachelor', 'master_phd', 'recent_grad', 'working', 'other'];
const APPLYING = ['active', 'soon', 'no'];

export async function POST(request) {
  let b;
  try { b = await request.json(); } catch { return Response.json({ ok: false }, { status: 400 }); }
  const src = clean(b.src) || 'direct';
  const opts = { access: 'private', addRandomSuffix: false, contentType: 'application/json' };
  try {
    if (b.type === 'visit') {
      await put(`visits/${src}/${rid()}.json`, '{}', opts);
      return Response.json({ ok: true });
    }
    if (b.type === 'signup') {
      const email = String(b.email || '').trim().slice(0, 200);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ ok: false }, { status: 400 });
      const id = rid();
      const ts = new Date().toISOString();
      await put(`signups/${src}/${id}.json`, JSON.stringify({ src, ts }), opts);
      await put(`emails/${id}.json`, JSON.stringify({ email, src, ts }), opts);
      return Response.json({ ok: true, id });
    }
    if (b.type === 'plan') {
      const plan = PLANS.includes(b.plan) ? b.plan : null;
      if (!plan) return Response.json({ ok: false }, { status: 400 });
      await put(`plans/${plan}/${src}/${clean(b.id, 40) || rid()}.json`, '{}', opts);
      return Response.json({ ok: true });
    }
    if (b.type === 'answers') {
      // Optional follow-up questions after sign-up. Only known codes are stored, never labels.
      const id = clean(b.id, 40);
      if (!id) return Response.json({ ok: false }, { status: 400 });
      const paths = [];
      if (PROFILES.includes(b.profile)) paths.push(`profiles/${b.profile}/${src}/${id}.json`);
      if (APPLYING.includes(b.applying)) paths.push(`applying/${b.applying}/${src}/${id}.json`);
      if (PLANS.includes(b.plan)) paths.push(`plans/${b.plan}/${src}/${id}.json`);
      if (!paths.length) return Response.json({ ok: false }, { status: 400 });
      await Promise.all(paths.map(p => put(p, '{}', opts)));
      return Response.json({ ok: true });
    }
    if (b.type === 'remove') {
      const id = clean(b.id, 40);
      if (!id) return Response.json({ ok: false }, { status: 400 });
      const r = await list({ prefix: `emails/${id}.json` });
      if (r.blobs.length) await del(r.blobs.map(x => x.url));
      await put(`removed/${src}/${id}.json`, '{}', opts);
      return Response.json({ ok: true });
    }
  } catch (e) {
    console.error('event error', e && e.message);
    return Response.json({ ok: false }, { status: 500 });
  }
  return Response.json({ ok: false }, { status: 400 });
}
