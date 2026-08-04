# BUGFIX-BUG-W01-257: gf-sales lưu `customer_amount` và `insurance_amount` chưa apply phân bổ BH

## Bug

| Thuộc tính | Chi tiết |
|---|---|
| **ID** | BUG-W01-257 |
| **Service** | gf-sales |
| **Priority** | P1 |
| **Source TC** | Manual QC 2026-06-12 |
| **Feature / AC** | FEAT-INS-SO-ADJUSTMENT, FEAT-INS-STL-DETAIL / CALC-INS-001, BR-EP §7.1 |
| **Mô tả** | Sau khi update SO có BH, `service_order.customer_amount` và `insurance_amount` lưu giá trị raw breakdown (trước điều chỉnh BH) thay vì `customerPayable`/`insurancePayable` post-adjustment. `for-settlement` snapshot lệch theo → gf-accounting nhận sai → STL Detail render sai (xem BUG-W01-259). |

## Reproduction Steps

Pre-fix: tạo SO có BH với 5 khoản điều chỉnh. Lưu SO.

- Expected `insurance_amount = 197,680,000` (insurancePayable post-adjustment per BR-EP §7.2 worked example)
- Expected `customer_amount = 35,720,000` (customerPayable post-adjustment)
- `SELECT customer_amount, insurance_amount FROM dev_gf_sales.service_order WHERE id=...` → pre-adjustment raw values (higher than expected because adjustments not applied)

## Root Cause

Why-chain:

1. **Why `insurance_amount` và `customer_amount` sai?** Cùng root cause với BUG-W01-256: `ServiceOrderV3Service.update()` không gọi `finalizeAmounts()` trước save trong insurance path.
2. **Why `finalizeAmounts` là key?** Method này set cả 4 columns cùng lúc: `finalAmount` (total), `customerAmount`, `insuranceAmount`, `debtAmount`. Thiếu call này → cả 4 columns giữ raw breakdown.
3. **Why `for-settlement` snapshot sai?** Endpoint `GET .../for-settlement` đọc trực tiếp từ `service_order.insurance_amount` / `customer_amount`. Khi DB sai → snapshot sai → downstream gf-accounting nhận sai.
4. **Why không có separate fix?** BUG-W01-256 và BUG-W01-257 cùng root cause và cùng fix: thêm `finalizeAmounts()` call trước save trong `update()`. Một patch fix cả hai.
5. **Why spec yêu cầu per-payer amounts?** BR-EP §7.1 line 362-366: BH payable và KH payable sau điều chỉnh là input cho settlement voucher; gf-accounting dùng để split payment record.

Net root cause: identical to BUG-W01-256 — xem BUGFIX-BUG-W01-256.md §Root Cause.

## Fix

- **Files changed:**
  - `services/gf-sales/src/main/java/com/actechx/gf/app/service/ServiceOrderV3Service.java`
    - Cùng patch với BUG-W01-256: branch `if (hasInsurance)` gọi `computeSettlementSummary` → `finalizeAmounts(totalPayable, customerPayable, insurancePayable, null)` trước save.
    - `finalizeAmounts` set `customerAmount = customerPayable` và `insuranceAmount = insurancePayable` (post-adjustment) — cả 4 columns đều đúng.

- **Approach rationale:** single patch cho 2 bugs vì cùng fix point. `finalizeAmounts` cập nhật tất cả 4 relevant columns atomically — đảm bảo consistency (không thể cập nhật total mà không cập nhật per-payer).

## Regression Test

- **File:** `services/gf-sales/src/test/java/com/actechx/gf/app/service/ServiceOrderV3ServiceInsuranceTest.java` (new file, shared với BUG-W01-256)
- **Test names:**
  - `bug256_257_finalizeAmounts_updatesAllFourColumns` — verifies `insurance_amount` và `customer_amount` set correctly to adjusted values.
  - `bug256_257_adjustedInsuranceAmountDiffersFromRawSum` — verifies adjusted insurance_amount ≠ raw Σ(parts BH pre-CK).

## Verification Checklist

- [x] Fix applied (same patch as BUG-W01-256 — `ServiceOrderV3Service.update()` insurance branch).
- [x] Regression tests reproduce bug pre-fix.
- [x] Regression tests pass post-fix.
- [x] Existing tests still pass (full suite 286 green).
- [x] `./gradlew build` green.
- [x] `Tracking/WAVE01/BUGS.md` status updated → `RESOLVED`.
- [x] `for-settlement` snapshot now reads correct per-payer amounts from DB.

## Blast Radius

| Surface | Impact |
|---|---|
| `service_order.insurance_amount` | Now = `insurancePayable` post-adjustment for insurance SOs. |
| `service_order.customer_amount` | Now = `customerPayable` post-adjustment for insurance SOs. |
| `for-settlement` snapshot | Reads corrected per-payer amounts → gf-accounting receives correct data. |
| STL Detail (FE) | Downstream of `for-settlement` — now shows correct amounts (BUG-W01-259 may partially resolve). |
| Non-insurance SO update path | Unchanged. |

## Cross-Reference

- BUG-W01-256 — companion bug (same root, same fix: `total_amount`/`debt_amount`).
- BUG-W01-259 — FE STL Detail shows 0 for customerPayment/totalPayment — hệ quả của BUG-W01-257 nếu `insurance_amount=0` hoặc binding sai.
- gf-sales-api.md §3 line 3919-3932 + §3bis.2 line 4099-4104.
- BR-EP §7.1 line 362-366.
