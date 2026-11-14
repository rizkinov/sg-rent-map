import { createRequire } from 'node:module'
// usage (from the repo root): node src/scripts/data-refresh/load.mjs <rows.json> <stamp-file> <expected rows now>
// Inserts every row with one created_at stamp, checks the counts, then deletes all older rows.
// If it stops part-way, the new rows can be removed by that stamp.
const root = process.cwd()
const require = createRequire(root + '/package.json')
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const env = Object.fromEntries(fs.readFileSync(root + '/.env.local', 'utf8').split('\n').filter(l => l.includes('=') && !l.startsWith('#')).map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, '')] }))
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const rows = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const count = async (f) => { let q = sb.from('properties').select('*', { count: 'exact', head: true }); if (f) q = f(q); const { count, error } = await q; if (error) throw error; return count }
const before = await count()
console.log('rows before', before, '| to insert', rows.length)
if (before !== Number(process.argv[4])) { console.log('starting count is not', process.argv[4], '- stopping'); process.exit(1) }
const T1 = new Date().toISOString()
fs.writeFileSync(process.argv[3], T1)
console.log('load stamp', T1)
for (let i = 0; i < rows.length; i += 1000) {
  const batch = rows.slice(i, i + 1000).map(r => ({ ...r, created_at: T1, updated_at: T1 }))
  let ok = false
  for (let a = 0; a < 3 && !ok; a++) {
    const { error } = await sb.from('properties').insert(batch, { returning: 'minimal' })
    if (!error) ok = true; else { console.log('batch', i, 'attempt', a + 1, error.message); await new Promise(r => setTimeout(r, 2000)) }
  }
  if (!ok) { console.log('STOPPED at batch', i, '- new rows so far carry stamp', T1); process.exit(2) }
  if ((i / 1000) % 20 === 0) console.log('inserted', i + batch.length)
}
const newCount = await count(q => q.eq('created_at', T1))
const total = await count()
console.log('new rows', newCount, '| total now', total)
if (newCount !== rows.length || total !== before + rows.length) { console.log('MISMATCH, not deleting old rows'); process.exit(3) }
const { error: delErr } = await sb.from('properties').delete().lt('created_at', T1)
if (delErr) { console.log('delete error', delErr.message); process.exit(4) }
const after = await count()
const byType = {}
for (const t of ['Condo', 'HDB', 'Landed']) byType[t] = await count(q => q.eq('property_type', t))
console.log('rows after', after, JSON.stringify(byType))
