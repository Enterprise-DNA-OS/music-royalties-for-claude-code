# Music Royalties for Claude Code

For a label operations or royalty manager preparing recorded-music royalty working papers. Configure the business name in brand.json. Fictional data is for demonstration only.

## Rules

Start every answer with the CLI's current records. One operational CLI: scripts/royalties.mjs. Use a confirmed DATA_DIR or DATABASE_URL. Never mix demonstration and business records. No sends, payments, bank details, tax calculation or deletion commands. Draft documents remain in drafts/. The operator reviews any external use.

The supported calculation is a fixed percentage of net income per recording and rights holder, in one currency per period. Agreements must cover the entire period. Opening unrecouped costs and new agreed costs are deducted from earnings; negative earnings increase the unrecouped balance. This is a working calculation, not a payment order. No currency conversion, minimum payout, reserves, tax, publishing-society registration or distribution delivery is implemented. Never infer these rules from a contract.

Do not finalise a statement with unmatched income, missing contract coverage, unreconciled sources or open actions. Calculate after changes, then obtain a different reviewer's recorded approval. Lock the period only when compliance clears. Older periods close first. Locked records cannot be changed through this CLI; corrections require a planned migration with original evidence retained. New future agreements remain addable. Changes are transactionally logged; --actor is a declared name, not authenticated identity. A database owner can bypass these controls. Team authentication and access control must be designed before shared deployment.

Amounts use six decimal places. Round only at the agreed downstream accounting boundary; no payment is made here. Do not present an open-period estimate as a final entitlement. The next period's recoupment is provisional until earlier periods are locked.

## Routing table

| Request | Recipe |
|---|---|
| List supported operations | /help |
| Read the rights-holder register | /partners |
| Read the recording catalogue | /tracks |
| Read statement periods and locks | /periods |
| Read documented recording shares | /contracts |
| Review distributor income by territory | /income |
| Inspect source income lines | /sales |
| Find recordings not matched to the catalogue | /unmatched |
| Review advances and agreed recoupments | /recoupment |
| Read calculation snapshots and approvals | /statements |
| Review recoupable cost evidence | /costs |
| Run the royalty close desk | /attention |
| Read unfinished close actions | /actions-due |
| Review rights ending within the next 90 days | /contract-expiry |
| Check sources, review evidence and retention readiness | /compliance |
| Read recorded changes and earlier values | /history |
| Prepare the weekly royalty review | /weekly-review |
| Add a rights holder | /add-partner |
| Add a recording to the catalogue | /add-track |
| Open a statement period | /add-period |
| Record an agreed royalty share | /add-contract |
| Log a contract-approved recoupment | /add-cost |
| Log a close question | /add-action |
| Record the answer to a close question | /complete-action |
| Resolve an unidentified recording | /match-income |
| Correct a source amount and keep its old value | /revise-sale |
| Record the source-total review | /reconcile |
| Calculate the contract statements | /calculate |
| Record independent statement review | /approve-statement |
| Close the reviewed royalty period | /lock-period |
| Log a successful backup restoration check | /record-backup |
| Bring a prepared Melino income export across | /import |
| Export the complete royalty working record | /export |
| Draft the reviewed royalty working paper | /draft-statement |
| Change fields or rules | /customise |
| Add a read-only report | /new-view |

## Files

supabase/migrations holds numbered migrations. supabase/seed.sql holds fictional examples. scripts/lib/db.mjs chooses PGlite locally or PostgreSQL with DATABASE_URL. brand.json controls both documents.json and views.json output. docs/replace-melino.md is the import contract. docs/compliance.md maps checks to sources. AGENTS.md serves Codex, OpenCode and Cursor using these same recipes.
