# BUG-W01-245 — CR Amendment: Surface B reshape sang Shape D (Settlement insurance)

> **Status**: DRAFT — pending review từ `agent-fix-orchestrator` + Tech Lead.
> **Authored by**: agent-test-api (W01 QC, 2026-06-11).
> **Type**: Decision artifact (proposal — chưa raise CR).
> **Supersedes target**: `BUGFIX-BUG-W01-240.md` (FE-only fragment fix) + resolves `BUG-W01-244` (BFF SDL mismatch symptom).
> **Cross-ref**: `Architecture/integrations/INTEG-BFF-agg-garage-graph.md` §4.3.7b.6 (Open follow-up).

---

## 1. Background

`Architecture/integrations/INTEG-BFF-agg-garage-graph.md` v6 (2026-06-10) chốt **Shape D — flat root** cho Surface A (`getServiceOrderByCode` / `getServiceOrderByIdV3`) — drop wrapper `InsuranceAdjustmentBlock` + nested `breakdownByPayer`, bubble 16 field BH lên `ServiceOrder` root. Mapper BFF = pure passthrough.

Lock đó **không áp dụng** Surface B (`getSettlementByCode`) — INTEG §4.3.7b.6 ghi rõ Open follow-up với 3 option:

| Option | Mô tả | Verdict (per INTEG §4.3.7b.6) |
|---|---|---|
| **D'** | Apply Shape D đệ quy: drop `Settlement.insurance` wrapper; bubble 14 field lên `Settlement` root | **✅ Recommended — symmetric + single mental model** |
| **C** | Giữ wrapper `Settlement.insurance` nhưng flat fields inside (drop `breakdownByPayer` nest) | Compromise |
| **Status quo** | Giữ nested SDL hiện tại (Shape B) | **"Tránh — drift unresolved giữa Surface A và B"** |

Decision artifact dành riêng cho Open follow-up này — chính là file đang đọc.

## 2. Trigger — BUG-W01-240 + BUG-W01-244 phơi bày drift

| Bug | Symptom | Root cause (analyzed) | Hiện trạng |
|---|---|---|---|
| `BUG-W01-240` (P1) | Trang `/settlement-voucher/{code}` render "Không tìm thấy phiếu quyết toán" cho 3 mã STL | FE fragment `insurance-adjustment-fragment.ts` query axis sai (`breakdownByPayer.bh.{metric}` payer-first) ≠ BFF SDL (`breakdownByPayer.{metric}.{bh,kh}` metric-first) | RESOLVED (FE-only patch — align FE về metric-first Status quo) |
| `BUG-W01-244` (E2E) | BFF response `Cannot query field "bh" on type "InsuranceSettlementBreakdown"` | Cùng root cause như BUG-W01-240 | De-facto resolved by BUG-W01-240 fix |

`BUGFIX-BUG-W01-240.md` ghi rõ: "BFF SDL is correct as-is and no BFF change is required." Đây là statement đúng **nếu chấp nhận Status quo Shape B**.

## 3. Vấn đề với fix hiện tại

Fix của BUG-W01-240 = align FE với **Status quo** — chính là option mà INTEG §4.3.7b.6 đánh dấu **"Tránh — drift unresolved"**. Hậu quả nếu cement:

1. **Mental model split**: developer phải nhớ 2 shape khác nhau cho cùng domain BH:
   - SO V3: 16 field flat trên root (Shape D)
   - Settlement: wrapper `insurance` + nested `breakdownByPayer.{metric}.{bh,kh}` + `settlementBalance` (Shape B)

2. **FE complexity dồn tích**: `frontend/gf-gms-web/src/features/insurance-settlement/` đã có sẵn `mapShapeBToFlatRoot` adapter (Shape B → Shape D cho `IInsuranceSettlementCostPanel`). Đây là dấu hiệu FE đã muốn thoát Shape B nhưng bị BFF SDL giữ lại.

3. **BFF mapper LOC**: `bffs/agg-garage-graph/src/graphql/modules/gf-accounting/settlements/insurance.mapper.ts` ~250 LOC cho D9 nest + D4/D5/D6/D7 rename + reconcile balance + adjustments derive. Shape D reshape cắt được ~150 LOC.

