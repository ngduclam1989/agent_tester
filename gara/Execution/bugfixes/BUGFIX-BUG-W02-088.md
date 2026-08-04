# BUGFIX-BUG-W02-088 — Màn Tạo phiếu QT: "Tổng thanh toán" thiếu cộng phần BH

> L3 sửa lỗi cho `BUG-W02-088` (P2). Boundary: `garage-mobile`. Feature: `FEAT-INS-STL-CREATE`.
> Trạng thái: ĐÃ FIX (qua shared panel — xem `BUGFIX-BUG-W02-085.md`). **Đã commit** `bf5c30d6` + bản cập nhật type-aware sau đó.
> ⚠️ KHÔNG cập nhật `Tracking/WAVE02/BUGS.md` (orchestrator giữ).

## 1. Hiện tượng

Màn "Tạo phiếu quyết toán" (SO có BH): card "Tổng thanh toán" = đúng "Khách hàng thanh toán" (16.948.165) — CHƯA cộng phần BH thanh toán. Đúng ra (BR §7.1): Tổng = BH thanh toán + KH thanh toán.

## 2. Root cause

CÙNG defect với `BUG-W02-085` (màn Chỉnh sửa phiếu dịch vụ): `InsuranceTotalPanel._buildTotalCard` render `viewCustomerSide ? customerPayment : insurancePayment` (1 bên) thay vì tổng. Màn Tạo phiếu QT dùng CHUNG panel này qua `InsuranceSettlementDetailView` (`settlement_create_page.dart:92`).

## 3. Fix — qua shared panel (phủ bởi 085 + cập nhật type-aware)

KHÔNG có fix riêng cho 088 — fix nằm ở shared `InsuranceTotalPanel`:
- Fix gốc `BUGFIX-BUG-W02-085.md` §2: `_buildTotalCard` → `_balance.totalPayment`.
- Cập nhật type-aware `BUGFIX-BUG-W02-085.md` §6 (BA chốt 2026-06-25): card "Tổng thanh toán" theo loại chứng từ. Màn **Tạo** = combined create (`lockToCustomerSide == null`) → `totalPayment` = BH + KH = đúng yêu cầu 088.

→ Màn Tạo phiếu QT: "Tổng thanh toán" = `totalPayment` (tổng BH + KH). ✓

## 4. Regression test

- `test/ui/settlement/insurance_total_panel_total_payment_test.dart` (085) — card = totalPayment.
- `test/ui/settlement/insurance_total_payment_by_doc_type_test.dart` — case `lock=null` (Tạo combined) → `totalPayment` (233.400.000).

## Change Log

| Ngày | Phiên bản | Tác giả | Mô tả |
|---|---|---|---|
| 2026-06-25 | 1 | agent-fix-garage-mobile | L3 cho 088 — defect dùng chung panel với 085; fix qua `_buildTotalCard` + type-aware (Tạo combined → totalPayment). Cross-ref `BUGFIX-BUG-W02-085.md` §2/§6. |
