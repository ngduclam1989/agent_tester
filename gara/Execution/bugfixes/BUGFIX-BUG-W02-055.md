# BUGFIX BUG-W02-055 — API `getSettlementByCode` field `sign` invariant violation (cross-boundary contract decision)

> **Status**: ESCALATED — cross-boundary contract decision (BFF + gf-accounting).
> **Authored by**: agent-fix-garage-mobile (W02 FIX cycle 2026-06-24).
> **Related**: BUG-W02-054 (mobile consumer), BUG-W02-053 (print sign), BUG-W02-052 (depreciation null).

---

## 1. Failure Mode

API `getSettlementByCode` trả field `sign="-"` cho khoản transfer (Giảm trừ bồi thường, Khấu trừ BH) ngay cả khi `transferToCustomer=true` — vi phạm invariant `INTEG-BFF §491`:
> "transferToCustomer=true ⟺ sign='+'"

Bằng chứng debug Response 2026-06-24:
- claimReduction: `sign="-"` / `transferToCustomer=true`
- insuranceDeductible: `sign="-"` / `transferToCustomer=true`
- discountMaterial / discountLabor: `sign="-"` / `transferToCustomer=false` (CK group consistent)

## 2. Cross-Surface Divergence

- **Web panel**: tự derive sign từ settlement-type → hiển thị đúng (`+` cho phiếu KH)
- **Mobile panel**: render `allocation.sign` raw → hiển thị sai dấu (`-` thay vì `+` cho phiếu KH)
- **Print template**: filter server-side đúng (PRINT-INS-001)

## 3. Root Cause = Cross-Boundary Contract Decision

Quyết định source-of-truth của `sign` phải do **BFF + gf-accounting** thống nhất:

**Option A — BFF derive sign tại agg-garage-graph**:
- BFF resolver tính sign từ `settlement-type + transferToCustomer` rồi return cho client
- Mobile + Web đều render raw từ BFF
- Pros: contract-clean, single source-of-truth ở BFF
- Cons: cần thay đổi contract BFF (breaking nếu web đã derive client-side)

**Option B — Document "consumer phải derive"**:
- BFF return raw `amount` + `transferToCustomer` flag, KHÔNG return `sign`
- Mobile + Web đều derive theo settlement-type
- Pros: BFF passthrough cleaner
- Cons: cần update mobile + remove `sign` from response

**Option C — gf-accounting chuẩn hoá tại source**:
- gf-accounting populate `sign` đúng convention per settlement-type khi snapshot
- Pros: data correctness tại source
- Cons: cần Flyway/data backfill cho records cũ

## 4. Why Mobile Cannot Self-Fix

- Field contract change = breaking signature change
- Per directive Escalation Trigger #1 (cross-boundary fix) — agent-fix-garage-mobile KHÔNG được sửa BFF + backend
- Mobile workaround = derive client-side (xem BUG-W02-054 fix proposal) — nhưng để pin source-of-truth thì cần BFF/BE decision

## 5. Fix Path

1. **`agent-fix-agg-garage-graph` + `agent-fix-gf-accounting`** (Architecture Authority + CR MAJOR): chốt Option A / B / C
2. **`agent-fix-garage-mobile`**: implement consumer pattern theo decision (đã proposed Option B workaround trong BUG-W02-054)
3. **Probe**: cần 2 phiếu test (1 BH + 1 KH) confirm `sign`/`transferToCustomer` per settlement-type

## 6. Touched Files (Mobile-side: NONE)

- Mobile workaround đề xuất qua BUG-W02-054 (consumer derive sign locally). Root contract fix = BFF/BE.

## 7. Status

ESCALATED → cần Architecture Authority + CR MAJOR cho sign source-of-truth decision.

## 8. Notes

Cross-boundary defect chain: BUG-W02-055 (root contract) → BUG-W02-054 (mobile consumer) → BUG-W02-053 (print convention). Fix order: 055 first (or in parallel với 054 mobile workaround).
