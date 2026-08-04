# BUGFIX-BUG-W01-300 — SO Create web: toggle "Bảo hiểm = Có" ẩn mất "Tổng chi phí"

| Field | Value |
|---|---|
| Bug ID | BUG-W01-300 |
| Severity | P2 |
| Status | RESOLVED (pending TEST_GROUP / QA verify) |
| Wave | W01 (EP-INSURANCE-SETTLEMENT) |
| Feature(s) | FEAT-SO-CREATE (baseline) + FEAT-INS-SO-ADJUSTMENT |
| Business Rule(s) | BR-INS-SO-PS-006, BR-INS-SO-ADJ-001 |
| Boundary | garage-web (`frontend/gf-gms-web`) |
| Fix Agent | agent-fix-garage-web |
| Fix Commit | `9dccf0178acbc39bc17dd7a2738532061a95d46f` |
| Fix Branch | `feature/ep-insurance-settlement-w01` |

## 1. Symptom

On SO Create (`/service-order/create`), toggling "Bảo hiểm = Có" caused the
"Tổng chi phí" panel (góc dưới phải: Tổng thành tiền dịch vụ + Tổng thành tiền
phụ tùng + Tổng thành tiền) to disappear entirely from the page. Toggling
"Bảo hiểm = Không" kept the panel visible (correct baseline). UAT canonical
showed the panel visible on both toggle states — SIT diverged from UAT.

Operational impact: kế toán không nhìn thấy tổng tiền sơ bộ khi báo giá SO có
bảo hiểm, làm gián đoạn workflow gửi DN bảo hiểm duyệt.

## 2. Root Cause

`frontend/gf-gms-web/src/features/service-order/components/form/index.tsx:331`
gated `<GrandSummary>` with `<Show when={!hasInsurance}>`. The gate was added
under BUG-W01-214 to prevent dual total panels on Edit + insurance-on (where
the Group C panel inside `<InsuranceAllocationSection>` replaces
`<GrandSummary>`). The gate did not condition on `isEditing`, so it fired on
Create as well.

`<InsuranceAllocationSection>` itself gated on `!!isEditing && !!hasInsurance`
(line 338) — out of scope on Create per BR-INS-SO-PS-006. The combination
left Create + insurance-on with neither panel rendered: `<GrandSummary>` hidden
because `hasInsurance=true`, allocation section hidden because `isEditing=false`.

Confirmed via:
- Code audit `frontend/gf-gms-web/src/features/service-order/components/form/index.tsx:331`, `:338`.
- `GrandSummary` (`./grand-summary.tsx`) renders unconditionally — no internal toggle.
- Existing `insurance-section-gate.test.ts` pinned the allocation-section
  gate but not the GrandSummary gate.

## 3. Fix

Single-line gate change at `form/index.tsx:331`:

```diff
-<Show when={!hasInsurance}>
+<Show when={!isEditing || !hasInsurance}>
   <GrandSummary
     serviceSummaryTotal={summary.serviceSummary.total}
     partSummaryTotal={summary.partSummary.total}
   />
 </Show>
```

Comment block at lines 112-115 rewritten to explain the new logic: on Create,
`<GrandSummary>` always renders (FEAT-SO-CREATE baseline + BR-INS-SO-PS-006
excludes the allocation section); on Edit + insurance-on, `<GrandSummary>` is
hidden because the Group C panel inside `<InsuranceAllocationSection>` is the
single source of truth for total cost.

## 4. Blast Radius

- Routes affected: `/service-order/create`, `/service-order/edit/:id`.
- Components touched: `form/index.tsx` only (host gate). No prop / contract change.
- Callers: `ServiceOrderForm` is consumed by the create + edit page wrappers.
  Both flows continue using the same form host — fix is local.
- Cross-boundary risk: none (FE-only display gate, no GraphQL / network /
  schema / persistence change).

State matrix verified (source-pin):

| Mode | hasInsurance | `<GrandSummary>` | `<InsuranceAllocationSection>` | Expected? |
|---|---|---|---|---|
| Create | Không | visible | hidden | ✅ baseline |
| Create | Có | **visible (fixed)** | hidden (BR-INS-SO-PS-006) | ✅ fixed |
| Edit | Không | visible | hidden (allocation gate) | ✅ no regress |
| Edit | Có | hidden | visible (Group C panel) | ✅ BUG-W01-214 anchor preserved |

## 5. Regression Test

`frontend/gf-gms-web/src/features/service-order/components/form/grand-summary-create-gate.test.ts`

5 specs (source-pinning, matches the existing `insurance-section-gate.test.ts`
pattern — full RHF + Apollo + zustand render harness is brittle here):

1. `renders <GrandSummary> on Create regardless of the insurance toggle` — pins the new gate literal.
2. `does NOT gate <GrandSummary> on !hasInsurance alone (pre-fix regression)` — catches direct re-introduction of the bug.
3. `keeps <InsuranceAllocationSection> gate intact (Edit + insurance-on only)` — protects BUG-W01-214 anchor.
4. `does NOT mount <InsuranceAllocationSection> on Create (BR-INS-SO-PS-006)` — protects the spec exclusion.
5. `still watches hasInsurance via useWatch (single source of truth)`.

All 5 pass. Existing `insurance-section-gate.test.ts` (3 specs) still passes.

## 6. Verification

```
cd frontend/gf-gms-web
npm test -- --run \
  src/features/service-order/components/form/grand-summary-create-gate.test.ts \
  src/features/service-order/components/form/insurance-section-gate.test.ts
# → 8 passed (5 new + 3 existing)

npm run build  # → exit 0 (built in 17.24s)
npm run lint   # → no new errors/warnings on touched files (61 errors, 70 warnings, all pre-existing in other files)
```

Two pre-existing test failures (`depreciation-persist.test.ts`,
`depreciation-material-column.test.ts`) reproduce on baseline HEAD before this
fix — unrelated, not introduced by this change.

## 7. Files Changed

- `frontend/gf-gms-web/src/features/service-order/components/form/index.tsx` (1 line of guard logic + comment block rewrite).
- `frontend/gf-gms-web/src/features/service-order/components/form/grand-summary-create-gate.test.ts` (new regression test, 5 specs).

## 8. Follow-ups (out of fix scope)

- **Spec amend (CR follow-up nhẹ)**: FEAT-SO-CREATE AC-2 hiện ngầm định
  "Tổng chi phí" panel render — nên amend explicit: "(a) Tổng chi phí panel
  render bất kể toggle Bảo hiểm Có/Không; (b) Phân bổ Bảo hiểm section KHÔNG
  render ở Create". Source: BR-INS-SO-PS-006 line 57 + BR-INS-SO-ADJ-001 line 65.
- Cross-environment SIT < UAT pattern (BUG-W01-297 sibling). Once this fix is
  deployed to SIT it should also clear the SIT regression there — no separate
  DevOps action needed once normal pipeline picks up.
- Pre-existing depreciation test failures should be triaged separately (not
  introduced by this change).

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-17 | 1 | agent-fix-garage-web | Initial BUGFIX doc — root cause + fix + regression test. |
