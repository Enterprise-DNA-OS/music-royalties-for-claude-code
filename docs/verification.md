# Verification, 25 October 2026

- Linux, Node 22.23.4: npm install completed with no reported vulnerabilities.
- npm test: PASS, 65 checks exercising all 34 CLI operations on PGlite.
- PostgreSQL 17.10: the same suite PASS, 66 checks including the empty disposable database guard. The temporary server was stopped after the run.
- npm run demo: PASS. npm run docs rendered four demonstration documents across source reconciliation and provisional contract schedules. Saved statements render separately when a period has been calculated. npm run view rendered three read-only reports.
- All 36 slash-command recipes have descriptions and point to the single operational CLI. The commands-folder README is documentation, not an extra command.
- The week view and contract royalty schedule were inspected as screenshots. The real Landing Pages route and components rendered the comparison page in an isolated preview: HTTP 200, noindex,nofollow, six attributed booking links, three functioning demonstration tabs, no browser errors and no mobile document overflow. The headline and command display were shortened after visual inspection.
- The three real demonstration command outputs are retained in docs/evidence/demo-runs.json. All demonstration records are fictional.
- check-page.mjs melino printed PASS with six sourced currency figures and no brand lint errors. Repo prose passed brand lint; no author placeholders, banned phrases or em dashes remain.

The tests cover idempotent migration and seed, exact decimal royalty calculation, negative income and advance carry-forward, unmatched records, incomplete close checks, transactional import rollback, dry runs, repeated source files, protected source codes, corrections retaining prior values, stale approval invalidation, different reviewer names, locks, future contract setup, date and share validation, export completeness, CSV quoting, CLI JSON and non-zero errors. Demo and seed refuse server URLs before connection.

The inherited manual CI workflow covers Linux and Windows on Node 20 and 22 and PostgreSQL 17. This run verified local Linux and PostgreSQL; Windows and Node 20 are not claimed as executed. Import fixtures follow documented field meanings and are synthetic. A real Melino account export still needs its column mapping, currency, income basis, contracts and opening balances reconciled. The preview checks this page, not the site's unrelated full content build.

The [manual hosted run](https://github.com/Enterprise-DNA-OS/music-royalties-for-claude-code/actions/runs/40243355768) did not start any test steps. GitHub reported failed account payments or a spending-limit block. This is an organisation runner limitation, not a failing test assertion. Windows and Node 20 remain unverified; local Linux and PostgreSQL passed independently.
