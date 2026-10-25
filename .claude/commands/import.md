---
description: "Bring a prepared Melino income export across"
---

# Bring a prepared Melino income export across

Read CLAUDE.md. Confirm the intended database and period. Run:

```bash
npm run royalties -- import melino --period=<period> --code=<unique-report-code> --file=<file.csv> --source="<report-reference>" --actor="<operator>" --dry-run --json
```

Replace placeholders with operator-provided or verified values. Read the records before changing them. A failed command is not success. Show the result in plain words, with currency and period. References accept exact codes, case-insensitive names or partial IDs. If ambiguous, present the candidates and stop that action. Never send, pay or delete anything.

Read docs/replace-melino.md. Confirm report currency, period, pre-royalty net basis and all column names. The optional --map points to an explicit column map. After a clean dry run, repeat without --dry-run when the operator has authorised the import. Compare totals to the original report; never fabricate a column.
