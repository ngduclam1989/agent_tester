# BUGFIX BUG-W01-246 — INSURANCE vs non-INSURANCE STL detail UI drift

> **Status**: VERIFIED (pending live re-test post-image-rebuild).
> **Authored by**: agent-fix-garage-web.
> **Cluster**: BUG-W01-247 (edit handler) — same patch addresses typography + handler wiring.

---

## 1. Failure mode

| Field | Value |
|---|---|
| Bug | BUG-W01-246 (P2) — FEAT-INS-STL-DETAIL / AC-01..05 |
| Symptom | INSURANCE branch renders from a separate component tree (own header layout, own tabs, own typography) vs the baseline shell → visible UI drift between two STL detail pages |
| Reporter | QC-Manual (evidence: `SET-20260610-00001` non-INS vs `SET-20260610-00002` INS screenshots) |

## 2. Investigation

The dispatcher (`settlement-detail-dispatcher.tsx`) routes by `settlementType`:

- INSURANCE → `<InsuranceSettlementDetailPage>` (own header/tabs/Container — `features/insurance-settlement/components/detail/insurance-settlement-detail-page.tsx`)
- non-INSURANCE → `<SettlementVoucherDetail>` (uses `<PageHeader>`, `<Section>`, `<TabButtons>` shared shells)

This separation is **intentional** per FEAT-INS-STL-DETAIL AC-1..AC-11 + Figma 13256:45155 — INSURANCE has design-mandated additions:

- AC-1 status badge (DRAFT)
- AC-1 `+ Tạo hồ sơ bảo hiểm` action (W02-disabled with tooltip)
- AC-2 `Đơn vị thanh toán` field (insurance company name)
- AC-8 `Hồ sơ bảo hiểm đã xuất` tab

So the bug's "single base shell" expectation is at odds with the FEAT spec. The bug's Notes flag this explicitly: "NEED CONFIRMATION từ design-source: design Figma có yêu cầu UI khác biệt giữa 2 branch (vd extra header tag) không? Nếu CÓ → vẫn refactor base shell + slot, vẫn fix bug."

### Resolution decision

The two-tree architecture remains (intentional per spec). The fix narrows to the **parity items** the bug explicitly identifies as cross-tree drift that should NOT exist regardless of spec divergence:

- Typography: `Chứng từ & hoá đơn` (insurance, legacy diacritic) vs `Chứng từ & hóa đơn` (baseline, canonical). KG / Product convention is the canonical `hóa đơn`.
- Action affordance behavior: `Chỉnh sửa` button on INSURANCE branch is no-op (addressed in BUG-W01-247 same patch).

Refactoring INSURANCE into a single shell + conditional slots would be feature-scope work that would also conflict with the FEAT spec's deliberate layout differences. Out of fix scope.

## 3. Fix

### 3.1 Typography canonicalization

`frontend/gf-gms-web/src/features/insurance-settlement/constants/index.ts:28`:

```diff
- [INSURANCE_SETTLEMENT_TABS.DOCUMENTS]: "Chứng từ & hoá đơn",
+ [INSURANCE_SETTLEMENT_TABS.DOCUMENTS]: "Chứng từ & hóa đơn",
```

This brings the INSURANCE DOCUMENTS tab label in line with the baseline `Chứng từ & hóa đơn` (used in 4 other places under `features/settlement-voucher/**`).

### 3.2 Handler parity (gộp BUG-W01-247)

See `BUGFIX-BUG-W01-247.md` — dispatcher wires `onEdit`/`onBack`/`onOpenServiceOrder` so the INSURANCE action bar buttons behave identically to the non-INSURANCE branch.

## 4. Files touched

| File | Change |
|---|---|
| `frontend/gf-gms-web/src/features/insurance-settlement/constants/index.ts` | DOCUMENTS tab label canonical spelling |
| `frontend/gf-gms-web/src/features/insurance-settlement/constants/tab-labels.test.ts` | NEW — 2 regression assertions |
| (also: see BUGFIX-BUG-W01-247.md for handler wiring patch) |  |

## 5. Regression test

`tab-labels.test.ts`:

1. `TAB_LABELS[DOCUMENTS] === "Chứng từ & hóa đơn"` (canonical present).
2. `TAB_LABELS[DOCUMENTS]` does NOT match `/hoá đơn/` (legacy absent).

## 6. Verification

- `cd frontend/gf-gms-web && npx vitest run` → 56/56 PASS.
- `cd frontend/gf-gms-web && npm run build` → exit 0.
- `cd frontend/gf-gms-web && npx eslint` on touched files → 0 errors.

Live UI re-test deferred — VERIFY_PENDING after image rebuild.

## 7. Residual / Follow-ups

- INSURANCE and baseline shell still render different component trees (intentional per FEAT-INS-STL-DETAIL). If product later decides on a unified shell with conditional slots, that is a feature-scope change for `agent-dev-garage-web`.
- The alternative `insurance-settlement/components/detail/index.tsx` (un-exported, reuses baseline subcomponents) still carries the legacy `hoá đơn` spelling at line 147; left untouched because it is not the live render path (export goes through `insurance-settlement-detail-page.tsx`). Flag as Follow-up if that alternative becomes the canonical path later.
- "Đơn vị thanh toán" field is already rendered in INSURANCE branch (`settlement-info.tsx:81`) — no parity gap on that item.