4. **Contract test surface gấp đôi**: agent-test-api phải duy trì 2 query template + 2 set assertion path cho cùng domain. Mọi feature mới đụng BH phải nhớ rule "SO root, Settlement wrapper".

5. **Drift trace dài**: BUG-W01-209 → BUG-W01-213 → BUG-W01-218 → BUG-W01-240/244 đều là biểu hiện của shape divergence. Status quo = chấp nhận chuỗi này tiếp diễn.

## 4. Decision proposal — Option D' (Shape D đệ quy cho Surface B)

### 4.1 Target SDL (BFF)

Drop từ `bffs/agg-garage-graph/src/graphql/modules/gf-accounting/settlements/settlements.schema.ts`:
- `type InsuranceAdjustmentBlock` (wrapper)
- `type InsuranceSettlementBreakdown`
- `type InsuranceBreakdownPair`
- `type InsuranceSettlementHeader`
- Field `Settlement.insurance: InsuranceAdjustmentBlock`

Bubble lên `SettlementByCodeData` root (đặt tên field **giống Surface A** để symmetric):

```graphql
type SettlementByCodeData {
  # ── Meta (đã ở root, giữ nguyên) ──
  hasInsurance: Boolean
  insuranceCompany: String
  insuranceCompanyName: String
  insurancePolicyNumber: String
  insuranceExpiryDate: String
  assessorName: String
  insuranceContactPhone: String

  # ── 5 composite adjustments (bubble lên từ wrapper) ──
  discountMaterial: InsuranceAdjustment
  discountLabor: InsuranceAdjustment
  depreciation: InsuranceAdjustment
  claimReduction: InsuranceAdjustment
  insuranceDeductible: InsuranceAdjustment

  # ── 8 breakdown scalar (flat, drop nested pair) ──
  serviceInsurance: Float
  serviceCustomer: Float
  partsInsurance: Float
  partsCustomer: Float
  vatInsurance: Float
  vatCustomer: Float
  totalAfterVatInsurance: Float
  totalAfterVatCustomer: Float

  # ── 3 balance scalar (flat, drop header wrapper) ──
  insurancePayment: Float    # renamed từ bhPayment để khớp Surface A
  customerPayment: Float
  totalPayment: Float

  # ── Settlement-only (giữ nguyên — không có ở SO V3) ──
  code: String
  settlementType: SettlementType
  relatedSettlementCode: String
  settlementStatus: SettlementDetailStatusEnum
  settlementPaymentStatus: SettlementPaymentStatus
  settledAt: String
  settledBy: String
  settledByName: String
  documents: [SettlementDocumentData]
  debtPanel: InsuranceDebtPanel    # giữ standalone — chỉ Settlement có
  totalServiceAmount: Float
  totalPartsAmount: Float
  discountAmount: Float
  taxAmount: Float
  finalAmount: Float
  # ... các field SO snapshot khác giữ nguyên ...
}
```

`InsuranceDebtPanel` giữ standalone (5 field) vì hoàn toàn không có concept ở Surface A.

### 4.2 BFF mapper change

`insurance.mapper.ts`:
- **Xoá**: `mapBreakdownByPayer()` (D9 nest transform), `buildSettlementBalance()` (reconcile + wrapper builder), `mapInsuranceBlock()` (compose wrapper).
- **Giữ**: `buildAdjustmentsFromAccounting()` (vẫn cần derive `amount` từ mode+value+base per BUG-W01-212 + BR-INS-SO-ADJ-005).
- **Giữ**: `mapDebtPanel()` (D4/D5/D6/D7 rename + paymentStatus enum widen — không đổi).
- Bubble 8 breakdown scalar + 3 balance scalar trực tiếp từ gf-accounting REST response lên root (pure passthrough).

Tổng giảm ước tính: **~150 LOC mapper**.

`settlements.types.ts`: TS types khớp shape mới (drop wrapper interfaces).

`settlements.resolver.ts`: KHÔNG đổi flow — vẫn 2 backend call (gf-accounting settlement + gf-sales SO detail), chỉ output shape khác.

### 4.3 FE change

