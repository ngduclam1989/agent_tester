# BUGFIX-BUG-W02-086 — "CK liên kết BH" sai dấu trên panel "Phân bổ Bảo hiểm" (phiếu DỊCH VỤ)

> L3 sửa lỗi cho `BUG-W02-086` (P2). Boundary: `garage-mobile`. Feature: `FEAT-INS-SO-ADJUSTMENT`.
> Trạng thái: ĐÃ CHẨN ĐOÁN lại trên **HEAD** + chốt hướng theo BA (2026-06-25). Build/lint/test DEFERRED cho phiên `mobile/gf-garage-app/` tương tác.
> ⚠️ KHÔNG cập nhật `Tracking/WAVE02/BUGS.md` (orchestrator giữ — theo yêu cầu phiên này).

## 0. Quyết định BA (2026-06-25) — phân biệt context (panel dùng chung)

`InsuranceTotalPanel` dùng CHUNG cho **phiếu dịch vụ (SO)** và **phiếu quyết toán (settlement)**.
Quy ước dấu KHÁC nhau theo loại chứng từ:

| Context | Caller | Dấu "Phân bổ Bảo hiểm" |
|---|---|---|
| **Phiếu dịch vụ (SO)** | `InsuranceTotalPanel` trực tiếp (SO Edit / Confirmation) | **`− − + + +` cố định** (086) |
| **Phiếu quyết toán** | qua `InsuranceSettlementDetailView` | **theo bên** (KH=`+`, BH=`−`) — GIỮ NGUYÊN commit `5eb6e4ee` |

⇒ Fix phải **context-aware** — KHÔNG đổi `_allocationRow` global. **086 KHÔNG cover 089** (089 = phiếu QT, xử lý riêng theo hướng side-dependent).

## 1. Root cause (HEAD)

`insurance_total_panel.dart:146-159` `_allocationRow` derive dấu theo `viewCustomerSide` (KH=+, BH=−)
cho MỌI caller → phiếu dịch vụ (SO) cũng bị lật theo tab thay vì cố định `− − + + +` (BR §7.1, dòng 354-357:
2 khoản "CK liên kết BH" = −; 3 khoản chuyển-KH = +; giữ nguyên khi đổi tab).

## 2. Fix (HEAD — thêm cờ context `fixedAllocationSign`)

File 1: `mobile/gf-garage-app/lib/ui/service_order/insurance/widgets/insurance_total_panel.dart`

```diff
@@ constructor (thêm param, default false = giữ hành vi side-dependent cho settlement)
     this.showInsuranceDiscountRows = true,
     this.hideSign = false,
+    this.fixedAllocationSign = false,
   });
@@ fields
   final bool hideSign;
+  /// true (phiếu dịch vụ / SO): dấu cố định − − + + + theo bản chất khoản
+  /// (CK liên kết BH = −, 3 khoản chuyển-KH = +), giữ nguyên khi đổi tab.
+  /// false (phiếu quyết toán): dấu theo bên đang xem (KH=+, BH=−).
+  final bool fixedAllocationSign;
@@ _buildAllocationSummary (gắn cờ reducesInsurance cho từng dòng)
-    final rows = <(String, double)>[
-      if (showInsuranceDiscountRows) ('CK liên kết BH — Vật tư', _adjustments.discountMaterial),
-      if (showInsuranceDiscountRows) ('CK liên kết BH — Công dịch vụ', _adjustments.discountLabor),
-      ('Giảm trừ bồi thường', _adjustments.claimReduction),
-      ('Khấu hao vật tư / thay mới', _adjustments.depreciation),
-      ('Khấu trừ BH', _adjustments.insuranceDeductible),
-    ];
+    final rows = <({String label, double amount, bool reducesInsurance})>[
+      if (showInsuranceDiscountRows)
+        (label: 'CK liên kết BH — Vật tư', amount: _adjustments.discountMaterial, reducesInsurance: true),
+      if (showInsuranceDiscountRows)
+        (label: 'CK liên kết BH — Công dịch vụ', amount: _adjustments.discountLabor, reducesInsurance: true),
+      (label: 'Giảm trừ bồi thường', amount: _adjustments.claimReduction, reducesInsurance: false),
+      (label: 'Khấu hao vật tư / thay mới', amount: _adjustments.depreciation, reducesInsurance: false),
+      (label: 'Khấu trừ BH', amount: _adjustments.insuranceDeductible, reducesInsurance: false),
+    ];
@@ vòng lặp render
-        for (final (_, row) in rows.indexed) ...[_allocationRow(row.$1, row.$2)],
+        for (final row in rows) ...[_allocationRow(row.label, row.amount, row.reducesInsurance)],
@@ _allocationRow — thêm nhánh fixedAllocationSign TRƯỚC nhánh viewCustomerSide
-  Widget _allocationRow(String label, double amount) {
+  Widget _allocationRow(String label, double amount, bool reducesInsurance) {
     final String formatted;

     if (hideSign) {
       formatted = formatVNCurrency(amount, hasSymbol: true);
+    } else if (fixedAllocationSign) {
+      final sign = reducesInsurance ? '-' : '+';            // − − + + + cố định
+      formatted = amount > 0
+          ? '$sign${formatVNCurrency(amount, hasSymbol: true)}'
+          : formatVNCurrency(amount, hasSymbol: true);
     } else if (viewCustomerSide) {
       formatted = amount > 0
           ? '+${formatVNCurrency(amount, hasSymbol: true)}'
           : formatVNCurrency(amount, hasSymbol: true);
     } else {
       formatted = amount > 0
           ? '-${formatVNCurrency(amount, hasSymbol: true)}'
           : formatVNCurrency(amount, hasSymbol: true);
     }
```

