# BUGFIX BUG-W02-059 — Preview "Phiếu QT" hồ sơ BH liệt kê cả hạng mục KH (data-source verification needed)

> **Status**: NEEDS DATA-SOURCE VERIFICATION (mobile filter already exists; root cause may be BE/BFF snapshot).
> **Authored by**: agent-fix-garage-mobile (W02 FIX cycle 2026-06-24).
> **Related**: BUG-W02-024 (DossierPhieuQuyetToanPage placeholder bind), BUG-W02-053 (BH print payer filter).

---

## 1. Failure Mode

Preview "PHIẾU QUYẾT TOÁN SỬA CHỮA" (Tạo hồ sơ BH, mobile) liệt kê CẢ hạng mục Khách hàng thanh toán (payer=KH) trong bảng "Dịch vụ thực hiện" + "Phụ tùng sử dụng" — phải CHỈ payer=BH theo:
- AC-4 (preview render từ phiếu QT BH gốc)
- BR-INS-STL-CRE-002 (snapshot line items Nguồn TT=BH)
- PRINT-INS-001 (hạng mục thuộc BH)
- BR-GF-ACCOUNTING-012 (`SettlementPrintDataBuilder` filter theo payer)

## 2. Code Analysis — Mobile Filter EXISTS

`mobile/gf-garage-app/lib/ui/insurance_dossier/pages/dossier_settlement_sheet_page.dart`:
- Line 50: `final insuranceItems = settlement?.insuranceItems ?? const [];`
- Line 51: `final insuranceParts = settlement?.insuranceParts ?? const [];`

`settlement?.insuranceItems` extension getter (`settlement_extensions.dart:82-83`):
```dart
List<ServiceOrderItemV3> get insuranceItems =>
    serviceOrder?.items?.where((e) => e.payer == PayerType.insurance).toList() ?? [];
```

Filter `payer == PayerType.insurance` đã áp đúng. Total cũng dùng `totalInsuranceAmount` từ filtered list (line 135).

**Mobile code-level đã filter đúng**. Bằng chứng screenshot 6.374.500 / 7.487.520 totals tương ứng all SO items → một trong các khả năng:

### Hypothesis A — BE/BFF data issue
`getSettlementByCode` response `serviceOrder.items[].payer` field có thể null hoặc default "CUSTOMER" cho records cũ. Filter `e.payer == PayerType.insurance` chỉ pass khi `payer` = `INSURANCE` explicit. Nếu BE snapshot không set `payer` cho items khi tạo phiếu QT BH → filter passes nothing OR all (tùy mặc định).

### Hypothesis B — CRE-002 snapshot incomplete
Per BR-INS-STL-CRE-002: phiếu QT BH "snapshot line items Nguồn TT=BH" → BE phải filter tại CRE time. Nếu BE store full SO items với `payer` mixed → mobile filter sẽ shrink đúng. Nhưng nếu BE store mà KHÔNG set `payer` đúng → mobile receive ambiguous data.

## 3. Recommended Action

1. **Probe API**: gọi `getSettlementByCode` cho phiếu QT BH thực tế → inspect `serviceOrder.items[].payer` field per row.
   - Nếu payer = `INSURANCE` cho rows hiển thị sai → mobile bug (test cần update); 
   - Nếu payer = `null` / `CUSTOMER` cho rows đáng ra phải là BH → escalate `agent-fix-gf-accounting` (snapshot wrong) hoặc `agg-garage-graph` (resolver mapping).
2. **Mobile defensive**: cập nhật `insuranceItems` getter để treat `payer == null` as ambiguous + log warning (KHÔNG include).
3. **Regression test**: pump page với mock data 2 trường hợp (mixed payer, all CUSTOMER) → assert table contains only payer=INSURANCE rows.

## 4. Proposed Mobile-Side Defensive Fix (Optional)

Tighten filter trong `settlement_extensions.dart:82` để loại bỏ null payer:
```dart
List<ServiceOrderItemV3> get insuranceItems =>
    serviceOrder?.items?.where((e) => e.payer == PayerType.insurance).toList() ?? [];
// (đã correct — null vs INSURANCE comparison loại bỏ null tự nhiên do `==`)
```

→ Mobile filter đã defensive đúng. Không cần thay đổi mobile-side; bug có khả năng cao là data-source side.

## 5. Touched Files (proposed mobile-side: NONE)

- Không có mobile code change cần thiết
- ESCALATE: cần probe API + agent-fix-gf-accounting / agg-garage-graph verify CRE-002 snapshot

## 6. Regression Test (Proposed)

`bug_w02_059_dossier_qt_bh_only_test.dart`:
```dart
testWidgets('DossierSettlementSheet — chỉ hiển thị payer=INSURANCE items', (tester) async {
  final settlement = _mockSettlementDetail(items: [
    ServiceOrderItemV3(serviceName: 'BH service', payer: PayerType.insurance, finalAmount: 100),
    ServiceOrderItemV3(serviceName: 'KH service', payer: PayerType.customer, finalAmount: 50),
    ServiceOrderItemV3(serviceName: 'Unknown', payer: null, finalAmount: 30),
  ]);
  await tester.pumpWidget(_pump(settlement));
  expect(find.text('BH service'), findsOneWidget);
  expect(find.text('KH service'), findsNothing);
  expect(find.text('Unknown'), findsNothing);
  // Tổng = chỉ BH
  expect(find.text('100đ'), findsOneWidget);  // total row
});
```

## 7. Status

NEEDS DATA-SOURCE VERIFICATION — escalate API probe + agent-fix-gf-accounting if BE snapshot wrong. Mobile filter đã correct.