`frontend/gf-gms-web/src/features/insurance-allocation/`:
- `hooks/insurance-adjustment-fragment.ts` — **rewrite lần 2**: từ metric-first nested (current post-BUG-240) → flat root 16 scalar. Cùng pattern Surface A fragment.
- `interfaces/index.ts` — xoá `RawBreakdownPair`, `RawInsuranceAdjustmentBlock`. Định nghĩa `RawSettlementInsuranceFlat` (16 field root). Tái dùng `RawInsuranceAdjustment` (5 composite type — giống Surface A).
- `helper/map-read.ts` — đọc thẳng root, drop nest unwrap.
- `index.ts` — export rewrite.

`frontend/gf-gms-web/src/features/insurance-settlement/`:
- `hooks/use-insurance-settlement-detail.test.ts` — fixture chuyển lần 2 sang flat root.
- Cost panel adapter `mapShapeBToFlatRoot` — **drop hoàn toàn** (thừa khi Shape D thống nhất).

`frontend/gf-gms-web/src/features/settlement-voucher/` (nếu áp dụng):
- `hooks/use-get-settlement-by-code.ts` — update query template tương ứng.

### 4.4 Spec + test artifact (owned bởi agent-test-api)

- `Architecture/integrations/INTEG-BFF-agg-garage-graph.md`:
  - §4.3.7b.4 — rewrite Surface B field map theo flat root. Drop D9 row, drop wrapper rows. Giữ D4/D5/D6/D7 cho `InsuranceDebtPanel`.
  - §4.3.7b.6 — chuyển Status: Open follow-up → **RESOLVED via Option D'**. Point sang file này.
  - Change Log v7.
- `Architecture/api/gf-accounting-api.md` — KHÔNG đổi REST contract (gf-accounting REST flat shape đã đúng). Chỉ note BFF mapper passthrough hơn.
- `Execution/automated-test-cases/W01/agg-garage-graph/` — viết lại contract test Surface B flat root, retire metric-first axis test (`breakdownByPayer.{metric}.{bh,kh}` → 8 scalar assertions).
- `Tracking/WAVE01/verify/BUG-W01-245.verify.md` (NEW) — acceptance criteria cho reshape.

### 4.5 Backend

gf-accounting REST contract: **KHÔNG đổi**. REST shape (flat 8 breakdown + 5 adjustment mode/value + insurancePayableAmount + debtPanel flat) đã sẵn sàng cho Shape D — chỉ BFF mapper đổi.

## 5. Decision matrix

| Tiêu chí | Status quo (giữ BUG-W01-240 fix) | Option D' (reshape — Recommended) |
|---|---|---|
| Effort ngắn hạn | DONE (FE 5 file đã ship) | +1 BFF SDL + mapper, +1 FE fragment rewrite (lần 2), +1 spec update §4.3.7b.4-6, +1 CR MAJOR |
| Drift Surface A/B | Vẫn tồn tại — INTEG §4.3.7b.6 OPEN | RESOLVED — symmetric |
| Mental model | 2 shapes (Shape D root vs Shape B wrapper) | 1 shape (flat root) |
| FE complexity | `map-read.ts` ~30 LOC + `mapShapeBToFlatRoot` adapter | Drop 2 layer, đọc thẳng root |
| BFF mapper LOC | ~250 (D9 + D4-D7 + reconcile + adjustments) | ~80 (chỉ adjustments derive + debtPanel rename) |
| Test surface | 2 query template + 2 set assertion | 1 fragment shape, reuse Surface A pattern |
| Risk regression | Thấp (fix hiện đã ship + 48/48 test pass) | Trung — cần re-test 14 TC (TC-AUTO-077..090) + 4 CONF + e2e STL detail |
| Long-term cost | Cao — mọi feature mới đụng STL phải nhớ wrapper | Thấp — pattern thống nhất |
| Stakeholder alignment | INTEG doc đã đánh dấu Status quo là **"Tránh"** | INTEG doc đã đánh dấu D' là **"Recommended"** |

## 6. Scope summary

**1 file decision artifact** (current scope, đang đọc) — không touch code BFF/FE/spec.

Nếu approved → CR MAJOR sẽ touch:
- **BFF** (`bffs/agg-garage-graph/.../settlements/`): 4 file (schema, types, mapper, ít sửa resolver)
- **FE** (`frontend/gf-gms-web/src/features/insurance-allocation/` + `insurance-settlement/`): 5-7 file
- **Spec** (`Architecture/integrations/INTEG-BFF-agg-garage-graph.md`): §4.3.7b.4 rewrite + §4.3.7b.6 close + Change Log v7
- **Test** (`Execution/automated-test-cases/W01/agg-garage-graph/` + `Tracking/WAVE01/verify/`): rewrite contract test + new verify file
- **Tracking** (`Tracking/WAVE01/BUGS.md`): row BUG-W01-245 (CR-AMENDMENT type)

