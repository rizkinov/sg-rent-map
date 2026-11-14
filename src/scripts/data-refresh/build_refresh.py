"""Build the rolling-12-month refresh set in the existing row conventions. Writes files only; loads nothing.

Before each run, set URA_MONTHS, URA_NEW, HDB_FROM, HDB_TO and HDB_NEW_FROM below to the new window.
Expects <data dir>/ura/monthly/g2_*.csv, <data dir>/ura/raw/g1_*.csv and g3_*.csv (from ura_pmi.py fetch),
<data dir>/hdb/hdb-rental-raw-nov2026.csv (the data.gov.sg export) and <data dir>/hdb/onemap_street_districts.json
(copy of src/data/hdb-street-districts.json; add any new HDB street with its OneMap postal sector district).

usage: build_refresh.py <work/data dir> <db dump json>
"""
import csv, glob, json, os, sys, uuid, statistics, collections

D, DB = sys.argv[1], sys.argv[2]
OUT = os.path.join(D, 'refresh-final')
os.makedirs(OUT, exist_ok=True)

URA_MONTHS = ['Oct-25', 'Nov-25', 'Dec-25', 'Jan-26', 'Feb-26', 'Mar-26', 'Apr-26', 'May-26', 'Jun-26', 'Jul-26', 'Aug-26', 'Sep-26']
URA_NEW = {'Jun-26', 'Jul-26', 'Aug-26', 'Sep-26'}
HDB_FROM, HDB_TO = '2025-11', '2026-10'
HDB_NEW_FROM = '2026-07'
HDB_FT = {'1-ROOM': (1, 350), '2-ROOM': (2, 485), '3-ROOM': (3, 700), '4-ROOM': (4, 970), '5-ROOM': (5, 1185), 'EXECUTIVE': (5, 1500)}

def mid(s):
    p = s.replace(',', '').split(' to ')
    return round((int(p[0]) + int(p[1])) / 2) if len(p) == 2 else int(p[0])

def baths(beds, t):  # estimateBaths() in src/scripts/fetch-ura-2026.ts
    if not beds:
        return 3 if t == 'Landed' else 1
    if beds <= 1: return 1
    if beds <= 2: return 2 if t == 'Landed' else 1
    if beds <= 3: return 2
    if beds <= 4: return 4 if t == 'Landed' else 3
    return 5 if t == 'Landed' else 3

def ura_type(t):
    t = t.lower()
    return 'Landed' if ('terrace' in t or 'detached' in t or 'bungalow' in t) else 'Condo'

def row(name, ptype, district, rent, beds, b, sqft, street, lease):
    return {'id': str(uuid.uuid4()), 'property_name': name, 'property_type': ptype, 'district': district,
            'rental_price': rent, 'beds': beds, 'baths': b, 'sqft': sqft, 'mrt': None, 'latitude': 0, 'longitude': 0,
            'completion_year': None, 'url': None, 'street_name': street, 'lease_date': lease}

# ---------- URA private (non-landed per month + landed + EC)
ura_files = sorted(glob.glob(os.path.join(D, 'ura', 'monthly', 'g2_*.csv'))) + \
            sorted(glob.glob(os.path.join(D, 'ura', 'raw', 'g1_*.csv'))) + sorted(glob.glob(os.path.join(D, 'ura', 'raw', 'g3_*.csv')))
ura_lines, header = [], None
private = []
for f in ura_files:
    with open(f, newline='', encoding='utf-8-sig') as fh:
        text = fh.read()
    lines = [l for l in text.splitlines() if l.strip()]
    header = lines[0]
    ura_lines.extend(lines[1:])
    for r in csv.DictReader(lines):
        assert r['Lease Commencement Date'] in URA_MONTHS, r
        t = ura_type(r['Property Type'])
        beds = None if r['No of Bedroom'] == 'NA' else int(r['No of Bedroom'])
        private.append(row(r['Project Name'], t, int(r['Postal District']), int(r['Monthly Rent ($)'].replace(',', '')),
                           beds, baths(beds, t), mid(r['Floor Area (SQFT)']), r['Street Name'], r['Lease Commencement Date']))
# consolidated raw export for provenance (same shape as src/data/ura-private-rental-jul2025-may2026.csv)
with open(os.path.join(OUT, 'ura-private-rental-oct2025-sep2026.csv'), 'w', newline='') as fh:
    fh.write(header + '\n' + '\n'.join(ura_lines) + '\n')

# ---------- HDB
db = json.load(open(DB))
street_d = {}
for r in db:
    if r['property_type'] == 'HDB':
        street_d[r['street_name']] = r['district']
