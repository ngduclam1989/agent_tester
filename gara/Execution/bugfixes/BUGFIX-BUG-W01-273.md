# BUGFIX BUG-W01-273 — Mobile Create/Edit SO: per-line "Bên thanh toán" dropdown clipped by stepper

> **Status**: VERIFIED (fix present in working tree, pending re-test live).
> **Severity**: P2.
> **Boundary**: garage-mobile.
> **Authored by**: agent-fix-garage-mobile (Wave 01).
> **Related**: memory `overlay-issue` (DropdownWidget bị StepperV3 che trong SO creation v3).

---

## 1. Failure mode

Trên màn Tạo mới / Chỉnh sửa Phiếu dịch vụ (SO creation V3), dropdown "Bên thanh toán"
per dòng (service item + part item) mở ra nhưng popup menu bị **clip bởi parent scroll
view / StepperV3** — user không thấy đủ list và không tương tác (chọn payer) được.

## 2. Root cause

Chuỗi widget: `DropdownTextField` (`lib/ui/widgets/text_field/dropdown_text_field.dart`)
→ `_RawDropdownTextField` → `DropdownWidget`
(`lib/ui/inventory/inventory_filter/widgets/dropdown_widget.dart`).

`DropdownWidget` insert menu qua `Overlay.of(context)` — resolve về Overlay của tab/stepper
Navigator (PersistentTabView / StepperV3) thay vì **root Overlay**, nên menu nằm trong cây
bị clip bởi scroll view của step "Hạng mục".

## 3. Fix

`lib/ui/inventory/inventory_filter/widgets/dropdown_widget.dart:169`

```dart
// before
Overlay.of(context).insert(_overlayEntry!);
// after
Overlay.of(context, rootOverlay: true).insert(_overlayEntry!);
```

Menu mount lên root Overlay → hiển thị phía trên stepper, không bị clip. Vì
`DropdownTextField`/`DropdownWidget` là shared primitive, fix này phục vụ mọi consumer
(payer dropdown SO V3 + các nơi dùng DropdownTextField khác).

## 4. Blast radius / don't-touch

- **Touched**: `dropdown_widget.dart:169` (1 dòng — thêm `rootOverlay: true`).
- **Don't-touch**: `offset` / anchor (`CompositedTransform*`) logic; các consumer dropdown
  khác không đổi behavior (chỉ đổi lớp Overlay đích, vị trí giữ nguyên theo `menuOffset`).

## 5. Regression test

Smoke (Patrol/widget): mở SO Create BH=Có, scroll list Hạng mục, tap dropdown "Bên thanh
toán" trên 1 part row → menu hiển thị đầy đủ + tap chọn được "I - Bảo hiểm". Lặp cho
service item. Verify menu không bị cắt bởi mép scroll view.

## 6. Status

OPEN → VERIFIED. L2: `Tracking/WAVE01/verify/BUG-W01-273.verify.md`.