Cross-boundary (BFF + FE + spec) → **`/cr-raise MAJOR`** bắt buộc per Critical Rule #5 + Rule #19.

## 7. Rollback plan

Nếu reshape gây regression không sửa được trong wave window:
- BFF revert: 1 git revert trong `bffs/agg-garage-graph/`
- FE revert: 1 git revert trong `frontend/gf-gms-web/`
- Spec revert: 1 git revert trong design repo
- Mỗi repo 1 commit atomic → rollback đơn giản.

## 8. Open questions cho `agent-fix-orchestrator`

1. **Bug ID**: chấp nhận `BUG-W01-245` hay assign số khác?
2. **Timing**: thực hiện trong W01 QC window hay defer sang W02 (post-launch hardening)?
3. **Co-ordination**: agent-fix-agg-garage-graph + agent-fix-garage-web phải sync rollout — ai làm trước? Có cần feature flag hay rebuild atomic?
4. **BUG-W01-240 status**: sau khi reshape, fix metric-first hiện tại trên FE sẽ thành "deprecated path". Có cần đánh dấu BUG-W01-240 thành "superseded by BUG-W01-245" trong Tracking/BUGS.md không?
5. **Rollback policy**: nếu cần revert, có cần coordination với QC để tránh false-fail re-test?
6. **Field naming**: trong target SDL §4.1 tôi đặt `insurancePayment` (theo Surface A naming) thay cho `bhPayment` hiện tại. Confirm hay giữ `bhPayment` cho consistency với `insurance.settlementBalance.bhPayment` cũ?

## 9. Recommendation

**APPROVE Option D'** — reshape Surface B sang Shape D flat root.

Justification:
- INTEG doc đã đánh dấu D' là **✅ Recommended** từ 2026-06-10
- Status quo đã được đánh dấu **"Tránh"** ngay trong cùng artifact
- BUG-W01-240's FE-only fix là patch level-1; root cause level-2 là drift Surface A/B chưa giải
- Long-term cost của Status quo lớn hơn one-time effort của reshape
- gf-accounting REST contract đã sẵn sàng — chỉ BFF + FE phải thay đổi

Nếu approved → tôi (agent-test-api) sẽ chuẩn bị draft CR MAJOR body + verify file + contract test rewrite. agent-fix-agg-garage-graph + agent-fix-garage-web rollout code trong repo riêng.

## 10. Sign-off

| Role | Name | Status | Date |
|---|---|---|---|
| Author | agent-test-api | DRAFT submitted | 2026-06-11 |
| Reviewer | agent-fix-orchestrator | PENDING | — |
| Reviewer | Tech Lead | PENDING | — |
| Reviewer | agent-fix-agg-garage-graph (BFF owner) | PENDING | — |
| Reviewer | agent-fix-garage-web (FE owner) | PENDING | — |

## 11. References

- Plan analysis: `/home/engineer_ac/.claude/plans/ph-n-t-ch-ph-n-kh-c-vivid-scott.md`
- Surface A reshape decision (precedent): referenced in `Architecture/integrations/INTEG-BFF-agg-garage-graph.md` Change Log v6 (2026-06-10), §4.3.7b.1
- BUG-W01-240 fix: `Execution/bugfixes/BUGFIX-BUG-W01-240.md`
- BUG-W01-244 (cross-team confirmation): `Tracking/WAVE01/verify/BUG-W01-244.verify.md`
- Open follow-up: `Architecture/integrations/INTEG-BFF-agg-garage-graph.md` §4.3.7b.6
- Backend contract (no change): `Architecture/api/gf-accounting-api.md`
- Business rule (mode/sign/transferToCustomer): `Product/business-rules/BR-EP-INSURANCE-SETTLEMENT.md` BR-INS-SO-ADJ-005

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-11 | 1 | agent-test-api | Initial draft — propose Option D' (Shape D đệ quy cho Surface B), supersede BUG-W01-240 patch, resolve INTEG §4.3.7b.6 Open follow-up. Pending review từ agent-fix-orchestrator + Tech Lead. |