onemap = json.load(open(os.path.join(D, 'hdb', 'onemap_street_districts.json')))
hdb, new_streets, unresolved = [], collections.Counter(), collections.Counter()
for r in csv.DictReader(open(os.path.join(D, 'hdb', 'hdb-rental-raw-nov2026.csv'), newline='', encoding='utf-8-sig')):
    m = r['rent_approval_date']
    if not (HDB_FROM <= m <= HDB_TO):
        continue
    st = r['street_name']
    # Postal-sector district from OneMap first (the July street lookup put whole towns in one district).
    om = onemap.get(st)
    d = om['district'] if om and om.get('district') else street_d.get(st)
    if d is None:
        unresolved[st] += 1
    # Source error: block 5 Lor Lew Lian only has 3-room flats; this "5-ROOM" at $9,200 is wrong.
    if r['block'] == '5' and st == 'LOR LEW LIAN' and r['flat_type'] == '5-ROOM' and r['monthly_rent'] == '9200':
        print('dropped source-error row', m, r['block'], st, r['flat_type'], r['monthly_rent'])
        continue
    beds, sqft = HDB_FT[r['flat_type']]
    hdb.append(row(f"{r['block']} {st}", 'HDB', d, int(r['monthly_rent']), beds, 2, sqft, st, m))

allrows = private + hdb
cols = ['id', 'property_name', 'property_type', 'district', 'rental_price', 'beds', 'baths', 'sqft', 'mrt', 'latitude',
        'longitude', 'completion_year', 'url', 'street_name', 'lease_date']

def write(rows, name):
    with open(os.path.join(OUT, name + '.csv'), 'w', newline='') as fh:
        w = csv.DictWriter(fh, fieldnames=cols)
        w.writeheader()
        for r in rows:
            w.writerow({k: ('' if r[k] is None else r[k]) for k in cols})
    json.dump(rows, open(os.path.join(OUT, name + '.json'), 'w'))

write(allrows, 'refresh_rows_full_window')
newonly = [r for r in private if r['lease_date'] in URA_NEW] + [r for r in hdb if r['lease_date'] >= HDB_NEW_FROM]
write(newonly, 'refresh_rows_new_months_only')

print('private rows', len(private), 'hdb rows', len(hdb), 'total', len(allrows), 'new-months-only', len(newonly))
print('HDB new streets resolved via OneMap', dict(new_streets))
print('HDB unresolved streets', dict(unresolved))
print('district null', sum(1 for r in allrows if r['district'] is None),
      'district out of 1-28', sum(1 for r in allrows if r['district'] is not None and not 1 <= r['district'] <= 28))

# ---------- stats
def stats(rows):
    p = [r['rental_price'] for r in rows]
    return len(p), round(statistics.mean(p)), statistics.median(p), min(p), max(p)

def report(label, rows):
    out = {'label': label, 'total': stats(rows), 'by_type': {}, 'by_district': {}, 'by_month': {}}
    for t in ['Condo', 'HDB', 'Landed']:
        sub = [r for r in rows if r['property_type'] == t]
        out['by_type'][t] = stats(sub)
        out['by_month'][t] = dict(sorted(collections.Counter(r['lease_date'] for r in sub).items()))
    for d in range(1, 29):
        sub = [r for r in rows if r['district'] == d]
        out['by_district'][d] = {t: sum(1 for r in sub if r['property_type'] == t) for t in ['Condo', 'HDB', 'Landed']}
        out['by_district'][d]['total'] = len(sub)
        out['by_district'][d]['avg'] = round(statistics.mean([r['rental_price'] for r in sub])) if sub else None
        out['by_district'][d]['median'] = statistics.median([r['rental_price'] for r in sub]) if sub else None
    return out

before, after = report('before (live DB)', db), report('after (refresh)', allrows)
json.dump({'before': before, 'after': after}, open(os.path.join(OUT, 'before_after_stats.json'), 'w'), indent=1)
print('\n            count     avg   median   min     max')
for lab, rep in (('BEFORE', before), ('AFTER', after)):
    print(lab, 'all   ', rep['total'])
    for t, s in rep['by_type'].items():
        print(lab, f'{t:6s}', s)
print('\nDistrict  before(total C/H/L avg med)            after(total C/H/L avg med)')
for d in range(1, 29):
    b, a = before['by_district'][d], after['by_district'][d]
    print(f"D{d:<2} {b['total']:>6} {b['Condo']:>6}/{b['HDB']:>5}/{b['Landed']:>4} {b['avg']:>6} {b['median']:>7}   "
          f"{a['total']:>6} {a['Condo']:>6}/{a['HDB']:>5}/{a['Landed']:>4} {a['avg']:>6} {a['median']:>7}  diff {a['total']-b['total']:+d}")
