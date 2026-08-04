# BUGFIX-BUG-W01-252: gf-sales tính CK liên kết BH trên cơ sở trước VAT thay vì Cộng sau VAT

## Bug

| Thuộc tính | Chi tiết |
|---|---|
| **ID** | BUG-W01-252 |
| **Service** | gf-sales |
| **Priority** | P1 |
| **Source TC** | Manual QC 2026-06-12 |
| **Feature / AC** | FEAT-INS-SO-ADJUSTMENT / BR-EP §7.1, CALC-INS-001 |
| **Mô tả** | `computeSettlementSummary` tính CK liên kết BH (Vật tư + Công DV) và Khấu hao phụ tùng trên cơ sở tiền **trước VAT** thay vì **Cộng sau VAT** (post-VAT). Kết quả `insurancePayable` cao hơn expect khoảng 10%×CK vì VAT bị bỏ qua khỏi cơ sở. |

## Reproduction Steps

Pre-fix: tạo SO có BH với parts BH amount=100,000 + VAT=10,000 (10%). Nhập `discountMaterialMode=PERCENT, discountMaterialValue=10`.

- Expected CK = 10% × 110,000 (post-VAT) = 11,000
- Actual (pre-fix) CK = 10% × 100,000 (pre-VAT) = 10,000 → lệch 1,000

Tương tự với depreciation: parts 80,000 + VAT 8,000, depreciationPercent=25%.

- Expected depreciation = 25% × 88,000 (post-VAT) = 22,000
- Actual (pre-fix) = 25% × 80,000 (pre-VAT) = 20,000 → lệch 2,000

## Root Cause

Why-chain:

1. **Why `insurancePayable` thấp hơn expect?** Vì `ckMaterial` và `ckLabor` được tính trên cơ sở nhỏ hơn spec, làm CK thấp hơn → phần còn lại (insurancePayable) không đổi nhưng sai so với kỳ vọng.
   Wait — CK là khoản **giảm trừ** khỏi BH payable, nên CK nhỏ hơn (pre-VAT < post-VAT) → insurancePayable **cao hơn** expect.
2. **Why là base pre-VAT?** `computeSettlementSummary()` truyền `partsIns` (= `sumParts(parts, false)`) trực tiếp làm base cho `computeDiscount(ckMaterial, partsIns, ...)`. `sumParts` chỉ sum `part.amount` (pre-VAT) mà không add `taxAmount`.
3. **Why không có post-VAT sum?** Chỉ có helper `sumTax(parts, isCustomer)` cho VAT aggregate, nhưng không có helper sum riêng theo category (parts vs service). Và không có post-VAT base được tính ra.
4. **Why depreciation cũng sai?** `computeDepreciationAmount(part, percent)` đọc `part.getAmount()` (pre-VAT scalar) thay vì `part.getFinalAmount()` (= amount + taxAmount).
5. **Why spec yêu cầu post-VAT?** BR-EP §7.1 line 358: "Cơ sở tính = 'Cộng sau VAT'" — tất cả khoản điều chỉnh đều tính trên giá sau VAT. Ký kết BH thường dựa trên total payment bao gồm thuế.

Net root cause: thiếu per-category VAT helpers và hai điểm code đọc sai field (`amount` thay vì `finalAmount` cho depreciation; `partsIns`/`serviceIns` pre-VAT thay vì post-VAT cho CK percent base).

## Fix

