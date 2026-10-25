---
description: "Log a successful backup restoration check"
---

# Log a successful backup restoration check

Read CLAUDE.md. Confirm the intended database and period. Run:

```bash
npm run royalties -- record-backup --date=<date> --evidence="<restore-test-reference>" --actor="<operator>" --json
```

Replace placeholders with operator-provided or verified values. Read the records before changing them. A failed command is not success. Show the result in plain words, with currency and period. References accept exact codes, case-insensitive names or partial IDs. If ambiguous, present the candidates and stop that action. Never send, pay or delete anything.

Run and inspect a restore test first. This command records evidence; it does not perform the backup. Never claim a backup was tested merely because the command succeeded.
