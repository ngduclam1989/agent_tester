# BUGFIX — BUG-W03-181

> Title mã code (chữ xanh `AppColors.textActivePrimary`) trên `InternalProductDetailPage` và `MaterialGroupDetailPage` render `<code>` bare (VD `SP001`) thay vì `#<code>` (`#SP001`) — lệch với List card (đã render `#<code>`).
> Severity: **P3** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-07

## 1. Summary

Cluster 2-page cùng bug row (đồng-pattern/đồng-layer/đồng-fix). Cả `InternalProductDetailPage._GeneralInfoCard` (`Text(detail.code ?? '--')`) và `MaterialGroupDetailPage._SummaryHeader` (`Text(detail.code ?? '--')`) đều render mã code không có `#` prefix, trong khi List card của cùng feature — `internal_product_list_card.dart:43` `'#${product.code}'` và `group_list_card.dart:48` `'#${group.code}'` — đã convention `#<code>` từ trước. Fix chỉ đổi expression format trong widget tree, không đụng model / query / cubit.

## 2. Root cause

Direct source read (per `LL-MOB-018` — không trust prompt/summary, re-derive độc lập):

- `lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_page.dart:163` — `Text(detail.code ?? '--', style: ...)` bare.
- `lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart:211` — `Text(detail.code ?? '--', style: ...)` bare.
- Không có Business Rule nào cấm `#` prefix; đây thuần là **display convention drift** giữa 2 màn cùng feature (List đã `#`, Detail chưa align).
- Field `code` là scalar `String?` trên `InternalProductDetail` / `MaterialGroupDetail`, đang được fetch đúng qua `getInternalProduct` / `getMaterialGroup` — không cần đổi query/model.

Cluster 2 FEAT vào cùng bug row hợp lệ vì đồng-widget-pattern (`_SummaryHeader` / `_GeneralInfoCard` → `Text` blue title), đồng-layer (mobile FE only), đồng-fix (add `#` prefix).

## 3. Fix

Đổi cả 2 callsite từ:

```dart
Text(detail.code ?? '--', style: AppTextStyle.textHeadingH4.copyWith(color: AppColors.textActivePrimary))
```

sang:

```dart
Text(detail.code != null ? '#${detail.code}' : '--', style: AppTextStyle.textHeadingH4.copyWith(color: AppColors.textActivePrimary))
```

**Chi tiết:**

- **`lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_page.dart:163`** — sửa `Text(detail.code ?? '--', ...)` thành `Text(detail.code != null ? '#${detail.code}' : '--', ...)`. Style không đổi.
- **`lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart:211`** — same transform tại `_SummaryHeader` `Column`.

**Fallback `'--'`** giữ nguyên cho `code == null` — không hiện `#` trên placeholder (nhất quán semantics: `#` chỉ đi kèm mã thật).

**Scope note**: KHÔNG đụng:
- `internal_product_list_card.dart` / `group_list_card.dart` (đã đúng).
- `InternalProductDetail.code` / `MaterialGroupDetail.code` (field scalar; format là concern của UI, không phải model).
- Query `getInternalProduct` / `getMaterialGroup` (không đổi selection set).
- Style `AppTextStyle.textHeadingH4` / `AppColors.textActivePrimary` (không đổi typography/color).
- Đối tượng `Semantics(identifier: 'row-...')` ở List card (giữ nguyên identifier không có `#`).

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_page.dart` | `_GeneralInfoCard` header `Text(detail.code ...)` → `#${detail.code}` prefix |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart` | `_SummaryHeader` title `Text(detail.code ...)` → `#${detail.code}` prefix |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_detail/internal_product_detail_bug_181_test.dart` | **New** — regression test static-source assertion (2 assertion) |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_detail/material_group_detail_bug_181_test.dart` | **New** — regression test static-source assertion (2 assertion) |

## 5. Regression / verification

Static-source-assertion pattern (không widget-pump) — cùng convention với bug regression đã có ở 2 folder này (BUG-W03-053, BUG-W03-072, BUG-W03-081, BUG-W03-174). Rationale: đây là display-formatting-only fix, không có logic branch, không có state emission thay đổi; static assertion đủ chặn revert.

