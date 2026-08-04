# BUGFIX BUG-W02-060 — Dossier list subtitle "Phiếu báo giá" hiển thị mã SET- thay vì PDV-

> **Status**: ALREADY FIXED (commit acff54f8 — quotationSheet subtitle uses serviceOrderCode).
> **Authored by**: agent-fix-garage-mobile (W02 FIX cycle 2026-06-24).
> **Related**: BUG-W02-025 (DossierQuotationSheetPage detail screen).

---

## 1. Failure Mode

Màn "Hồ sơ bảo hiểm" (mobile, Tạo hồ sơ BH) — dòng phụ (subtitle) của "Phiếu báo giá" hiển thị mã phiếu QT (SET-…) thay vì mã phiếu dịch vụ (PDV-…). BA chốt 2026-06-24: báo giá tham chiếu phiếu dịch vụ → phải hiển thị mã PDV.

## 2. Root Cause Analysis — Already Fixed

`mobile/gf-garage-app/lib/ui/insurance_dossier/utils/dossier_doc_type_display.dart:23` (HEAD):
```dart
String subtitle(String settlementCode, {String? serviceOrderCode}) => switch (this) {
      InsuranceDossierDocType.settlementSheet => settlementCode,
      InsuranceDossierDocType.quotationSheet => serviceOrderCode ?? settlementCode,
      ...
    };
```

**Already fixed** trong commit `acff54f8` "fix(BUG-6): quotationSheet sub-name dùng serviceOrderCode thay vì settlementCode".

Caller `insurance_dossier_page.dart:71-74`:
```dart
DossierDocumentTile(
  ...
  subtitle: docType.subtitle(
    state.settlementCode ?? widget.settlementCode,
    serviceOrderCode: state.settlement?.serviceOrderCode,
  ),
  ...
)
```

→ Pass `serviceOrderCode` từ `state.settlement?.serviceOrderCode` (lưu từ `getSettlementByCode` response). Field exists trong `SettlementDetailResponse.serviceOrderCode` (line 35).

## 3. Why Bug Still OPEN

Bug filing report đến từ build trước fix (acff54f8). Cần verify lại trên build HEAD trước khi assert RESOLVED.

⚠️ **Spec gap**: AC-3 source FEAT + mobile tier-spec + Figma oracle vẫn ghi SET → cần BA cập nhật **SET → PDV** (qua `/gen-ep-feat`) để impl + spec hội tụ. **OUT-OF-SCOPE per user 2026-06-24**.

## 4. Touched Files (FIX: ALREADY APPLIED)

- `mobile/gf-garage-app/lib/ui/insurance_dossier/utils/dossier_doc_type_display.dart` (commit acff54f8)
- `mobile/gf-garage-app/lib/ui/insurance_dossier/insurance_dossier_page.dart` (commit acff54f8 — caller passes serviceOrderCode)

## 5. Regression Test (Proposed)

`bug_w02_060_dossier_subtitle_baogia_test.dart`:
```dart
testWidgets('Phiếu báo giá subtitle = serviceOrderCode (PDV) khi có', (tester) async {
  final settlement = _mockSettlementDetail(serviceOrderCode: 'PDV-001');
  await tester.pumpWidget(_pumpDossierPage(settlement: settlement, settlementCode: 'SET-002'));
  // Subtitle row của Phiếu báo giá
  expect(find.text('PDV-001'), findsOneWidget);
});

testWidgets('Phiếu báo giá subtitle fallback settlementCode khi serviceOrderCode null', (tester) async {
  final settlement = _mockSettlementDetail(serviceOrderCode: null);
  await tester.pumpWidget(_pumpDossierPage(settlement: settlement, settlementCode: 'SET-002'));
  expect(find.text('SET-002'), findsOneWidget);
});
```

## 6. Status

ALREADY FIXED (acff54f8). Pending: live verification on HEAD build + regression test add. Bug filing date precedes fix commit — likely outdated.
