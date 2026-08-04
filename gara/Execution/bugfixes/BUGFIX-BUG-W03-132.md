# BUGFIX-BUG-W03-132 — ESCALATE cross-boundary: BFF chưa expose `hasTransactions` cho InternalProduct

> **L1 ticket**: `Tracking/WAVE03/BUGS.md` row `BUG-W03-132`
> **L2 verify**: `Tracking/WAVE03/verify/BUG-W03-132.verify.md`
> **Feature**: FEAT-CAT-PROD-EDIT
> **Boundary**: `garage-web` → **ESCALATE** `agg-garage-graph` (BFF) + `gf-inventory` (BE)
> **Severity**: P2
> **Status**: OPEN (escalated 2026-07-03)
> **Triaged by**: agent-fix-garage-web — 2026-07-03

---

## 1. Failure mode

Form Edit sản phẩm nội bộ: field `ĐVT chính` (`mainUnitCode`) render `disabled` VÔ ĐIỀU KIỆN cho mọi mã sản phẩm (kể cả mã mới tạo, chưa có giao dịch nhập/xuất). FEAT-CAT-PROD-EDIT AC-mainUnit-lock yêu cầu chỉ khóa khi sản phẩm ĐÃ phát sinh giao dịch.

## 2. Root cause chain

`GeneralInfoSection.tsx` L72-L73:

```ts
// ĐVT chính luôn khoá khi sửa (BFF chưa expose flag transaction-check).
const lockMainUnit = isEdit;
```

Root cause thật nằm ngoài garage-web:

1. **`gf-inventory` BE**: `InternalProductDetailResponse` DTO chưa có field `hasTransactions: Boolean`. Cần logic query count row `internal_product_transaction` (hoặc bảng tương đương) where `sku IN (product.skus)` → boolean.
2. **`agg-garage-graph` BFF**: GraphQL SDL type `InternalProduct` chưa expose `hasTransactions`. Cần add field + forward từ REST response.
3. **`garage-web` FE**: FE chỉ đổi 1 dòng `const lockMainUnit = isEdit && product.hasTransactions;` sau khi contract xong.

## 3. Escalation rationale

Task instruction (from orchestrator): "If BFF has no such field, escalate this one bug only." Xác nhận qua `grep hasTransactions` trên `frontend/gf-gms-web/src/` → 0 hit; BFF SDL cũng không có field này. Fix garage-web đơn phương không giải quyết root cause — muốn unblock chờ contract cross-boundary.

Trigger #1 ESCALATE (cross-boundary fix needed) theo template §ESCALATE của spawn-fix-fe5.md.

## 4. Recommended next actions (không trong scope FIX FE session này)

- Spawn `agent-fix-gf-inventory` bug pattern-copy `Tracking/WAVE03/bugs/BUG-W03-132-BE.md`: expose `hasTransactions` trong DTO.
- Spawn `agent-fix-agg-garage-graph` sau khi BE ready: add field vào SDL + resolver forward.
- Spawn lại `agent-fix-garage-web` sau khi BFF ready: đổi hardcode `lockMainUnit = isEdit` → `isEdit && product.hasTransactions`.
- Alternative interim: FE có thể query riêng `getInternalProductTransactions(productId)` count > 0 — nhưng thêm 1 network round-trip mỗi lần mở Edit, không recommend.

## 5. Files touched (session này)

None (escalation only — không edit FE).

## 6. Retro fields

- `agent_origin`: agent-dev-garage-web (hardcode workaround) + agent-dev-agg-garage-graph (miss contract field) + agent-dev-gf-inventory (miss DTO field).
- `root_cause_category`: context (contract-first gap — feature spec yêu cầu flag nhưng KG/SDL không có).
- `recurrence_of`: null (session này); nhưng cùng pattern với FEAT-CAT-PROD-EDIT AC hardcode workaround family — nên propose entry BUG_PATTERNS.md "hardcode workaround for missing BFF contract field".
