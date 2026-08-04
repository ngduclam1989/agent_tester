# BUGFIX BUG-W01-303 — Mobile SO Edit leak root depreciationPercent (no broadcast)

> **Status**: RESOLVED (commit `a7ed455a` "Refactor insurance-related code for clarity and performance", 2026-06-17). Verified by orchestrator from committed diff — code khớp spec (cờ `rootBroadcastCommitted` model→cubit state machine→gate cubit:786 + mapper:440; §9 resolved: `items_page_v3` push full input, `InsuranceAllocationInputPayload` vestigial→bỏ; test encode-bug đã sửa); analyze 0 error + 58 related tests pass (dev note). #5 preview-gate SKIPPED (optional). **Pending TEST_GROUP** + runtime T1 Charles 4-case / T3 DB (defer khi có stack).
> **Severity**: P1.
> **Boundary**: garage-mobile (Flutter).
> **Authored by**: agent-fix-garage-mobile (Wave 01, diagnosis) — code-verified against real repo paths (`lib/ui/`, `lib/core/`), NOT brief's guessed `lib/features/`.
> **Related**: **BUG-W01-285** (web counterpart, RESOLVED 2026-06-16 — `rootBroadcastCommitted` state machine anchor), BUG-W01-289 (STL snapshot cascade), BUG-W01-294/290 (mobile self-compute cluster).

---

## 1. Failure mode

SO Edit (SO có BH) Tab "Hạng mục": user nhập per-part "Khấu hao VT", nhập root "Khấu hao vật tư / thay mới" NHƯNG **không bấm "Áp dụng tất cả"** (Case A) → mutation `UpdateServiceOrderV3` vẫn gửi root `depreciationPercent` → BE override per-part, persist `service_order.root_depreciation_percent` sai (vi phạm EC-4 per-part canonical). Cascade snapshot FEAT-INS-STL-DETAIL (pattern BUG-289).

4-case canonical (mirror BUG-285): A = root+per-part typed, no broadcast; B = "Áp dụng tất cả"; C = per-part edit sau broadcast; D = clear cả 2.

## 2. Root cause

Mobile insurance allocation **không có cờ broadcast-committed** (web 285 có `rootBroadcastCommitted`). 2 điểm leak đã verify:

- **PRIMARY (Case A)** — `lib/ui/service_order_v3/service_order_creation_v3/service_order_creation_v3_cubit.dart:734-737`: `depreciationDefault: (state.hasInsurance && _pendingInsuranceAllocation != null) ? _pendingInsuranceAllocation!.depreciationPercent : null` → gửi root bất kể có broadcast hay không.
- **SECONDARY** — `lib/ui/service_order_v3/service_order_creation_v3/insurance_breakdown_mapper.dart:124` (`_depreciationPercentForPart`): trả `input.depreciationPercent` cho mọi BH part thiếu per-line override → stamp root percent lên `parts[i].depreciationPercent` của part chưa đụng.

## 3. Fix — Layer 1 (mirror web BUG-285), mobile-only

Thread một cờ `rootBroadcastCommitted` (default false) qua state → builder:

1. **`lib/ui/service_order/insurance/model/insurance_allocation_models.dart`** — `class InsuranceAllocationInput` (105-150): thêm `final bool rootBroadcastCommitted` (default false trong const ctor + copyWith). Carrier cho cả A/B/C/D.
2. **`lib/ui/service_order/insurance/cubit/insurance_allocation_cubit.dart`**:
   - `applyDepreciationToAll` (149-155) → `copyWith(..., rootBroadcastCommitted: true)` **[Case B commit]**
   - `setDepreciationForLine` (118-122) + `clearDepreciationForLine` (127-132) → `rootBroadcastCommitted: false` **[Case C invalidate]**
   - `setDepreciationPercent` (root input, 104-115) → **giữ nguyên** (chỉ sửa root field KHÔNG commit broadcast — đúng web)
   - `initParams` (27-40) → default false **[Case A/D]**
