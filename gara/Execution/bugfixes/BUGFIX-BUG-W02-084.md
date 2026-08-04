# BUGFIX-BUG-W02-084 — Phiếu báo giá thiếu dòng Phụ tùng (chỉ liệt kê Dịch vụ)

> L3 sửa lỗi cho `BUG-W02-084` (P1). Boundary: `garage-mobile`. Feature: `FEAT-INS-DOSSIER-CREATE` (AC-5).
> Trạng thái: ĐÃ CHẨN ĐOÁN — diff apply-ready (sandbox read-only, build/lint/test DEFERRED cho phiên `mobile/gf-garage-app/` tương tác).

## 1. Root cause

`lib/ui/insurance_dossier/pages/dossier_quotation_sheet_page.dart` chỉ đọc `so?.items`
(danh sách Dịch vụ) và bỏ qua hoàn toàn `so?.parts` (danh sách Phụ tùng):

- Dòng 40: `final items = so?.items ?? const [];` — KHÔNG có `parts`.
- Dòng 82-93: `DossierAmountTable.rows` chỉ lặp `for (final item in items)`.
- Dòng 92: `total: _sumItems(items)` — tổng chỉ cộng phần Dịch vụ.

Model `ServiceOrderDetailV3` có **2 list tách biệt**: `items` (Dịch vụ) + `parts` (Phụ tùng).
`ServiceOrderPartV3` đã có sẵn `partName` / `quantity` / `amount` / `finalAmount`.

Bằng chứng oversight: màn anh em `dossier_settlement_sheet_page.dart:49-50` đọc CẢ
`items` + `parts` (có cả helper `_sumParts`). Đây là regression còn sót khi fix
BUG-W02-025/026 (chỉ bind `items` cho page báo giá).

Theo AC-5 + PNG oracle `wave02-ins-dossier-create/452-23711.png`: bảng "Chi phí sửa chữa"
là MỘT bảng gộp gồm CẢ Dịch vụ + Phụ tùng, Tổng cộng = Σ(Dịch vụ) + Σ(Phụ tùng).

## 2. Fix (minimum scope, 1 file source)

File: `mobile/gf-garage-app/lib/ui/insurance_dossier/pages/dossier_quotation_sheet_page.dart`

- Đọc thêm `final parts = so?.parts ?? const [];`.
- Nối thêm rows từ `parts` (name←`partName`, qty←`quantity`, amount←`finalAmount ?? amount`)
  vào CÙNG `DossierAmountTable` (sau rows Dịch vụ).
- Tổng: `total: _sumItems(items) + _sumParts(parts)`.
- Thêm helper `_sumParts(List<ServiceOrderPartV3>)` (mượn pattern từ page Phiếu quyết toán).

Không đổi widget `DossierAmountTable`, không đổi model, không cross-boundary.

### Unified diff — source

```diff
--- a/lib/ui/insurance_dossier/pages/dossier_quotation_sheet_page.dart
+++ b/lib/ui/insurance_dossier/pages/dossier_quotation_sheet_page.dart
@@ -37,7 +37,8 @@
     final garage = getIt<ProfileCubit>().state.businessInfo?.name ?? '--';
     final insuranceCompany = so?.insuranceCompanyName ?? '--';
     final contractNumber = so?.insurancePolicyNumber ?? '--';
     final items = so?.items ?? const [];
+    final parts = so?.parts ?? const [];
 
     return Scaffold(
@@ -82,15 +83,21 @@
             DossierAmountTable(
               rows: [
                 for (final item in items)
                   DossierAmountRow(
                     name: item.serviceName ?? '',
                     quantity: item.quantity ?? 0,
                     amount: item.finalAmount ?? item.amount ?? 0,
                   ),
+                for (final part in parts)
+                  DossierAmountRow(
+                    name: part.partName ?? '',
+                    quantity: part.quantity ?? 0,
+                    amount: part.finalAmount ?? part.amount ?? 0,
+                  ),
               ],
               totalLabel: LocaleKeys.insuranceDossier_tableSubtotal.tr(),
-              total: _sumItems(items),
+              total: _sumItems(items) + _sumParts(parts),
             ),
           ],
         ),
       ),
     );
   }
 
   static double _sumItems(List<ServiceOrderItemV3> items) {
     var sum = 0.0;
     for (final i in items) {
       sum += i.finalAmount ?? i.amount ?? 0;
     }
     return sum;
   }
+
+  static double _sumParts(List<ServiceOrderPartV3> parts) {
+    var sum = 0.0;
+    for (final p in parts) {
+      sum += p.finalAmount ?? p.amount ?? 0;
+    }
+    return sum;
+  }
 }
```

> `ServiceOrderPartV3` đã có sẵn qua import `service_order_detail_v3.dart` (dòng 4) — không cần import mới.

## 3. Regression test

File: `mobile/gf-garage-app/test/ui/insurance_dossier/ins_dossier_sheet_widget_test.dart`

Thêm import `currency_format.dart` + group `BUG-W02-084`. Test seed SO có CẢ Dịch vụ + Phụ tùng:
- BG-001: assert dòng Phụ tùng render + Tổng = Σ(DV)+Σ(PT) (FAIL trước fix vì parts không render & total thiếu).
- BG-002: SO không có phụ tùng → vẫn render Dịch vụ + total = Σ(DV), không regression.

### Unified diff — test

