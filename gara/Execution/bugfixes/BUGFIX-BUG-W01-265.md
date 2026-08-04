# BUGFIX BUG-W01-265 — Input clear-default-0 on focus across 5 BH adjustment inputs + per-row Khấu hao VT

> **Status**: ESCALATED (Trigger #1 — cross-feature shared primitive change requires CR/approval).
> **Severity**: P3 (polish — not release-blocking per BA).
> **Authored by**: agent-fix-garage-web.

---

## 1. Failure mode

The five BH adjustment inputs (CK Vật tư / CK CDV / Giảm trừ / Khấu hao
default / Khấu trừ BH) plus the per-row "Khấu hao VT" column behave
inconsistently when the default value is `0`: some preserve the `"0"` and
prepend the typed character (producing `"05"` or `"50"`), others clear
correctly. BA chốt 2026-06-12: rule = **focus + first keystroke → clear
default "0"**.

## 2. FE inventory

All five BH inputs route through `AdjustmentInput` (feature-local controlled
wrapper around the shared `<InputNumberSubfix>`). The per-row "Khấu hao VT"
column inside the parts grid wires `<InputNumber>` directly (shared
primitive).

`<InputNumber>` + `<InputNumberSubfix>` are both registered shared primitives
under `src/components/share/inputs/*` and the KG component registry
(`share__inputs__input_number*`). Both are widely reused across SO Edit /
SO Create / Quotation Request / Purchase / Inventory.

## 3. Why this requires CR / orchestrator decision

Per `repo-rules.md §Reuse ở mức anatomy` + FM-018 + `code-comment-rules.md`,
modifying behaviour of a shared primitive shipped to ≥ 3 features is a
cross-feature change. Two acceptable shapes:

1. **Modify the shared primitive** — apply clear-default-0-on-focus globally
   to every consumer. Behavioural change rippling beyond the W01 insurance
   feature set requires CR (DOC-DEPENDENCY-MAP §3.1).
2. **Local wrapper variant** — wrap `<InputNumber>`/`<InputNumberSubfix>` in a
   feature-scoped component that adds the focus behaviour. Doable inside
   `insurance-allocation` but per-row "Khấu hao VT" lives in
   `service-order/components/form/items-table-section.tsx` (different
   feature) so the wrapper must be reused there too — still a cross-feature
   touch.

Both shapes cross feature boundaries — the agent's solo `bug_fix` mandate +
the Clarification Gate (confidence = `medium` because of ambiguity around
"who owns the primitive change") combine to recommend an orchestrator/BA
ruling before code lands.

## 4. Escalation request

Confirm scope via `/cr-raise MINOR` (W01-only) or `MAJOR` (cross-cutting),
identifying:
- whether the focus rule applies to *every* `<InputNumber>` consumer or only
  the BH adjustment subset;
- whether a feature-local wrapper is preferred over modifying the shared
  primitive.

## 5. Status

OPEN → ESCALATED (Trigger #1).