- **Files changed:**
  - `services/gf-sales/src/main/java/com/actechx/gf/app/service/ServiceOrderInternalService.java`
    - Thêm 2 private helpers `sumServiceTax(items, isCustomer)` và `sumPartsTax(parts, isCustomer)` để sum VAT theo payer per category.
    - Trong `computeSettlementSummary()`: tính `vatServiceIns`, `vatPartsIns`, `partsPostVatIns = partsIns + vatPartsIns`, `servicePostVatIns = serviceIns + vatServiceIns`. Truyền `partsPostVatIns` và `servicePostVatIns` làm base cho `computeDiscount(ckMaterial, ...)` và `computeDiscount(ckLabor, ...)`.
    - Trong `computeDepreciationAmount(part, percent)`: đổi `part.getAmount()` → `part.getFinalAmount()` để dùng post-VAT value.
  - `services/gf-sales/src/test/java/com/actechx/gf/app/service/InsuranceSettlementCalculationTest.java`
    - Cập nhật helper `part()` để set `.finalAmount(safeAmount.add(safeTax))` — các test cũ dùng VAT=0 nên không bị ảnh hưởng.
    - Thêm 3 regression tests cuối file (xem §Regression Test).

- **Approach rationale:** thêm category-level VAT aggregation thay vì merge VAT vào `sumParts`/`sumService` toàn phần — tránh ảnh hưởng các branch khác (customer breakdowns, VAT line). `computeDepreciationAmount` change là minimal 1-field swap.

## Regression Test

- **File:** `services/gf-sales/src/test/java/com/actechx/gf/app/service/InsuranceSettlementCalculationTest.java`
- **Test names (BUG-W01-252):**
  - `bug252_ckMaterialPercent_usesPostVatBase` — parts amount=100K, taxAmount=10K, discountMaterialMode=PERCENT(10%) → expected ckMaterial base=110K, CK=11K, insurancePayable=99K. Pre-fix: base=100K → CK=10K → FAIL.
  - `bug252_ckLaborPercent_usesPostVatBase` — service amount=50K, taxAmount=5K, discountLaborMode=PERCENT(5%) → expected base=55K, CK=2,750. Pre-fix: base=50K → CK=2,500 → FAIL.
  - `bug252_depreciation_usesPostVatBase` — parts amount=80K, taxAmount=8K, depreciationDefaultPercent=25 → expected base=88K, depreciation=22K, BH payable=66K, KH=22K. Pre-fix: base=80K → depreciation=20K → FAIL.
- **Post-fix state:** 3/3 PASS. Full test suite 286 tests PASS.

## Verification Checklist

- [x] Fix applied (`ServiceOrderInternalService` — 2 new helpers + base swap + finalAmount field).
- [x] Regression tests reproduce bug pre-fix (wrong base → wrong amount assertion fails).
- [x] Regression tests pass post-fix.
- [x] Existing tests still pass (tests with VAT=0 unaffected; `part()` helper updated to set finalAmount, restoring 4 previously-passing tests that used `computeDepreciationAmount`).
- [x] `./gradlew build` green (compile + Spotless + test).
- [x] `Tracking/WAVE01/BUGS.md` status updated → `RESOLVED`.
- [x] No published REST/event contract changed.

## Blast Radius

| Surface | Impact |
|---|---|
| `computeSettlementSummary` — PERCENT-mode CK Vật tư / CK Công DV | Giá trị CK tăng (post-VAT > pre-VAT) → insurancePayable giảm → **đúng per spec**. |
| `computeSettlementSummary` — AMOUNT-mode CK | Không đổi (base không ảnh hưởng AMOUNT mode). |
| `computeDepreciationAmount` | Depreciation tăng (finalAmount > amount) → `transferToCustomer` tăng → insurancePayable giảm → **đúng per spec**. |
| Tests với VAT=0 | Không bị ảnh hưởng (post-VAT == pre-VAT khi tax=0). |
| `computeSettlementSummary` customer branch | Không đổi — chỉ thêm insurance branch post-VAT. |

## Cross-Reference

- BUG-W01-253 — FE preview cùng root cause (garage-web side, assign agent-fix-garage-web).
- BUG-W01-256/257 — cùng wave: write-path persist sai (fixed concurrently).
- BR-EP-INSURANCE-SETTLEMENT.md §7.1 line 358: "Cơ sở tính = 'Cộng sau VAT'".
- CALC-INS-001: server-side authoritative; FE preview phải khớp.
