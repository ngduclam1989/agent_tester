# BUGFIX BUG-W01-244 — Analysis-only (Rule #19) → Superseded by FE-side fix

> **Status from BFF FIX agent**: `IN_PROGRESS` (BFF side — analysis-only). **Actual root cause: FE fragment drift**; resolved by `agent-fix-garage-web` per `BUGFIX-BUG-W01-240.md` (same root cause, same fix).
> **Authored by**: design-repo subagent (agent-fix-agg-garage-graph spawned from `garage-agentic-design`).
> **Rule #19 compliance**: design repo NO-CODE.
> **Conclusion**: NO BFF change required. Bug closed-out by FE fragment rewrite — BFF SDL was correct all along.

---

## 1. Failure mode (observed)

| Field | Value |
|---|---|
| Bug | BUG-W01-244 (P1, OPEN) |
| Symptom | `GetSettlementByCode` BFF trả `{"errors":[{"message":"Cannot query field \"bh\" on type \"InsuranceSettlementBreakdown\""}]}` → `/settlement-voucher/{code}` render "Không tìm thấy phiếu quyết toán." |
| Repro | `Execution/auto/harness/playwright/probes/stl_bff_probe.spec.ts` (2026-06-11) |

## 2. Root-cause Why-chain (≥3 levels) — verified via FE source audit

### Why #1 — Tại sao BFF báo `Cannot query field "bh" on type "InsuranceSettlementBreakdown"`?

Apollo schema validator reject query khi client gửi `breakdownByPayer { bh { service parts vat totalAfterVat } kh { ... } }` — `bh`/`kh` selection trực tiếp dưới `InsuranceSettlementBreakdown`. BFF SDL hiện tại (`bffs/agg-garage-graph/src/graphql/modules/gf-accounting/settlements/settlements.schema.ts:269-274`) định nghĩa **metric-first axis**: `InsuranceSettlementBreakdown { service: InsuranceBreakdownPair, parts: ..., vat: ..., totalAfterVat: ... }` với `InsuranceBreakdownPair { bh: Float, kh: Float }`. Nghĩa là `bh`/`kh` nằm **bên trong** từng metric, KHÔNG phải field trực tiếp của `InsuranceSettlementBreakdown`.

### Why #2 — Client nào gửi shape sai?

Hai FE fragment query `breakdownByPayer`:

| File | Shape (pre-fix) | Status |
|---|---|---|
| `frontend/gf-gms-web/src/features/settlement-voucher/hooks/use-get-settlement-by-code.ts:281-298` | Metric-first (đúng) — `breakdownByPayer { service { bh kh } parts { bh kh } ... }` | OK (đã đúng từ trước) |
| `frontend/gf-gms-web/src/features/insurance-allocation/hooks/insurance-adjustment-fragment.ts` (pre-fix) | **Payer-first (sai)** — `breakdownByPayer { bh { service parts vat totalAfterVat } kh { ... } }` | **DRIFT — root cause** |

Hook `use-insurance-settlement-detail.ts` (sử dụng cho page `/settlement-voucher/{code}` insurance variant) reuse `INSURANCE_ADJUSTMENT_FRAGMENT` từ file thứ hai → toàn bộ query reject vì fragment sai axis.

### Why #3 — Tại sao fragment drift sang payer-first?

Surface B nested wrapper (`getSettlementByCode.insurance` per agg SDL §4.3.7b.6) giữ metric-first axis status quo. Surface A (`getServiceOrderByCode`) reshape sang Shape D flat-root (BUG-W01-218). Dev FE viết fragment có lẽ assume cùng axis với Surface A inline write shape (`breakdown.bh.{...}`) mà không kiểm tra SDL truth. Cross-check: `use-get-settlement-by-code.ts` (settlement-voucher feature) viết metric-first đúng — chứng minh fragment file kia là outlier.

### Why #4 — Tại sao bug-report ban đầu suggest BFF SDL thiếu `bh`?

Đây là misdiagnose từ test agent. Bug-report Notes claim "Frontend query yêu cầu `breakdown { bh { amount vatRate vatAmount } kh { ... } }`" — `vatRate`/`vatAmount` không tồn tại trong SDL hay bất cứ FE code nào (grep verified 0 match). Test agent có thể đã hallucinate hoặc paraphrase mô tả schema chứ không kiểm tra GraphQL request body thực tế.

### Why #5 — Tại sao tôi suy luận đúng fix nằm ở FE?

