# Source and review checks

Checked 25 October 2026. These are record-readiness checks, not legal certification, royalty-rights advice or a tax engine.

| Rule | What the program checks | Source and limit |
|---|---|---|
| SOURCE / RETENTION | Each period has an income batch with the original text, source reference and fingerprint. Export includes those records. The retention setting cannot be less than seven years; there is no deletion command. | [IRD record keeping](https://www.ird.govt.nz/records) requires retention for at least seven tax years. Keeping a setting is not proof of retention. The operator supplies storage and backups. |
| BACKUP | A restore-test date and evidence reference within the last 30 days. | [IRD computer records](https://www.ird.govt.nz/managing-my-tax/record-keeping/computer-record-keeping-for-audit) requires readable, retrievable records. Thirty days is this project's operating policy, not a statutory interval. |
| MATCH / CONTRACT / TERM | Every income recording has a match and a same-currency contract covering the whole period. Partial-period terms stop calculation. | [Melino import workflow](https://melino.com/docs/label/imports/) describes resolving disputes. The chosen whole-period restriction is a simplifying project policy. |
| SOURCE-REVIEW | Operator-entered expected total equals recorded income and a review reference is stored. | Internal reconciliation policy. It cannot establish whether a source is genuine or complete. |
| ACTION / PRIOR | Open questions and earlier open periods block calculation. | Internal close policy, needed for reliable recoupment carry-forward. |
| CALCULATION / STALE / REVIEW | All eligible contracts have a current snapshot approved by a different declared name. | Internal review policy. Actor names are not verified identities. |

Australian companies also generally keep financial records for at least seven years: [ASIC company records](https://www.asic.gov.au/for-business-and-companies/companies/company-building-blocks/company-record-keeping). Other retention duties vary. Ask the responsible adviser to set the full policy, including legal holds, storage location, access and eventual disposal. The software does not determine rights ownership or whether a royalty arrangement is lawful.

The contract record needs the signed agreement reference. Store original contracts and distributor reports in your controlled document store as well as retaining the imported report text here. An identifier is not a substitute for the agreement. There is no connection to a bank, payment processor, collection society or government filing system.