File 2 — caller phiếu dịch vụ (SO) bật cờ:
- `lib/ui/service_order/insurance/widgets/insurance_allocation_section.dart:40` (SO Edit) → thêm `fixedAllocationSign: true,`
- `lib/ui/service_order_v3/service_order_creation_v3/pages/confirmation_page_v3.dart:1209` (SO Confirmation) → thêm `fixedAllocationSign: true,`

```diff
@@ insurance_allocation_section.dart:40 (InsuranceTotalPanel SO Edit)
           onSelectPayer: (customer) => cubit.selectPayerSide(customer: customer),
           onEdit: onEditFromDetail,
           showNegativeInsuranceWarning: state.hasNegativeInsuranceWarning,
+          fixedAllocationSign: true,
         );
```
(tương tự cho `confirmation_page_v3.dart:1209`.)

> `InsuranceSettlementDetailView` (phiếu QT) **KHÔNG** truyền `fixedAllocationSign` → default false →
> giữ side-dependent (KH=+, BH=−) như commit `5eb6e4ee`. Không hồi quy settlement.
> SO Detail (`service_order_detail_v3_page.dart:475`) đang `hideSign: true` → vẫn không dấu (083 chỉ thêm
> tab). ⚠️ Lưu ý nhất quán: SO Edit hiện `− − + + +`, SO Detail không dấu — nếu BA muốn SO Detail cũng
> hiện `− − + + +` thì bỏ `hideSign` + thêm `fixedAllocationSign: true` ở caller đó (gộp với 083).

## 3. Regression test
File mới `test/ui/service_order/insurance/insurance_total_panel_allocation_sign_test.dart`:
- `fixedAllocationSign: true` + `viewCustomerSide` true **và** false: 2 khoản CK = `−`, 3 khoản chuyển-KH = `+` (panel `− − + + +`, giữ nguyên khi đổi tab).
- `fixedAllocationSign: false` (settlement): `viewCustomerSide=true` → toàn `+`; `false` → toàn `−` (side-dependent, không hồi quy).
- `hideSign: true`: không dấu.

## 4. Áp dụng (interactive mobile session)
Tại root `mobile/gf-garage-app/`: áp diff §2 + test §3 → `fvm flutter analyze` + `fvm flutter test` (FAIL trước → PASS sau). Cập nhật BUGS.md do orchestrator/QA.

## 5. Liên quan
- **089** (phiếu QT sign): KHÔNG cover bởi fix này (BA chốt settlement = side-dependent). Xử lý riêng theo hướng side-dependent (màn Tạo QT đang `hideSign` → nếu 089 cần hiện dấu theo bên thì bỏ `hideSign` ở `settlement_create_page.dart:92`).

## Change Log
| Ngày | Phiên bản | Tác giả | Mô tả |
|---|---|---|---|
| 2026-06-25 | 1 | spawn group A | Diff dựa trên source STALE (blanket `−`) — SAI so HEAD. |
| 2026-06-25 | 2 | orchestrator (re-verify HEAD) | Re-derive HEAD: dấu theo viewCustomerSide; fix → cố định `− − + + +`; (lúc đó tưởng cover 089). |
| 2026-06-25 | 3 | orchestrator + BA decision | Context-aware: SO = `− − + + +` (cờ `fixedAllocationSign`), phiếu QT giữ side-dependent. 086 KHÔNG cover 089. |