```diff
--- a/test/ui/insurance_dossier/ins_dossier_sheet_widget_test.dart
+++ b/test/ui/insurance_dossier/ins_dossier_sheet_widget_test.dart
@@ -7,6 +7,7 @@
 import 'package:cardoctor_garage_v3/core/common/bases/enum/settlement_type.dart';
 import 'package:cardoctor_garage_v3/core/models/response/profile/business_info_response.dart';
 import 'package:cardoctor_garage_v3/core/models/response/service_order/service_order_detail_v3.dart';
 import 'package:cardoctor_garage_v3/core/models/response/settlement/settlement_detail_response.dart';
 import 'package:cardoctor_garage_v3/core/repositories/profile/profile_repository.dart';
+import 'package:cardoctor_garage_v3/core/utils/currency_format.dart';
 import 'package:cardoctor_garage_v3/ui/insurance_dossier/pages/dossier_quotation_sheet_page.dart';
@@ -321,5 +322,57 @@
         expect(find.text('Thay má phanh'), findsOneWidget,
             reason: 'QS-003: item name visible in repair cost table row');
       },
     );
   });
+
+  // ── Group BG: DossierQuotationSheetPage parts coverage (BUG-W02-084) ──────
+
+  group('BUG-W02-084: DossierQuotationSheetPage — Chi phí sửa chữa gồm cả Phụ tùng', () {
+    testWidgets(
+      'BG-001: SO có Dịch vụ + Phụ tùng → cả 2 dòng render, Tổng = Σ(DV)+Σ(PT)',
+      (tester) async {
+        final so = _makeSO(
+          insuranceCompanyName: 'Bảo hiểm PTI',
+          insurancePolicyNumber: 'INS-20260624-084',
+          items: [
+            const ServiceOrderItemV3(serviceName: 'Công sơn tổng thể', quantity: 1, amount: 9000000),
+          ],
+          parts: [
+            const ServiceOrderPartV3(partName: 'Lọc dầu động cơ', quantity: 2, amount: 1000000),
+          ],
+        );
+        final settlement = _makeSettlement(serviceOrder: so);
+
+        await _pumpQuotationSheet(tester, settlement);
+
+        expect(find.text('Công sơn tổng thể'), findsOneWidget,
+            reason: 'BG-001: dòng Dịch vụ vẫn render');
+        expect(find.text('Lọc dầu động cơ'), findsOneWidget,
+            reason: 'BG-001: dòng Phụ tùng render trong Chi phí sửa chữa — fix BUG-W02-084 (trước fix bị sót)');
+        expect(find.text(formatVNCurrency(10000000)), findsOneWidget,
+            reason: 'BG-001: Tổng cộng = Σ(DV 9.000.000) + Σ(PT 1.000.000) = 10.000.000');
+        expect(find.byType(DossierAmountTable), findsOneWidget,
+            reason: 'BG-001: Dịch vụ + Phụ tùng dùng CHUNG 1 bảng Chi phí sửa chữa');
+      },
+    );
+
+    testWidgets(
+      'BG-002: SO chỉ có Dịch vụ (không Phụ tùng) → render Dịch vụ + total = Σ(DV), không regression',
+      (tester) async {
+        final so = _makeSO(
+          items: [
+            const ServiceOrderItemV3(serviceName: 'Bảo dưỡng cơ bản', quantity: 1, amount: 8208000),
+          ],
+        );
+        final settlement = _makeSettlement(serviceOrder: so);
+
+        await _pumpQuotationSheet(tester, settlement);
+
+        expect(find.text('Bảo dưỡng cơ bản'), findsOneWidget,
+            reason: 'BG-002: dòng Dịch vụ render');
+        expect(find.text(formatVNCurrency(8208000)), findsWidgets,
+            reason: 'BG-002: total = Σ(DV) khi không có phụ tùng');
+        expect(tester.takeException(), isNull,
+            reason: 'BG-002: parts rỗng render không exception');
+      },
+    );
+  });
 }
```

## 4. Blast radius

- Contract impact: NONE. Không đổi GraphQL document / model / API. BE đã trả `parts` đầy đủ — chỉ UI không đọc.
- File source đổi: 1 (`dossier_quotation_sheet_page.dart`). File test đổi: 1 (thêm group, không sửa test cũ).
- Không chạm `DossierAmountTable` widget, không chạm page Phiếu quyết toán (đã đúng).

## 5. Cascade / follow-up (observation only — KHÔNG fix ở đây)

- **PDF xuất hồ sơ (template `bao-gia`)**: `DossierPdfLauncher` chỉ resolve `pdfUrl` server trả về →
  render qua PDFRoute. Nội dung PDF do **gf-accounting** sinh (template `bao-gia`), KHÔNG do mobile render.
  → Cần verify riêng ở boundary `gf-accounting`: template `bao-gia` có liệt kê đủ Phụ tùng + Tổng = Σ(DV)+Σ(PT) không
  (FEAT-INS-DOSSIER-VIEW). Đây là cross-boundary, ngoài phạm vi garage-mobile — escalate tới agent-fix-gf-accounting nếu PDF cũng sót.

## 6. Verify (DEFERRED — sandbox read-only)

Chạy trên phiên tương tác `mobile/gf-garage-app/`:

```bash
cd mobile/gf-garage-app
fvm flutter analyze lib/ui/insurance_dossier/pages/dossier_quotation_sheet_page.dart
fvm flutter test test/ui/insurance_dossier/ins_dossier_sheet_widget_test.dart
```

Kỳ vọng: group `BUG-W02-084` FAIL trước fix (BG-001 không thấy 'Lọc dầu động cơ' + total 9.000.000 thay vì 10.000.000), PASS sau fix.