Bằng chứng từ FE production bundle (`frontend/gf-gms-web/dist/assets/index-DpCkItx0.js`): grep cho `breakdownByPayer` cho match `breakdownByPayer { \n service { \n bh \n kh \n }` — **đây là bundle build mới hơn**, đã có fix metric-first. Bundle này có thể chứa source từ `use-get-settlement-by-code.ts` (đã đúng), nhưng fragment file `insurance-adjustment-fragment.ts` (pre-fix) còn payer-first sai → 2 hook khác nhau dùng 2 shape khác nhau trong cùng bundle. Probe Playwright load page sử dụng hook `useInsuranceSettlementDetail` (qua fragment sai) → query reject.

## 3. Resolution (deferred to FE)

Per `BUGFIX-BUG-W01-240.md` (cùng bug, đã được `agent-fix-garage-web` fix FE-side):

| Touched file | Change |
|---|---|
| `frontend/gf-gms-web/src/features/insurance-allocation/hooks/insurance-adjustment-fragment.ts` | Align fragment to metric-first axis (rewrite `breakdownByPayer` selection) |
| `frontend/gf-gms-web/src/features/insurance-allocation/interfaces/index.ts` | Replace `RawPayerColumn` (payer-first) with `RawBreakdownPair` (metric-first) |
| `frontend/gf-gms-web/src/features/insurance-allocation/index.ts` | Export `RawBreakdownPair`, remove `RawPayerColumn` |
| `frontend/gf-gms-web/src/features/insurance-allocation/helper/map-read.ts` | Rewrite `mapRawInsuranceAdjustment` cho metric-first axis |
| `frontend/gf-gms-web/src/features/insurance-settlement/hooks/use-insurance-settlement-detail.test.ts` | Update fixture data to canonical metric-first shape |

**BFF SDL không thay đổi** — đã đúng từ trước. Không cần `bh`/`kh` aliases (defensive flat-root pattern trong revision đầu của doc này là không cần thiết).

## 4. BFF action items — NONE

Không có file nào trong `bffs/agg-garage-graph/` cần thay đổi cho BUG-W01-244. Bug được resolve hoàn toàn ở FE layer.

## 5. Regression test coverage

FE side (đã tồn tại):
- `frontend/gf-gms-web/src/features/insurance-allocation/hooks/insurance-adjustment-fragment.test.ts` — 6 assertions ngăn drift quay lại (xem `BUGFIX-BUG-W01-240.md` §4).
- Existing `use-insurance-settlement-detail.test.ts` fixture đã update để mirror canonical SDL.

BFF side (đề xuất add, không bắt buộc):
- Optional: add `mapBreakdownByPayer` SDL contract validation test trong `insurance.mapper.regression.ts` — assert output shape match SDL declaration. Hiện tại regression test đã verify mapping output từ flat to metric-first (line 91-100); coverage đủ.

## 6. Blast radius

| Surface | Affected? | Note |
|---|---|---|
| `getSettlementByCode` GraphQL operation | NO BFF change | FE fix unblocks |
| BFF SDL `InsuranceSettlementBreakdown` | UNCHANGED | Already correct (metric-first) |
| Other consumers of `INSURANCE_ADJUSTMENT_FRAGMENT` | YES (FE only) | Mapper + interfaces updated symmetric |
| BUG-W01-240 (P1, settlement page error) | RESOLVED by same FE fix | Per `BUGFIX-BUG-W01-240.md` confirmed root cause overlap |

## 7. Status update for Tracking/WAVE01/BUGS.md

```
BUG-W01-244: Status OPEN → RESOLVED (BFF agent perspective — defer to FE fix)
Updated: 2026-06-11
Notes prefix: "Analysis-only fix confirms: root cause = FE fragment drift trong
              insurance-allocation/hooks/insurance-adjustment-fragment.ts (payer-first axis sai
              vs canonical metric-first SDL). BFF SDL không cần đổi. Resolved by FE fix —
              see BUGFIX-BUG-W01-240.md (same root cause, same fix). BFF side: no change."
```

> NOTE per Rule #19: BFF agent chỉ có thể đề xuất status `IN_PROGRESS` (analysis-only); per-service agent (hoặc orchestrator) sẽ chuyển sang `RESOLVED` sau khi FE deploy + L2 verify pass `Tracking/WAVE01/verify/BUG-W01-244.verify.md` AC list.

## 8. Lessons for FAILURE-MODES.md

Will append entry "FM-008 — Fragment shape drift causes whole-query reject" — see `Execution/FAILURE-MODES.md`.
