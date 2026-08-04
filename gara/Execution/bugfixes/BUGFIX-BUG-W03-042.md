# BUGFIX — BUG-W03-042

> `material_group_detail_page.dart` header thiếu caption "Ngày tạo" + 2 row Ngày tạo/Ngày sửa hiển thị raw ISO timestamp thay vì `dd/MM/yyyy HH:mm`
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

`material_group_detail_page.dart` (FEAT-CAT-GRP-DETAIL) có 2 vấn đề fidelity, cả 2 do orchestrator cross-check user-supplied screenshot `reports/screens/inventory/material-group/mg-detail.png` với `Product/ux/figma-mobile/wave03-cat-grp-detail.md` + live source:

1. `_SummaryHeader` (widget nội bộ cuối file) render `Row[Expanded(Text code), StatusBadge]` — group code nằm trực tiếp trong `Row`, KHÔNG bọc trong `Column` cùng dòng caption nhỏ "Ngày tạo: {date}" như Figma spec yêu cầu (`wave03-cat-grp-detail.md` dòng 41-46, 80-83: widget tree `Column[Text code, Text "Ngày tạo: 21/07/2025 20:12" → C7 textTertiary]` là left block của header Row, `StatusBadge` là right sibling).
2. 2 `StartInfoRow` "Ngày tạo"/"Ngày sửa" bind trực tiếp `detail.createdAt ?? '—'` / `detail.updatedAt ?? '—'` — 2 field này là raw `String?` ISO8601 trả về từ API (`MaterialGroupDetail`, `material_group_models.dart:63,66`, không qua bất kỳ transform nào) → hiển thị y hệt chuỗi thô (vd `"2026-07-01T07:01:33.583016Z"`) thay vì format người-đọc-được `dd/MM/yyyy HH:mm` (Figma spec dòng 55/57/112: `"10/10/2025 10:24"`).

## 2. Root cause

- Header: DEV cycle ban đầu render `code` như 1 `Text` phẳng bên trong `Row`, không đối chiếu đủ sâu widget tree Figma (2 nested levels: `Row > Column > [Text, Text]` + `Row > Badge`) — chỉ lấy đúng 2 phần tử top-level (code, badge) mà bỏ sót phần tử thứ 3 (caption) vốn nằm *bên trong* Column con, không phải sibling ngang hàng dễ nhận ra khi lướt spec nhanh.
- Timestamp format: model field `createdAt`/`updatedAt` là raw ISO8601 `String?` — page bind thẳng field này vào `StartInfoRow.value` mà không qua bất kỳ formatter nào. Repo đã có `DateFormatter` (`lib/core/formater/date_formatter.dart`) nhưng tại thời điểm viết trang này chỉ có const `ddMMYYYY` ('dd/MM/yyyy', không giờ:phút) — không có const phù hợp cho pattern `dd/MM/yyyy HH:mm` mà Figma yêu cầu, nên có khả năng DEV bind tạm raw string rồi quên quay lại bổ sung format khi const mới được thêm. Cùng root cause class với các bug format trước đó trong wave (dùng field API trực tiếp thay vì qua presentation-layer transform).

## 3. Fix

### 3.1 `date_formatter.dart` — thêm const mới

```dart
class DateFormatter {
  DateFormatter._();

  static const String ddMMYYYY = 'dd/MM/yyyy';
  static const String ddMMYYYYHHmm = 'dd/MM/yyyy HH:mm';   // NEW
}
```

### 3.2 `material_group_detail_page.dart` — helper + 3 call site

Thêm import `intl` + `date_formatter.dart`, và 1 top-level guard helper (theo pattern `DateFormat(DateFormatter.ddMMYYYY).format(...)` đã dùng ở `employee_detail_helper.dart`):

```dart
String _formatDateTime(String? iso) {
  if (iso == null || iso.isEmpty) return '—';
  final parsed = DateTime.tryParse(iso);
  if (parsed == null) return '—';
  return DateFormat(DateFormatter.ddMMYYYYHHmm).format(parsed.toLocal());
}
```

Áp dụng cho cả 3 chỗ:

```dart
// (a) 2 StartInfoRow hiện có — value: detail.createdAt ?? '—'  →
StartInfoRow(
    label: LocaleKeys.common_createdAt.tr(),
    value: _formatDateTime(detail.createdAt)),
...
StartInfoRow(
    label: LocaleKeys.common_updatedAt.tr(),
    value: _formatDateTime(detail.updatedAt)),
```

### 3.3 `_SummaryHeader` — 2-cột đúng widget tree Figma + caption mới

```dart
Row(
  mainAxisAlignment: MainAxisAlignment.spaceBetween,
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(detail.code ?? '—',
              style: AppTextStyle.textHeadingH4
                  .copyWith(color: AppColors.textActivePrimary)),
          Text(
            '${LocaleKeys.common_createdAt.tr()}: ${_formatDateTime(detail.createdAt)}',
            style: AppTextStyle.textCaptionC7
                .copyWith(color: AppColors.textTertiary),
          ),
        ],
      ),
    ),
    StatusBadge(status: detail.status),
  ],
),
```

