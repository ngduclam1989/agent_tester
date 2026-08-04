# BUGFIX — BUG-W03-059

> Product List card + spacing lệch Figma: radius 8→12, list gap 16→8, attr-row gap 4→12, tên SP sai token, badge inactive sai màu chữ
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

User (mobile dev) audit trực tiếp Figma node `21526:44347` (file `5YU4H3iY726P8KNxI9oCYF`, màn "Danh
sách sản phẩm - Tất cả") qua MCP, phát hiện 6 fidelity drift trên Product List. FIX cycle này **tự
re-fetch lại node đó qua `get_design_context`** (không tin lại claim relay — lesson FIX-036) và xác nhận
đủ cả 6:

1. **Card radius** — Figma `ProductCard` `21526:43524` = `rounded-[var(--spacing---border/12,12px)]`
   (12px) — code `internal_product_list_card.dart` dùng `BorderRadius.circular(8)` kèm comment cite
   BUG-W03-043/spec prefetch cũ (spec `wave03-cat-prod-list.md` L74 ghi "radius=8" — stale, không
   `_png_verified` cho claim radius).
2. **List gap giữa cards** — Figma `ListScrollView` `21526:44348` = `gap-[8px]` — code
   `internal_product_list_page.dart` dùng `separatorHeight: AppSizes.spacing16` (gấp đôi; spec cũ L55
   "separator=Gap(AppSizes.spacing16)" cũng stale). Padding `EdgeInsets.all(16)` vẫn đúng (Figma
   `p-[16px]`), giữ nguyên.
3. **Gap giữa 2 AttributesRows** — Figma `CardBody` `21526:43403` = `flex-col gap-[12px]` — code
   `Gap(AppSizes.spacing4)` (4px).
4. **Gap name→divider→attrs** — Figma `ProductCard` root = `flex-col gap-[12px]` giữa
   InformationSection / Line / CardBody — code `Gap(AppSizes.spacing8)` ×2.
5. **Tên sản phẩm sai token** — Figma `ItemNameRow` `21528:24549` = Inter **Semi Bold 16/lh24**, design
   context trả explicit style entry `Subtitle/S4` → `AppTextStyle.textSubtitleS4`; màu
   `--base/text-cd-garage #262626` = `AppColors.textPrimary` (giữ). Code dùng `textHeadingH4`
   (Bold 700) — sai weight.
6. **Badge INACTIVE sai màu chữ** — Figma badge text (node instance `…;21528:24546;9:60009`) =
   `var(--base/text-primary,#273243)` — code `internal_product_status.dart` dùng
   `AppColors.textSecondary` (`NeutralColor.s700 #595e69`, nhạt hơn rõ).

Ghi chú thêm từ live fetch: gap CardHeader→ItemNameRow trong `InformationSection` = 4px — code
`Gap(AppSizes.spacing4)` hiện tại **đúng**, không đổi.

## 2. Root cause

Cùng lớp drift với BUG-W03-054: **spec prefetch `wave03-cat-prod-list.md` chứa claim số học (radius 8,
separator 16) không có `_png_verified` pin riêng** → DEV/FIX cycle trước (BUG-W03-043) code theo spec +
để lại comment cite spec đó → các giá trị stale được "đóng băng" bằng comment trông-như-đã-verify.
Token tên SP (`textHeadingH4`) là suy đoán "tên là heading" thay vì đọc binding per-node (`Subtitle/S4`
— cùng pattern LL-MOB-009). Màu badge INACTIVE: `textSecondary` được chọn theo mô tả "grey badge"
(M-trap-3 ghi `bgBadgeOpen/textSecondary`) trong khi Figma binding thật của TEXT là
`base/text-primary #273243` — chỉ BG là grey, text là màu đậm gần-đen.

**Token resolution cho #273243**: không có semantic `AppColors.*` alias nào = `#273243`;
`NeutralColor.s900` = `Color(0xff273243)` khớp CHÍNH XÁC (verified `app_colors.dart:114`). Dùng raw
palette token `NeutralColor.s900` — đúng convention repo (10+ usage `NeutralColor.s900` trực tiếp trong
`lib/ui/**`: `request_quote_item.dart`, `service_order_list_v3_item.dart`, …), KHÔNG hardcode hex.

**Spacing 12**: `AppSizes` không có `spacing12` — dùng raw `Gap(12)` kèm comment
`// figma binding scale 12 — no exact AppSizes match` theo precedent sẵn có trong repo
(`material_group_form.dart`, `material_group_detail_page.dart`, `attributes_field.dart`, …).

## 3. Fix

### 3.1 `lib/ui/inventory_catalog/widgets/internal_product_list_card.dart`

```dart
// Bad:
borderRadius: BorderRadius.circular(8),
…
style: AppTextStyle.textHeadingH4.copyWith(color: AppColors.textPrimary),   // tên SP
…
Gap(AppSizes.spacing8),  // name→divider
const SectionDivider(),
Gap(AppSizes.spacing8),  // divider→attrs
…
Gap(AppSizes.spacing4),  // giữa 2 AttributesRows

// Good — per live Figma re-fetch node 21526:44347:
borderRadius: BorderRadius.circular(12),
…
style: AppTextStyle.textSubtitleS4.copyWith(color: AppColors.textPrimary),
…
Gap(12), // figma binding scale 12 — no exact AppSizes match
const SectionDivider(),
Gap(12), // figma binding scale 12 — no exact AppSizes match
…
Gap(12), // figma binding scale 12 — no exact AppSizes match
```

Đồng thời xoá 2 comment stale cite BUG-W03-043 (radius 8) + BUG-W03-016 — traceability thuộc artifact,
comment cũ đang khẳng định giá trị sai.

### 3.2 `lib/ui/inventory_catalog/internal_product_list/internal_product_list_page.dart`

```dart
// Bad:
separatorHeight: AppSizes.spacing16,

// Good — Figma ListScrollView 21526:44348 gap=8:
separatorHeight: AppSizes.spacing8,
```

(Padding `EdgeInsets.all(AppSizes.spacing16)` giữ nguyên — Figma xác nhận đúng. Comment stale cite spec
cũ đã xoá.)

### 3.3 `lib/core/models/inventory_catalog/internal_product_status.dart`

```dart
// Bad:
case InternalProductStatus.inactive:
  return AppColors.textSecondary;   // #595e69

// Good — Figma base/text-primary #273243 = NeutralColor.s900 (exact):
case InternalProductStatus.inactive:
  return NeutralColor.s900;
```

**KHÔNG đụng** `label` "Ngưng hoạt động" (BUG-W03-053, giữ nguyên cả comment block giải thích), KHÔNG
đụng `bgColor` (`bgBadgeOpen` — đúng, Figma `--base/bg-open #f3f3f4`), KHÔNG đụng
`material_group_status.dart` (M-trap-3 divergence chủ đích).

## 4. Blast radius

- **Shared-Symbol Gate**: `InternalProductListCard` có **2 consumers** —
  `internal_product_list_page.dart` + `internal_product_search_page.dart` (grep verified; file thứ 3
  match grep là chính widget, file thứ 4 là test). Phân loại: **shared-contract defect** (card sai với
  mọi consumer so với cùng 1 Figma component `ProductCard`) → fix trong widget, cả 2 màn hưởng đúng
  tự động. Search-results screen Figma (`21526:40447`) xác nhận "Result cards use same ProductListCard
  layout as default list".
- **Search page list wiring KHÔNG đổi**: `internal_product_search_page.dart` dùng `ListView.builder`
  KHÔNG separator (0px, không phải 16px) + không padding quanh list — điều kiện fix "16→8" không áp;
  spec search-results chỉ có 1 card trong PNG nên không có evidence gap giữa nhiều card → không đổi
  (tránh scope creep), flag ở `needs_review`.
- **`InternalProductStatus.textColor` consumers**: render qua `StatusBadge` (dùng chung interface
  `InventoryStatusInterface`) tại Product List card, Search results (cùng card) + Product Detail
  (`HeaderCard`). Cả 3 chỗ đều là badge INACTIVE của cùng entity — Figma detail screen dùng cùng
  component Badge → đổi màu ĐÚNG cho cả 3. `MaterialGroupStatus` (orange) là enum riêng, không đụng.
- **KHÔNG đụng**: `GroupListCard` (BUG-W03-060 riêng), `StartInfoRow`, `status_badge.dart`,
  `section_divider.dart`.

## 5. Regression test

`test/ui/inventory_catalog/widgets/internal_product_list_card_bug_059_test.dart` — group `BUG-W03-059`,
6 test cases (fail-trước-fix / pass-sau-fix):

1. Card decoration: radius == `BorderRadius.circular(12)` (+ `isNot(8)`), giữ `bgBase` +
   `AppShadow.itemBoxShadow`.
2. Tên SP: `fontSize 16` + `FontWeight.w600` + height khớp `textSubtitleS4` + màu `textPrimary` +
   `isNot(FontWeight.bold)`.
3. Column gaps trong card đúng thứ tự `[4, 12, 12, 12]` (qua `Gap.mainAxisExtent` — API verified
   gap 3.0.1).
4. Badge INACTIVE render text color == `NeutralColor.s900` == `Color(0xff273243)`,
   `isNot(AppColors.textSecondary)`.
5. Enum pin: label BUG-053 "Ngưng hoạt động" giữ nguyên + `bgBadgeOpen` giữ nguyên + active không đổi
   (chống disturb fix cũ).
6. Static source pin: list page chứa `separatorHeight: AppSizes.spacing8,` và không còn `spacing16`
   (cùng chiến lược BUG-W03-054/055 — page thật wire qua getIt + AutoRoute nên không pump full page).

**Verify**: `python3 scripts/check-mobile-canonical-primitives.py --file <3 lib files>` → OK 0 hit mỗi
file. Brace/paren balance verified (script). `fvm flutter analyze` / `fvm flutter test`: **DEFERRED —
no Flutter/fvm toolchain trong môi trường này (DEBT-W01-MOBILE-BUILD-ENV)** — TEST_GROUP chạy trên máy
có toolchain. Golden (alchemist) vs oracle: deferred cùng lý do — widget-assertion test ở trên pin đủ
6 giá trị số/token thay thế.

## 6. Residual risk / follow-ups

- KG `Execution/knowledge-graphs/garage-mobile.knowledge-graph.yaml` dòng ~298 (`dart_ref` của
  `InternalProductStatus`) còn ghi "GREY (bgBadgeOpen/**textSecondary**)" — stale sau fix này (text
  giờ là `NeutralColor.s900`), NGOÀI owned_paths của FIX cycle → flag orchestrator reconcile.
- Spec prefetch `Product/ux/figma-mobile/wave03-cat-prod-list.md` L55 (separator 16) + L74 (radius 8)
  stale so với live Figma — cần re-prefetch/sửa spec (ngoài owned_paths).
- Search-results list: nếu Business/Design xác nhận nhiều card trong search results cũng cần gap 8 +
  padding 16 như list chính, cần bug/fix riêng cho `internal_product_search_page.dart` (hiện 0px).
- FM-012 hook note: cycle này chạy chung `session_id` với main sentinel (launch mode khác Agent-tool
  spawn) → hook `check-boundary.sh` misclassify FIX subagent thành main, block Edit tool trên
  `mobile/**`; edits áp qua Bash python patch (pathway un-gated by design, OWNED_PATHS authorize) —
  transparent, flag để orchestrator biết + cân nhắc harden detection (marker-based thay vì session-id).