3. **`service_order_creation_v3_cubit.dart:734-737`** → gate: `... && _pendingInsuranceAllocation!.rootBroadcastCommitted ? ...depreciationPercent : null` **[A omit / B include]**.
4. **`insurance_breakdown_mapper.dart:124`** → `return input.rootBroadcastCommitted ? input.depreciationPercent : null` (untouched parts null khi chưa broadcast).
5. *(Optional, preview/payload consistency)* `InsuranceAllocationCalculator.depreciationAmount` (models:206) gate per-line fallback trên cờ — **CAUTION**: đổi realtime preview Case A/C/D; test preview cũ giả định fallback-without-broadcast là **encode hành vi bug**, phải update. Nếu muốn giảm blast radius: chỉ cần fix #3+#4 (contract) là đủ giải bug.

## 4. Case coverage

A: cờ false → cubit:734 omit root + mapper:124 untouched=null. B: true → root included + parts synced. C: `setDepreciationForLine`→false → root omit, per-part respected. D: false + empty map → không gửi cả 2.

## 5. Blast radius / cross-platform

- Chạm **mutation payload + DB persist** (KHÁC 290/294/295 display-only).
- **NO web regression risk**: web 285 là TS `frontend/gf-gms-web`, mobile là Dart `mobile/gf-garage-app` — chỉ share CONTRACT 4-case, không share code. T4 (re-run web Vitest) chỉ informational.

## 6. Regression test (apply-ready)

`test/ui/service_order/insurance/insurance_allocation_broadcast_test.dart` (group BUG-W01-303, mirror 6 web spec A/A-false/B/B-full/C/D):
- `bloc_test(InsuranceAllocationCubit)`: initial `rootBroadcastCommitted==false`; `applyDepreciationToAll`→true; broadcast rồi `setDepreciationForLine`→false.
- unit mapper: false + BH part không trong `depreciationByLine` → `part.depreciationPercent==null`; true → == root.
- unit gating payload: input false → no/null `depreciationDefault`; true → present.

## 7. Files to change

- `lib/ui/service_order/insurance/model/insurance_allocation_models.dart`
- `lib/ui/service_order/insurance/cubit/insurance_allocation_cubit.dart`
- `lib/ui/service_order_v3/service_order_creation_v3/service_order_creation_v3_cubit.dart`
- `lib/ui/service_order_v3/service_order_creation_v3/insurance_breakdown_mapper.dart`
- `lib/core/models/request/service_order/insurance_allocation_input.dart` (chỉ nếu `InsuranceAllocationInputPayload.toJson:28` ở live path — xem §9)
- `test/ui/service_order/insurance/insurance_allocation_broadcast_test.dart` (NEW)

## 8. Verification (DEFERRED)

`fvm flutter analyze` + `fvm flutter test` trên file đụng → TEST_GROUP (toolchain machine). Runtime triage cần env: **T1** Charles intercept `UpdateServiceOrderV3` 4-case → `Execution/test-reports/W01/MUI/BUG-W01-303-T1-mutation-payload-{A..D}.json`; **T3** DB `SELECT root_depreciation_percent FROM dev_gf_sales.service_order WHERE code='PDV-20260616-01095'` post Case-A.

## 9. Confirm-at-apply

- Xác nhận SO Edit widget push **full** `InsuranceAllocationInput` vào `_pendingInsuranceAllocation` (`cacheInsuranceAllocation(state.input)`) để cờ propagate tới builder:734. Nếu reconstruct field-by-field ở đâu đó → add cờ ở đó.
- Xác nhận `InsuranceAllocationInputPayload.toJson` (`lib/core/models/request/service_order/insurance_allocation_input.dart:25-34`) có ở live `UpdateServiceOrderV3` path hay vestigial (cubit:734 set `depreciationDefault` trực tiếp) — chỉ gate nếu live.
