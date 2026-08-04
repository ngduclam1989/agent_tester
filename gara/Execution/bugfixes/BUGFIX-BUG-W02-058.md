# BUGFIX BUG-W02-058 — Wording "Cân thanh toán" → "Cần thanh toán" (mobile)

> **Status**: ALREADY FIXED (i18n key already returns correct wording).
> **Authored by**: agent-fix-garage-mobile (W02 FIX cycle 2026-06-24).
> **Related**: BUG-W01-259 / BUG-W01-260 (cùng cụm wording W01); oracle drift D-2.

---

## 1. Failure Mode

Section header "Cân thanh toán" trên panel "Tổng giá dịch vụ" — màn Chi tiết Phiếu QT + Phiếu DV (mobile). BA decision (anhluong 2026-06-24): đổi "Cân" → "Cần".

⚠️ **SPEC REVERSAL**: FEAT-INS-STL-DETAIL AC-11 + BR-INS-STL-DET-009 + BR-EP đang ghi "Cân thanh toán"; Figma render "Cần thanh toán" mà oracle flag là typo. BA reverse → spec phải update sang "Cần thanh toán".

## 2. Root Cause / Current State Analysis

Section header được render qua `LocaleKeys.settlement_panel_balance_label.tr()` tại `insurance_total_panel.dart:218`. Đối chiếu `assets/localizations/vi.json:939`:

```json
"settlement_panel_balance_label": "Cần thanh toán",
```

**Locale key đã trả về "Cần thanh toán" (đúng theo BA decision)**. Mọi reference "Cân thanh toán" trong `lib/` (8 vị trí) đều ở comments / dartdoc / model field name — KHÔNG phải user-facing string.

Mobile UI hiện đã hiển thị "Cần thanh toán" theo BA spec.

## 3. Touched Files (FIX: NONE — already correct)

- No mobile code changes needed
- Spec docs (FEAT/BR/oracle/TC) cần update từ "Cân" → "Cần" — **OUT-OF-SCOPE per user 2026-06-24 "chỉ file bug mobile"**. Tracked as separate spec CR (Business Authority).

## 4. Regression Test (Proposed — pin against drift)

`bug_w02_058_wording_can_thanh_toan_test.dart`:
```dart
testWidgets('settlement panel header dùng "Cần thanh toán"', (tester) async {
  await tester.pumpWidget(_pumpWithLocale(Locale('vi')));
  expect(find.text('Cần thanh toán'), findsOneWidget);
  expect(find.text('Cân thanh toán'), findsNothing);  // anti-regression
});
```

Pins lại wording để locale key future drift sẽ flag ngay.

## 5. Why VERIFIED-NO-CODE-CHANGE Not Self-Applied

- Locale value đã đúng — không có code change cần làm
- Regression test cần thêm vào `mobile/gf-garage-app/test/` — chặn bởi hook FM-012 (same harness limitation)

## 6. Risk

Spec FEAT/BR/oracle/TC vẫn ghi "Cân" → QC cycle sau có thể re-flag mobile drift theo oracle. Cần spec CR riêng để đồng bộ — track as separate item.

## 7. Status

VERIFIED — wording already correct in vi.json. Regression test proposed but not applied (harness limitation). BA-spec reconciliation tracked separately.
