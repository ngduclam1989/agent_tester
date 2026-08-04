# BUGFIX BUG-W02-082 — Panel "Tổng giá dịch vụ" màn Tạo phiếu QT tràn full-width

> Wave: W02 · Severity: P2 · Status: OPEN → RESOLVED
> Boundary: garage-web
> Source TC: Manual QC BA (2026-06-24, PDV-20260624-01121, đối chiếu Figma 13255-162759)
> Reporter: BA via agent-test-orchestrator

## 1. Failure mode

Trên màn "Tạo phiếu quyết toán" (có bảo hiểm, route `/settlement-voucher/create?serviceOrderCode=…`), panel "Tổng giá dịch vụ" (component `InsuranceTotalPanel` wrap `TotalServicePricePanel`) render **tràn full-width** thay vì card thu gọn ~1216px theo Figma node 13255-162759. Hai cột "Bảo hiểm thanh toán" + "Khách hàng thanh toán" bị đẩy sát mép phải, khoảng giữa trống huơ.

## 2. Root cause

`InsuranceTotalPanel` (`src/features/settlement-voucher/components/create/insurance-total-panel.tsx`) wrap `TotalServicePricePanel` chỉ bằng `<div className="py-4">` — **thiếu ràng buộc width**. `TotalServicePricePanel` mặc định `w-full` → bảng giãn theo toàn bộ viewport / parent layout container.

Theo oracle `wave02-ins-stl-create--panel-oracle.md` dòng 61 (Section/TotalServicePanel = 1216×764) + dòng 145 (PageContainer 1280px, margin 80px) → panel phải là card thu gọn align-right với max-width constraint.

## 3. Fix

### `src/features/settlement-voucher/components/create/insurance-total-panel.tsx`

Wrap `TotalServicePricePanel` trong container `flex w-full justify-end py-4` (align-right) và pass `className="w-full max-w-[600px]"` xuống panel → bảng co lại ~600px max-width, lệch phải khớp Figma layout (card thu gọn cuối trang).

Note: `TotalServicePricePanel` props đã support `className` (pass-through xuống outer wrapper). Width 600px chọn match parity với `CostTab` detail (cùng panel reused — đã được set `max-w-[600px]` ở `src/features/insurance-settlement/components/detail/cost-tab.tsx`). Oracle ghi 1216 nhưng panel detail/edit/create đều cố ý dùng 600 (Figma cũ vs new — DEV W01 chốt 600 theo CR-20260612-01).

## 4. Regression test

### `src/features/settlement-voucher/components/create/insurance-total-panel.bug-w02-082.test.tsx` (NEW)

2 assertions:

- Wrapper `[data-testid="stl-create-insurance-total-panel"]` className contain `flex`, `w-full`, `justify-end`.
- Panel `[data-testid="panel-total-price"]` className contain `max-w-[600px]`.
- Bonus: panel không render khi service order missing insurance fields (guard `hasInsurance`).

## 5. Files changed

- `frontend/gf-gms-web/src/features/settlement-voucher/components/create/insurance-total-panel.tsx` (wrap flex justify-end + pass max-w-[600px])
- `frontend/gf-gms-web/src/features/settlement-voucher/components/create/insurance-total-panel.bug-w02-082.test.tsx` (NEW, 2 assertions)

## 6. Status update

BUG-W02-082: OPEN → RESOLVED (verify pending L2 — Playwright UI screenshot diff vs Figma node 13255-162759).

## 7. Follow-ups

- Verify panel-shared surfaces (Chi tiết phiếu QT, Sửa phiếu QT, SO detail/edit) đã có max-width constraint chưa — preliminary check: `CostTab` (detail) đã pass `className="w-full max-w-[600px]"` (BUG-074 fix scope, same DOM). Confirm phần edit + SO surfaces — nếu cũng tràn thì pattern tương tự áp dụng.
- Width 600px vs oracle 1216px discrepancy: BA approve qua CR-20260612-01 (panel rút gọn 1 cột); nếu BA muốn revert về 1216 (2-col create) thì raise CR riêng.
