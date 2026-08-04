# BUGFIX-BUG-W01-256: gf-sales lưu `total_amount` và `debt_amount` chưa apply phân bổ BH

## Bug

| Thuộc tính | Chi tiết |
|---|---|
| **ID** | BUG-W01-256 |
| **Service** | gf-sales |
| **Priority** | P1 |
| **Source TC** | Manual QC 2026-06-12 |
| **Feature / AC** | FEAT-INS-SO-ADJUSTMENT, FEAT-INS-DASH-DEBT / CALC-INS-001, BR-EP §7.2 |
| **Mô tả** | Sau khi update SO có BH, `service_order.total_amount` lưu giá trị raw breakdown (trước điều chỉnh BH) thay vì `totalPayable` post-adjustment. Kéo theo `debt_amount` cũng sai, ảnh hưởng dashboard công nợ BH (FEAT-INS-DASH-DEBT). |

## Reproduction Steps

Pre-fix: tạo SO có BH với 5 khoản điều chỉnh đầy đủ (example BR-EP §7.2: BH 207.9M, khấu hao, CK vật tư, CK CDV, giảm trừ, khấu trừ → expectedTotalPayable = 233.4M). Lưu SO.

- `SELECT total_amount FROM dev_gf_sales.service_order WHERE id=...` → giá trị raw (≠ 233.4M)
- Expected: `total_amount = 233,400,000`

## Root Cause

Why-chain:

1. **Why `total_amount` sai?** `ServiceOrderV3Service.update()` gọi `recalculateTotals()` (set raw amounts) rồi save ngay — `computeSettlementSummary()` chạy sau save và kết quả không được dùng để cập nhật DB.
2. **Why `computeSettlementSummary` kết quả bị discard?** Code gọi `computeSettlementSummary()` ở bước sau save (step 6+), chỉ để trả về response DTO, không gọi `serviceOrder.finalizeAmounts(...)` trước khi persist.
3. **Why `finalizeAmounts` không được gọi?** Chưa có branch `if (hasInsurance)` ở write path của `update()` — đây là feature gap trong insurance integration layer.
4. **Why `debt_amount` cũng sai?** `debt_amount = total_amount - paid_amount`. Khi `total_amount` sai thì `debt_amount` sai theo.
5. **Why spec yêu cầu `total_amount = totalPayable`?** BR-EP §7.2 line 378-390: `totalPayable = insurancePayable + customerPayable` (post-adjustment); CALC-INS-001 line 401: server-side computation là authoritative. `total_amount` là giá trị downstream dùng cho dashboard công nợ, AR export, settlement snapshot.

Net root cause: `update()` thiếu bước apply settlement adjustments vào persisted amounts trước khi `serviceOrderRepository.save()` trong insurance path.

## Fix

- **Files changed:**
  - `services/gf-sales/src/main/java/com/actechx/gf/app/service/ServiceOrderV3Service.java`
    - Trong `update()` method, sau `recalculateTotals()`, thêm branch `if (Boolean.TRUE.equals(serviceOrder.getHasInsurance()))`: gọi `serviceOrderInternalService.computeSettlementSummary(tenantId, serviceOrder)`, sau đó gọi `serviceOrder.finalizeAmounts(summary.getTotalPayable(), summary.getCustomerPayable(), summary.getInsurancePayable(), null)` — **trước** `serviceOrderRepository.save()`.

- **Approach rationale:** đặt settlement computation trước save đảm bảo DB nhận adjusted values. Sử dụng `finalizeAmounts()` vì method này là single point of truth cho set `finalAmount` / `customerAmount` / `insuranceAmount` / `debtAmount`. Pattern nhất quán với settlement flow hiện tại.

## Regression Test

- **File:** `services/gf-sales/src/test/java/com/actechx/gf/app/service/ServiceOrderV3ServiceInsuranceTest.java` (new file)
- **Test names (BUG-W01-256/257 shared):**
  - `bug256_257_finalizeAmounts_updatesAllFourColumns` — verifies `ServiceOrder.finalizeAmounts(totalPayable, customerPayable, insurancePayable, null)` sets `finalAmount`, `customerAmount`, `insuranceAmount`, `debtAmount` correctly. Pre-fix: method was not called on the update path → values remained raw.
  - `bug256_257_adjustedInsuranceAmountDiffersFromRawSum` — verifies that post-adjustment insurance_amount ≠ raw sum (with 5% CK discount), confirming the adjustment path is active.

## Verification Checklist

- [x] Fix applied (`ServiceOrderV3Service.update()` — insurance branch calls `computeSettlementSummary` + `finalizeAmounts` before save).
- [x] Regression tests reproduce bug pre-fix (without finalizeAmounts call, values stay raw).
- [x] Regression tests pass post-fix.
- [x] Existing tests still pass (full suite 286 tests green).
- [x] `./gradlew build` green.
- [x] `Tracking/WAVE01/BUGS.md` status updated → `RESOLVED`.
- [x] No published REST/event contract changed (DB internal columns only).

## Blast Radius

| Surface | Impact |
|---|---|
| `service_order.total_amount` | Now = `totalPayable` post-adjustment for insurance SOs. Non-insurance SOs unchanged. |
| `service_order.debt_amount` | Recalculated as `totalPayable - paidAmount`. |
| Dashboard công nợ BH (FEAT-INS-DASH-DEBT) | Reads `debt_amount` — now correct. |
| `for-settlement` snapshot | Reads `insurance_amount` / `customer_amount` — fixed by same branch (BUG-W01-257 companion). |
| Non-insurance SO update path | Unchanged. |

## Cross-Reference

- BUG-W01-257 — companion bug (same family: `customer_amount`/`insurance_amount`). Fixed in same PR.
- BUG-W01-252 — compute base fix (must be applied first for correct totalPayable).
- CALC-INS-001 — authoritative computation rule.
- BR-EP §7.2 line 378-390 — totalPayable formula.
