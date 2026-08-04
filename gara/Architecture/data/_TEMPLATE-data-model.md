---
type: architecture
artifact_kind: data-model
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: "{{boundary}}"
last_reviewed: "2026-05-02"
---

# Data Model — {{boundary}}

## 1. ERD Overview
```
{{ASCII ERD or description}}
```

## 2. Entities

### {{EntityName}}

| Column | Type | Nullable | Description |
|---|---|---|---|
| id | UUID | NO | Primary key |
| {{column}} | {{type}} | {{YES/NO}} | {{description}} |
| created_at | TIMESTAMP | NO | Creation timestamp |
| updated_at | TIMESTAMP | NO | Last update timestamp |

**Indexes**: {{list indexes}}
**Constraints**: {{list constraints}}

## 3. Data Isolation
{{How tenant/scope isolation is enforced at data level}}

## Change Log
| Date | Summary | Author |
|---|---|---|
| 2026-05-02 | Initial data model | Architecture Authority |
