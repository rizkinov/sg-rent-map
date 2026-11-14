# Refreshing the rent data

The map shows a rolling 12 months per source. Last refresh: 15 November 2026 (URA Oct 2025 to Sep 2026, HDB Nov 2025 to Oct 2026, 131,628 rows).

1. **URA private contracts.** The PMI e-service updates on the 15th. Check the newest month with
   `python3 -I ura_pmi.py count <outdir> 2026-10 2026-10`, then pull with `fetch` (groups 1 Landed, 2 Non-Landed, 3 EC).
   The CSV download must post back the whole result form (hidden fields, selectColumn 1 to 9, the refreshed _csrf);
   posting only downloadType and gotoPage returns blank lines. Identical CSV lines are genuine repeat contracts: keep them.
2. **HDB approvals.** data.gov.sg dataset `d_c9f57187485a850908655db0e8cfe651`, monthly. Districts come from each
   street's postal sector (`src/data/hdb-street-districts.json`, built with OneMap). The older lookup put whole towns in one district.
3. **Build.** Set the month window at the top of `build_refresh.py`, then `python3 -I build_refresh.py <data dir> <db dump json>`.
   It prints before and after counts. Drop any confirmed source error there (one is already listed).
4. **Load.** Back up the table first. Replace the whole table rather than appending, because late filings change earlier months:
   `node src/scripts/data-refresh/load.mjs <rows.json> <stamp file> <rows in the table now>` from the repo root.
5. Update the date ranges in `src/components/filters/FilterPanel.tsx` and the README, and the raw exports in `src/data/`.
