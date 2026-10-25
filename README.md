# Music Royalties for Claude Code

Recording income, rights-holder shares and recoupment working papers in a database you own.

## Three ways to own it

- **Do it yourself.** Install the free MIT-licensed base, test the fictional label and import a prepared Melino income export. Claude Code, Codex, OpenCode or Cursor runs the same commands. Hosting and agent use have separate costs.
- **We customise it.** Enterprise DNA fits your contracts, source reports, statement format and review rules. Your version can include a web front end or a different stack. One setup fee, then a retainer.
- **We run it for you.** Omni by Enterprise DNA operates the agreed installation, connections, backups and support. One setup fee, then a retainer. [Book 30 minutes with Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_medium=readme).

## The bill and the scope

Melino lists its Label + Publishing + Supplier Portal configuration from EUR1,000 per month, or EUR12,000 for twelve months. Label alone starts at EUR500 monthly and combined Label + Publishing at EUR800 monthly. Catalogue size and options affect the quote. These are published configurations, not a customer invoice. [Pricing checked 25 October 2026](https://melino.com/pricing/).

This is a narrower recorded-music royalty working desk: catalogue, signed-agreement references, fixed net-income shares, recoupment, source reconciliation and statement review. Melino also covers distribution, publishing and portals. Those functions are not supplied by this base. It makes no payments, calculates no tax and sends no statements.

## Run the fictional label

Node 20 or later. No API key or paid service needed.

```bash
npm install
npm test
npm run demo
npm run royalties -- weekly-review --period=2026-Q3
npm run docs
npm run view
```

With DATABASE_URL unset, PGlite persists under .data/db or DATA_DIR. Set DATABASE_URL for PostgreSQL and run npm run migrate. Seed and demo refuse server databases before connection. Seed leaves an existing partner register untouched. For real data use a separate empty DATA_DIR, migrate and add your own catalogue, contracts and periods. Never seed a business database.

## The industry's weekly work

1. /attention and /unmatched identify periods and distributor lines waiting on evidence.
2. /income, /sales and /reconcile check net-income totals against original reports.
3. /recoupment and /costs show which agreed advances and costs absorb the royalty share.
4. /contract-expiry and /actions-due identify rights and close questions needing an owner.
5. /compliance, /calculate and /approve-statement prepare a reviewed close. /draft-statement writes the private working paper; /lock-period preserves the completed period.

34 CLI operations with --json (and --compact for shorter human recoupment reports), and 36 slash-command recipes including /customise and /new-view. Exact codes, case-insensitive names and partial IDs resolve records; ambiguous matches list candidates and exit 1. Writes require a declared --actor and run inside a serialised transaction. The name is documentary evidence, not authentication.

## Ten questions this build answers

These are working questions, not claims that Melino's configurable reports cannot answer them.

1. Which quarter is late and still missing source review? /attention.
2. Which recording identifiers are unmatched? /unmatched.
3. What net income came from each store and territory? /income.
4. Which original report supplied this income line? /sales.
5. What did each recording earn under its agreed share? /recoupment.
6. Which artist still has an unrecouped advance? /recoupment.
7. Which recoupments have supporting evidence? /costs.
8. Whose recording agreement expires in the next 90 days? /contract-expiry.
9. Who changed an income amount, and what was it before? /history.
10. Which check prevents this quarter from being locked? /compliance.

## Bring Melino income across

Export a line-level CSV through Melino Reports. Select ISRC, units and net income, plus territory and reseller when available. Reports have configurable columns; supply --map for your exact headers. Set up contracts and opening recoupment balances separately, then use /import for a dry run and the confirmed load. [Mapping, source links and limits](docs/replace-melino.md).

Original CSV text, source reference and fingerprint stay in the database. Identical imports are idempotent within a period. Reusing a report code with changed content fails. Unknown ISRCs are retained as unmatched and block calculation. /revise-sale retains the previous amount and reason, clears source review and invalidates approvals.

## Calculation policy

A contract is one rights holder's percentage of a recording's net income, covering the entire period in its currency. Combined overlapping shares cannot exceed 100 percent. The remaining share belongs outside this rights-holder calculation; no total of 100 percent is required. Partial-period terms and mixed contract currencies block calculations rather than inventing apportionment or exchange rates.

Amounts and royalty results retain six decimal places. Rate precision is four places. Earned royalty is net income times the agreed percentage. Available amount is the positive excess after opening debt and new contract-approved costs. Negative income increases the unrecouped balance. Earlier periods must be locked before their closing balance carries forward. Costs are entered under the operator's agreed contract policy, never inferred from receipts. These rules require review against your actual agreements.

Missing income reports, source-review gaps, unmatched lines, open actions and old backup evidence prevent calculation. A correction invalidates approvals. Every snapshot keeps its contract, sale lines and cost inputs. A different named reviewer approves current calculations before the period locks. CLI locks do not prevent the database owner editing data directly. Shared deployment needs real access control and backups.

No cross-contract netting, escalations, minimum payouts, reserves, tax, foreign-exchange conversion, bank feeds, publishing registrations or payment handling is included. A full migration must reconcile to existing statements before operational use. The displayed available amount is a working royalty amount, never proof of payment or an instruction to pay.

## Documents and views

brand.json controls business name, colours and logo. npm run docs renders statement working papers and source-reconciliation packs. npm run view renders the week, income and provisional recoupment. /draft-statement writes to drafts/ and sends nothing. [What a screen adds](docs/why-no-front-end.md). [Compliance checks and their sources](docs/compliance.md).

## Your first hour: ten things to ask for

1. Put our label name on the working statement.
2. Add the people who own our royalty reviews.
3. Add a recording with its ISRC.
4. Record the agreed net-income share and agreement reference.
5. Open our next reporting period.
6. Test one Melino report without saving it.
7. Show the income lines needing an ISRC match.
8. Explain which advance absorbs this artist's earnings.
9. Draft the close questions with owners and dates.
10. Add our statement columns and review checklist.

/customise writes and tests a migration. /new-view adds a read-only question. Export all domain records with npm run royalties -- export --dir=exports/backup. That archive is evidence, not an automated restore procedure; use and test database-native backups.

## Verification

npm test uses an isolated temporary database and exercises every operation, imports, rollback, corrections, approvals, locks and carry-forward. CI covers Windows and Linux on Node 20 and 22, plus PostgreSQL 17. [What actually ran](docs/verification.md).

MIT. Not affiliated with Melino or Anthropic. [Selection evidence](docs/research.md).