`LocaleKeys.common_createdAt` (giá trị "Ngày tạo") đã tồn tại sẵn (dùng lại ở 2 `StartInfoRow` label khác trong cùng file) — ghép `"${label}: ${value}"` cho ra verbatim đúng Figma copy "Ngày tạo: {date}" mà không cần thêm locale key mới; không cần sửa `assets/localizations/{vi,en}.json`.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/core/formater/date_formatter.dart` | Thêm const `ddMMYYYYHHmm = 'dd/MM/yyyy HH:mm'` |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart` | Import `intl` + `date_formatter.dart`; thêm top-level `String _formatDateTime(String? iso)` guard helper; `_SummaryHeader` header `Row` restructure thành `Row(mainAxisAlignment: spaceBetween, crossAxisAlignment: start)` bọc `Expanded(Column[Text code, Text caption])` + `StatusBadge`; 2 `StartInfoRow` (Ngày tạo/Ngày sửa) đổi `value: detail.createdAt ?? '—'` / `detail.updatedAt ?? '—'` → `value: _formatDateTime(detail.createdAt)` / `_formatDateTime(detail.updatedAt)` |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_detail/material_group_detail_fidelity_test.dart` | **New** — regression test (widget-tree reconstruction of fixed `_SummaryHeader` body + formatter unit test cases + static source assertion) |

## 5. Regression / verification

- `_SummaryHeader` và `_formatDateTime` đều `private` (Dart library-level privacy) — không thể import trực tiếp từ file test khác. Test reconstructs the fixed widget-tree fragment verbatim (same tokens/widgets) trong một `_SummaryHeaderFixture` cục bộ, cộng với 1 bản mirror cục bộ của `_formatDateTime` cho unit-test guard logic, cộng với static source-string assertion trên file thật để pin đúng fix — cùng chiến lược 3 lớp đã dùng ở BUG-W03-021/024/030/032/036/040/041.
- Test coverage:
  1. `_formatDateTime` mirror: valid ISO → `dd/MM/yyyy HH:mm` (regex match, không còn `T`/`Z`); `null` → `'—'`; `''` → `'—'`; unparseable string → `'—'`.
  2. Widget test: header `Row` là `mainAxisAlignment: spaceBetween` + `crossAxisAlignment: start`; left block là `Column` chứa cả `Text` code lẫn `Text` caption; caption text match `Ngày tạo: dd/MM/yyyy HH:mm` (regex), KHÔNG chứa fragment raw ISO (`T07:01:33`); caption style color = `AppColors.textTertiary`; `StatusBadge` tồn tại đúng 1 lần như sibling; toàn bộ tree sweep (`find.textContaining`) xác nhận KHÔNG có widget nào còn render raw ISO string.
  3. Static source assertion trên `material_group_detail_page.dart`: chứa `DateFormatter.ddMMYYYYHHmm`, `DateTime.tryParse(iso)`, caption string pattern verbatim, `AppTextStyle.textCaptionC7`, `mainAxisAlignment: MainAxisAlignment.spaceBetween`; cả 2 `StartInfoRow` dùng `_formatDateTime(...)`; KHÔNG còn `value: detail.createdAt ?? '—'` / `value: detail.updatedAt ?? '—'` (raw passthrough đã xoá).
  4. `DateFormatter.ddMMYYYYHHmm == 'dd/MM/yyyy HH:mm'` (const value pin).
- `python3 scripts/check-mobile-canonical-primitives.py --file mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart` → **OK: 0 anti-pattern hit**.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — không có `fvm`/`flutter`/`dart` toolchain trong environment này (`DEBT-W01-MOBILE-BUILD-ENV`). Đã tự verify bằng mắt: `intl`/`DateFormat` + `DateFormatter` đã là dependency/class có sẵn trong repo (dùng nguyên xi pattern từ `employee_detail_helper.dart:105` — `DateFormat(DateFormatter.ddMMYYYY).format(...)`), `AppTextStyle.textCaptionC7` + `AppColors.textTertiary` đã tồn tại trong design-system (`app_text_styles.dart:340`), `LocaleKeys.common_createdAt`/`common_updatedAt` đã tồn tại + đã dùng ở chính file này trước fix. Brace/paren/bracket balance verified thủ công bằng script đếm ký tự (`(){}[]`) trên cả 3 file sửa/mới — cân bằng. TEST_GROUP phải chạy lại trên máy có toolchain trước khi flip `VERIFIED`.

## 6. Non-goals / out of scope

- KHÔNG đụng PROD detail (`internal_product_detail_page.dart` hoặc tương đương) — đã xác nhận trước khi bắt đầu fix: product detail KHÔNG hiển thị `createdAt`/`updatedAt`, bug này không áp dụng.
- KHÔNG thêm locale key mới — tái dùng `LocaleKeys.common_createdAt` ("Ngày tạo") đã tồn tại, ghép chuỗi `"${label}: ${value}"` cho ra đúng verbatim Figma copy "Ngày tạo: {date}"; không sửa `assets/localizations/{vi,en}.json`.
- KHÔNG đổi `_DetailFooter`, `StartInfoRow`/`StatusBadge` widget class definition, hay bất kỳ cubit/state logic nào — chỉ đổi phần render/format trong `material_group_detail_page.dart` + thêm 1 const trong `date_formatter.dart`.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — thêm `DateFormatter.ddMMYYYYHHmm`; thêm `_formatDateTime()` guard helper trong `material_group_detail_page.dart`; `_SummaryHeader` header Row restructure 2-cột (Column[code, caption] + StatusBadge) theo đúng Figma widget tree; áp `_formatDateTime` cho caption mới + 2 `StartInfoRow` Ngày tạo/Ngày sửa hiện có. Regression test mới (widget-tree reconstruction + unit + static source assertion). `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
