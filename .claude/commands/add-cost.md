---
description: "Log a contract-approved recoupment"
---

# Log a contract-approved recoupment

Read CLAUDE.md. Confirm the intended database and period. Run:

```bash
npm run royalties -- add-cost --period=<period> --code=<code> --name="<cost>" --contract=<contract> --amount=<amount> --source="<receipt-and-clause>" --actor="<operator>" --json
```

Replace placeholders with operator-provided or verified values. Read the records before changing them. A failed command is not success. Show the result in plain words, with currency and period. References accept exact codes, case-insensitive names or partial IDs. If ambiguous, present the candidates and stop that action. Never send, pay or delete anything.