**Assertions (mỗi test file 2 assertion):**

- `internal_product_detail_bug_181_test.dart`:
  - `source.contains("detail.code != null ? '#\${detail.code}' : '--'")` → `isTrue` (post-fix expression pinned).
  - `source.contains("Text(detail.code ?? '--',")` → `isFalse` (guard revert).
- `material_group_detail_bug_181_test.dart`:
  - `source.contains("detail.code != null ? '#\${detail.code}' : '--'")` → `isTrue`.
  - `source.contains("Text(\n                    detail.code ?? '--',")` → `isFalse` (guard revert; multi-line form chuyên biệt tại slot title `_SummaryHeader`).

**Không golden test** cho fix này — Test Coverage Contract §UI render yêu cầu golden cho UI render change, nhưng đây là **1-token diff** trong expression string (không đổi widget tree structure, style, layout). Static assertion đủ. Nếu golden infra convenient, có thể add sau (`goldens/ci/` + `goldens/macos/`) — flagged in §7 needs_review.

**Không đổi shared symbol** — sửa tại call-site cụ thể của mỗi page, không đụng widget dùng chung, không cần chạy Shared-Symbol Gate.

**Build / analyze / test verify: DEFERRED** — `which fvm` / `which flutter` đều trống trên máy design-repo (`DEBT-W01-MOBILE-BUILD-ENV` vẫn có hiệu lực). Cả 2 file page và 2 file test đã được re-read end-to-end verify:
- Dart syntax: expression ternary `detail.code != null ? '#${detail.code}' : '--'` hợp lệ; `String.interpolation` chuẩn.
- Type: `detail.code` là `String?`; ternary kiểu quyết định là `String`; `Text(...)` nhận `String` — không có type-mismatch.
- Import: không cần import thêm — dùng nguyên các import sẵn có (`AppTextStyle`, `AppColors`).

**KG update**: skipped — không có entity/route/cubit/event/permission mới; chỉ đổi UI display format của 1 field scalar đã có.

## 6. Non-goals / out of scope

- Không đổi List card format (đã đúng).
- Không đổi `Semantics(identifier: 'row-product-${product.code}...')` — identifier layer là a11y hook, format `#` không cần thiết ở đây.
- Không đổi List → Detail navigation, không đổi router.
- Không phủ golden test đầy đủ cho 2 Detail page (chỉ static-source assertion) — golden path đề xuất riêng trong `needs_review` khi fvm toolchain khôi phục.

## 7. Needs review

| File | Concern |
|---|---|
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_detail/internal_product_detail_bug_181_test.dart` | Static-source-only. Khi fvm toolchain khôi phục, cân nhắc bổ sung golden pump (`_GeneralInfoCard` render với mock `detail.code = 'SP001'` → `find.text('#SP001')`) — theo Test Coverage Contract §UI render. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_detail/material_group_detail_bug_181_test.dart` | Same — golden pump `_SummaryHeader` với `detail.code = 'NVT001'` → `find.text('#NVT001')`. |
| Design source Figma | Chưa PNG-verify prefix `#` có trong Figma Detail node vs. UI convention từ List. Nếu Figma Detail node ghi rõ "bare code" (không `#`), fix này là UI-convention override → cần Business Authority ratify. Reporter (mobile dev) đã cite requirement "match List card" — mặc định coi là intent user-endorsed. |

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-07 | 1 | agent-fix-garage-mobile | Fix — thêm `#` prefix cho title mã code trên 2 Detail page (`InternalProductDetailPage._GeneralInfoCard` + `MaterialGroupDetailPage._SummaryHeader`), đồng nhất với List card đã render `#<code>`. 2 regression test static-source (4 assertion). `flutter analyze` / `flutter test` DEFERRED (no fvm — DEBT-W01-MOBILE-BUILD-ENV). KG update skipped. Không đụng model / query / shared widget. |
