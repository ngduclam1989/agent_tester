# BUGFIX BUG-W01-268 — SO Detail "Khấu hao VT" column label + alignment parity

> **Status**: RESOLVED.
> **Severity**: P2.
> **Authored by**: agent-fix-garage-web (Wave 01).
> **Related**: BUG-W01-254 (rename label on SO Edit only).

---

## 1. Failure mode

| Surface | Header text | Cell alignment |
|---|---|---|
| SO Edit (before) | "Khấu hao VT" (already renamed by BUG-W01-254) | `text-right` |
| SO Detail (before) | "Khấu hao" (stale label) | `text-right` |

Expected (BA chốt 2026-06-12): both surfaces render header "Khấu hao VT" and
align cell value to the left.

## 2. Root cause

BUG-W01-254 only updated the SO Edit column metadata (`form/items-table-section.tsx`).
The SO Detail parts grid (`detail/parts-used.tsx`) declares its own column
metadata which still carried the stale `"Khấu hao"` header + `text-right`
alignment.

## 3. Fix

1. `frontend/gf-gms-web/src/features/service-order/components/detail/parts-used.tsx`
   — rename column header `"Khấu hao"` → `"Khấu hao VT"`; swap meta to
   `headerClassName: "text-left"`, `cellClassName: "text-left"`.
2. `frontend/gf-gms-web/src/features/service-order/components/form/items-table-section.tsx`
   — swap the SO Edit column meta from `"w-32 text-right"` /  `"text-right"`
   to `"w-32 text-left"` / `"text-left"` so the two surfaces are visually
   identical.

## 4. Regression test

`parts-used-depreciation-label.test.ts` — source-level guard that the SO
Detail column declares header `"Khấu hao VT"` and `text-left` meta.

## 5. Verification

```
cd frontend/gf-gms-web
npx vitest run   # 91/91 PASS
npx tsc -b       # exit 0
yarn build       # exit 0
```

## 6. Status

OPEN → RESOLVED.
