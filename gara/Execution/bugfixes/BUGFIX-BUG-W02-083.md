# BUGFIX-BUG-W02-083 — Màn Chi tiết phiếu dịch vụ thiếu tab "KH / BH thanh toán"

> L3 sửa lỗi cho `BUG-W02-083` (P2). Boundary: `garage-mobile`. Feature: `FEAT-INS-SO-ADJUSTMENT`.
> Trạng thái: ĐÃ CHẨN ĐOÁN trên **source HEAD hiện hành** (re-verify — subagent đọc bản stale nên kết luận "không tái hiện" SAI). Diff apply-ready, build/lint/test DEFERRED.
> ⚠️ KHÔNG cập nhật `Tracking/WAVE02/BUGS.md` (orchestrator giữ — theo yêu cầu phiên này).

## 1. Root cause (current HEAD — REAL, tái hiện được)

Panel `InsuranceTotalPanel` chỉ render TabBar KH/BH khi caller truyền `onSelectPayer != null`
(`insurance_total_panel.dart:87` → `if (onSelectPayer != null) PayerSegmented(...)`).

Màn Chi tiết phiếu dịch vụ — `service_order_detail_v3_page.dart:475-482` — KHÔNG truyền `onSelectPayer`
(và truyền `hideSign: true`):

```dart
return InsuranceTotalPanel(
  hideSign: true,
  breakdown: breakdown,
  adjustments: adjustments,
  balance: balance,
  onEdit: state.canEdit ? () => _onEdit(initialStep: SOCreationStepV3.items) : null,
  hasHPadding: false,
  // ❌ KHÔNG có onSelectPayer / viewCustomerSide
);
```

→ `onSelectPayer == null` → segmented bị ẩn → trên màn Chi tiết chỉ thấy 1 bên KH
(`viewCustomerSide` mặc định `true`), mất đường vào "BH thanh toán" = đúng BA báo.

Đối chiếu: SO Edit (`insurance_allocation_section.dart:45`) + Settlement Create + Confirmation
ĐỀU wire `onSelectPayer` → có tab. Chỉ màn Detail bị sót.

## 2. Fix (current HEAD — page-level, KHÔNG đụng panel)

File: `mobile/gf-garage-app/lib/ui/service_order_v3/service_order_detail_v3/service_order_detail_v3_page.dart`

Màn Detail cần state cục bộ cho bên đang xem → đổi `Builder` (dòng 465) thành `StatefulBuilder`
+ field `_detailViewCustomerSide`, wire `onSelectPayer` + `viewCustomerSide`:

```diff
@@ trong State class của _ServiceOrderDetailV3Page (khai báo field)
+  bool _detailViewCustomerSide = true; // BUG-W02-083: bên đang xem panel "Tổng giá dịch vụ"
@@ dòng 461-483 (section panel khi hasInsurance)
-                  Builder(
-                    builder: (context) {
+                  StatefulBuilder(
+                    builder: (context, setPanelState) {
                       final detail = state.detail!;
                       final breakdown = detail.toBreakdown();
                       final adjustments = detail.toResolvedAdjustments();
                       final balance = SettlementBalance(
                         insurancePayment: detail.insurancePayment ?? 0,
                         customerPayment: detail.customerPayment ?? 0,
                         totalPayment: detail.totalPayment ?? 0,
                       );
                       return InsuranceTotalPanel(
                         hideSign: true,
                         breakdown: breakdown,
                         adjustments: adjustments,
                         balance: balance,
+                        viewCustomerSide: _detailViewCustomerSide,
+                        onSelectPayer: (customer) =>
+                            setPanelState(() => _detailViewCustomerSide = customer),
                         onEdit: state.canEdit ? () => _onEdit(initialStep: SOCreationStepV3.items) : null,
                         hasHPadding: false,
                       );
                     },
                   ),
```

Khi có `onSelectPayer` → panel hiện TabBar; đổi tab → `_buildKhoanMuc` ("Chi tiết theo bên thanh
toán") + "Cân thanh toán" tự switch theo `viewCustomerSide` (logic panel có sẵn). Mặc định KH.

> ✅ **BA QUYẾT (2026-06-25): HIỆN LẠI TAB** — áp fix §2 (thêm `onSelectPayer` + `viewCustomerSide`).
> `hideSign`: giữ `true` (minimal — chỉ thêm tab) trừ khi câu hỏi dấu 086 chốt SO Detail phải hiện
> dấu `− − + + +` → khi đó mới bỏ `hideSign`. Cập nhật sau khi 086 chốt.

## 3. Blast radius

- Chỉ màn Chi tiết phiếu dịch vụ (1 page). Panel `InsuranceTotalPanel` KHÔNG đổi. Contract impact: NONE.
- KHÔNG hồi quy SO không BH: section panel chỉ mount khi `state.detail?.hasInsurance == true` (dòng 461).

## 4. Regression test

- Widget test màn Detail (SO có BH): assert `PayerSegmented` (tab "KH thanh toán"/"BH thanh toán") hiện; mặc định KH; tap "BH thanh toán" → "Chi tiết theo bên thanh toán" đổi sang số liệu BH.
- SO không BH: assert KHÔNG mount `InsuranceTotalPanel`.

## 5. Áp dụng (interactive mobile session)

Tại root `mobile/gf-garage-app/`: áp diff §2 + test §4 → `fvm flutter analyze` + `fvm flutter test` (FAIL trước → PASS sau). Cập nhật BUGS.md do orchestrator/QA.

## Change Log

| Ngày | Phiên bản | Tác giả | Mô tả |
|---|---|---|---|
| 2026-06-25 | 1 | orchestrator (re-verify HEAD) | Re-verify trên source hiện hành: màn Detail không wire `onSelectPayer` → ẩn tab → REAL bug. Fix page-level (StatefulBuilder + onSelectPayer). (Đảo kết luận "non-repro" của subagent — bản subagent đọc đã stale.) |
