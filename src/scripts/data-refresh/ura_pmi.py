"""URA PMI residential rental e-service client (search + CSV download).

usage:
  ura_pmi.py count  <outdir> <yyyy-mm from> <yyyy-mm to> [group ...]
  ura_pmi.py fetch  <outdir> <yyyy-mm from> <yyyy-mm to> [group ...]
Groups: 1 Landed, 2 Non-Landed, 3 EC. All 28 postal districts are selected.
"""
import sys, os, re, json, html, time, http.cookiejar, urllib.request, urllib.parse

BASE = 'https://eservice.ura.gov.sg/property-market-information/'
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36'

DISTRICTS = ["D01 / Raffles Place, Cecil, Marina, People's Park", 'D02 / Anson, Tanjong Pagar', 'D03 / Queenstown, Tiong Bahru',
             'D04 / Telok Blangah, Harbourfront', 'D05 / Pasir Panjang, Hong Leong Garden, Clementi New Town',
             'D06 / High Street, Beach Road (part)', 'D07 / Middle Road, Golden Mile', 'D08 / Little India',
             'D09 / Orchard, Cairnhill, River Valley', 'D10 / Ardmore, Bukit Timah, Holland Road, Tanglin',
             'D11 / Watten Estate, Novena, Thomson', 'D12 / Balestier, Toa Payoh, Serangoon', 'D13 / Macpherson, Braddell',
             'D14 / Geylang, Eunos', 'D15 / Katong, Joo Chiat, Amber Road', 'D16 / Bedok, Upper East Coast, Eastwood, Kew Drive',
             'D17 / Loyang, Changi', 'D18 / Tampines, Pasir Ris', 'D19 / Serangoon Garden, Hougang, Punggol',
             'D20 / Bishan, Ang Mo Kio', 'D21 / Upper Bukit Timah, Clementi Park, Ulu Pandan', 'D22 / Jurong',
             'D23 / Hillview, Dairy Farm, Bukit Panjang, Choa Chu Kang', 'D24 / Lim Chu Kang, Tengah', 'D25 / Kranji, Woodgrove',
             'D26 / Upper Thomson, Springleaf', 'D27 / Yishun, Sembawang', 'D28 / Seletar']


class Session:
    def __init__(self):
        self.cj = http.cookiejar.CookieJar()
        self.op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.cj))
        self.csrf = None

    def req(self, path, data=None, ajax=False, timeout=180):
        h = {'User-Agent': UA, 'Referer': BASE + 'pmiResidentialRentalSearch', 'Origin': 'https://eservice.ura.gov.sg'}
        if ajax:
            h['X-Requested-With'] = 'XMLHttpRequest'
        if self.csrf:
            h['X-CSRF-TOKEN'] = self.csrf
        body = urllib.parse.urlencode(data, doseq=True).encode() if data is not None else None
        r = urllib.request.Request(BASE + path, data=body, headers=h, method='POST' if body else 'GET')
        with self.op.open(r, timeout=timeout) as resp:
            return resp.read(), dict(resp.headers)

    def start(self):
        page, _ = self.req('pmiResidentialRentalSearch')
        self.csrf = re.search(rb'name="_csrf" value="([^"]+)"', page).group(1).decode()

    def search(self, ym_from, ym_to, group):
        yf, mf = ym_from.split('-'); yt, mt = ym_to.split('-')
        data = {
            'resultPerPage': '20', 'displayResult': 'true', 'displayResultHeader': 'true', 'loadAnalysis': 'true',
            'displayAnalysis': 'false', 'displayChart': 'true', 'displayAnalysisFilters': 'true', 'dashboardDisplay': 'false',
            'locationDetails': json.dumps(['postalDistrict'] + DISTRICTS),
            'propertyTypeGroupNo': str(group),
            'contractYearFrom': yf, 'contractMonthFrom': str(int(mf)), 'contractYearTo': yt, 'contractMonthTo': str(int(mt)),
            '_csrf': self.csrf,
        }
        body, _ = self.req('pmiResidentialRentalSearch', data, ajax=True)
        return body.decode('utf-8', 'replace')

    def download(self, page_html, chunk):
        """Post resultForm1 back exactly as the browser would, with gotoPage=<chunk>."""
        i = page_html.find('<form id="resultForm1"'); j = page_html.find('</form>', i)
        form = page_html[i:j]
        fields = []
        for m in re.finditer(r'<input([^>]*)>', form):
            a = m.group(1)
            n = re.search(r'name="([^"]*)"', a)
            if not n:
                continue
            v = re.search(r'value="([^"]*)"', a)
            fields.append([n.group(1), html.unescape(v.group(1)) if v else ''])
        s = re.search(r'<select[^>]*name="selectColumn"[^>]*>(.*?)</select>', form, re.S)
        if s:
            for v in re.findall(r'<option value="([^"]+)" selected', s.group(1)):
                fields.append(['selectColumn', v])
        seen_csrf = False
        out = []
        for k, v in fields:
            if k == 'gotoPage':
                v = str(chunk)
            elif k == 'downloadType':
                v = 'downloadCSV'
            elif k == '_csrf':
                if seen_csrf:
                    continue
                seen_csrf = True
                self.csrf = v
            out.append((k, v))
        body, hdr = self.req('pmiSearchResidentialRentalDownload', out)
        return body, hdr


def result_count(page):
    txt = re.sub(r'<[^>]+>', ' ', page)
    txt = html.unescape(re.sub(r'\s+', ' ', txt))
    if 'has not generated any result' in txt:
        return 0, txt
    ends = [int(x.replace(',', '')) for x in re.findall(r'CSV - results [\d,]+ to ([\d,]+)', txt)]
    return (max(ends) if ends else None), txt


if __name__ == '__main__':
    mode, outdir, f, t = sys.argv[1:5]
    groups = [int(g) for g in sys.argv[5:]] or [1, 2, 3]
    os.makedirs(outdir, exist_ok=True)
    for g in groups:
        s = Session(); s.start()
        page = s.search(f, t, g)
        open(os.path.join(outdir, f'search_g{g}_{f}_{t}.html'), 'w').write(page)
        n, txt = result_count(page)
        print(f'group {g} {f}..{t}: count={n}')
        if n is None:
            i = txt.find('ecord'); print('   snippet:', txt[:600])
        if mode == 'fetch' and n:
            chunks = (n + 9999) // 10000
            for c in range(1, chunks + 1):
                body, hdr = s.download(page, c)
                fn = os.path.join(outdir, f'g{g}_{f}_{t}_part{c}.csv')
                open(fn, 'wb').write(body)
                print(f'   chunk {c}/{chunks}: {len(body)} bytes, type={hdr.get("Content-Type")}, lines={body.count(b"\n")}')
                time.sleep(1)
        time.sleep(1)
