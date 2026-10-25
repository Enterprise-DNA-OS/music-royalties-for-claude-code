---
description: "Record independent statement review"
---

# Record independent statement review

Read CLAUDE.md. Confirm the intended database and period. Run:

```bash
npm run royalties -- approve-statement --period=<period> --statement=<statement> --note="<checks-performed>" --actor="<reviewer>" --json
```

Replace placeholders with operator-provided or verified values. Read the records before changing them. A failed command is not success. Show the result in plain words, with currency and period. References accept exact codes, case-insensitive names or partial IDs. If ambiguous, present the candidates and stop that action. Never send, pay or delete anything.
