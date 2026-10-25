# Bring the Melino royalty working record across

## Export the income

Melino's [Reports documentation](https://melino.com/docs/label/reports/) says report results can be exported as CSV or Excel and customised. Its [Implates documentation](https://melino.com/docs/label/implates/) defines ISRC, units, net income, territory and reseller fields. Reports are configurable: there is no single universal Melino CSV layout asserted here.

Prepare a line-level income report for one company, currency and reporting period, before royalty deductions. Export CSV using decimal points and no grouping separators. Keep the original export. Select recording ISRC, units and net income; optional columns are territory, reseller and title. If labels differ, supply a map such as:

```json
{"isrc":"Recording ISRC","units":"Sold units","net":"Net income","territory":"Country","reseller":"Store"}
```

The map keys are this importer's fields; values are the exact exported headers. Without a map, headers are isrc, units and net, case-insensitive. The fixture follows documented field meanings; it is synthetic, not a certified customer export. Check the actual account's export before promising a migration. Excel exports must be saved as UTF-8 CSV first. EAN-only, publishing-work, post-calculation and aggregated reports need separately agreed mapping.

## Prepare the destination

Use an empty DATA_DIR and npm run migrate, without demo or seed. Add partners, tracks, signed-agreement references and opening unrecouped balances through the CLI. Use unhyphenated ISRCs. Add non-overlapping periods and confirm their currency. Contracts are flat net-income percentages and must cover the whole period. Bring contract terms, opening balances, previous statements and exceptions across as a reviewed setup step; a sales CSV does not contain them.

```bash
npm run royalties -- import melino --period=2026-Q3 --code=DIST-Q3 --file=imports/melino.csv --map=imports/columns.json --source="Melino income report, September quarter" --actor="Operator" --dry-run
```

After checking the result, repeat without --dry-run. The same file and period are idempotent. Reusing a report code with changed content fails, so a revision cannot silently overwrite its source. Keep a stable unique code for each distributor report; the importer cannot discover duplicate business transactions in differently edited files with different codes.

## What maps

ISRC resolves to an existing track, with the reported identifier retained. Unknown identifiers stay unmatched and block calculation. Units and net income are signed decimal values with up to six places. Extra source columns are retained in the raw original, but are not silently treated as calculation rules. The whole report takes the selected period and currency; the importer does not infer or convert currency. A malformed row rolls back the entire batch. Refunds are negative income. Mixed currencies, precision above six places and time-based contract changes require preparation before import.

## Reconcile and cut over

Resolve unmatched income with documentary evidence. Reconcile the total to the original distributor reports, record agreed recoupable costs, complete questions and test restoration from backup. Calculate, inspect every contract statement and have a different reviewer approve. Compare the result against the current Melino statement before locking the period.

[Melino statement tools](https://melino.com/docs/label/stmt_tools/) can export statement summaries to Excel and packages containing PDF and Excel. Keep those as comparison evidence; this importer does not load completed Melino statement summaries or reconstruct their contract logic. The free base does not transfer publishing registrations, distribution deliveries, minimum payouts, reserves, taxes, portals, messages, payment history or payment instructions. Enterprise DNA scopes those needs separately. No money is moved.

One command loads a prepared supported income file. A complete switch also requires contract mapping, opening-balance review and statement reconciliation. No universal one-day migration guarantee is made.

Export all domain records with npm run royalties -- export --dir=exports/backup. The JSON archive preserves evidence but is not a one-command restore format. Use database-native backups and test restoration for disaster recovery.
